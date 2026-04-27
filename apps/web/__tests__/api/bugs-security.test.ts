import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

const mockAuth = mock();
mock.module("@/lib/auth", () => ({
  auth: mockAuth,
}));

mock.module("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
      __isMock: true,
    }),
  },
}));

// We must import the module dynamically to make sure the mocks above are applied
let POST: any;
let originalConsoleLog: any;

describe("POST /api/bugs security", () => {
  beforeEach(async () => {
    mockAuth.mockReset();
    originalConsoleLog = console.log;
    console.log = mock();

    // Reset the module to clear rate limit state if possible,
    // but since it's in-memory and not exported, we'll just test the behavior
    // and use different IPs if needed.
    const imported = await import("@/app/api/bugs/route");
    POST = imported.POST;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it("should rate limit requests from the same IP", async () => {
    const payload = { message: "Test bug" };
    const req = (ip: string) =>
      ({
        headers: {
          get: (name: string) => (name === "x-forwarded-for" ? ip : null),
        },
        json: async () => payload,
      }) as unknown as Request;

    const testIp = "1.2.3.4";

    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      const response = await POST(req(testIp));
      expect(response.status).toBe(201);
    }

    // 6th request should be rate limited
    const response = await POST(req(testIp));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe("Too many requests");
  });

  it("should enforce message length limits", async () => {
    const longMessage = "a".repeat(1001);
    const req = {
      headers: { get: () => "5.6.7.8" }, // Different IP to avoid rate limit
      json: async () => ({ message: longMessage }),
    } as unknown as Request;

    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe("Message too long");
  });

  it("should sanitize inputs for logging", async () => {
    const maliciousInput = "Line 1\nLine 2\r\nLine 3\tTabbed";
    const req = {
      headers: { get: () => "9.10.11.12" },
      json: async () => ({ message: maliciousInput }),
    } as unknown as Request;

    const response = await POST(req);
    expect(response.status).toBe(201);

    // Verify console.log was called with sanitized input
    // The expected sanitized string: "Line 1 Line 2 Line 3 Tabbed"
    // because \n, \r, \t are replaced by spaces and then multiple spaces collapsed.
    const calls = (console.log as any).mock.calls;
    const messageLog = calls.find((call: any[]) =>
      call[0].startsWith("Message: "),
    );
    expect(messageLog[0]).toBe("Message: Line 1 Line 2 Line 3 Tabbed");
  });
});
