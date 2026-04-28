import { describe, it, expect, mock, beforeEach } from "bun:test";

const mockAuth = mock();
mock.module("@/lib/auth", () => ({
  auth: mockAuth,
}));

mock.module("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

mock.module("@/lib/api/error", () => ({
  API_ERRORS: {
    customBadRequest: (msg: string) => ({ error: msg, status: 400 }),
    customInternal: (msg: string) => ({ error: msg, status: 500 }),
    UNAUTHORIZED: { error: "Unauthorized", status: 401 },
  },
  apiError: (err: any) => {
    return {
      status: err.status,
      json: async () => ({ error: err.error }),
    };
  },
}));

const createMockReq = (body: any, ip: string) => ({
  headers: {
    get: (name: string) => (name === "x-forwarded-for" ? ip : null),
  },
  json: async () => body,
} as unknown as Request);

describe("POST /api/bugs", () => {
  let POST: any;

  beforeEach(async () => {
    mockAuth.mockReset();
    const imported = await import("@/app/api/bugs/route");
    POST = imported.POST;
  });

  it("should successfully create a bug report", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
    const req = createMockReq({ message: "Test bug", stack: "stack", url: "url" }, "10.1.1.1");

    const response = await POST(req);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("should handle anonymous bug reports", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = createMockReq({ message: "Anon bug" }, "20.2.2.2");

    const response = await POST(req);
    expect(response.status).toBe(201);
  });

  it("should return bad request if message is missing", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = createMockReq({ stack: "stack" }, "30.3.3.3");

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Message is required");
  });
});
