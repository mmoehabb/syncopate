import {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
  setSystemTime,
} from "bun:test";
import { formatRelativeOrAbsoluteDate } from "../src/lib/utils/date";

describe("formatRelativeOrAbsoluteDate", () => {
  const MOCK_CURRENT_DATE = new Date("2024-01-15T12:00:00.000Z");

  beforeAll(() => {
    setSystemTime(MOCK_CURRENT_DATE);
  });

  afterAll(() => {
    setSystemTime(); // Restore system time
  });

  test("returns relative time for dates less than 3 days ago", () => {
    const oneDayAgo = new Date("2024-01-14T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(oneDayAgo)).toBe("1 day ago");

    const twoDaysAgo = new Date("2024-01-13T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(twoDaysAgo)).toBe("2 days ago");
  });

  test("returns absolute date for dates more than 3 days ago", () => {
    const fourDaysAgo = new Date("2024-01-11T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(fourDaysAgo)).toBe("Jan 11, 2024");

    const tenDaysAgo = new Date("2024-01-05T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(tenDaysAgo)).toBe("Jan 5, 2024");
  });

  test("handles string inputs correctly", () => {
    expect(formatRelativeOrAbsoluteDate("2024-01-14T12:00:00.000Z")).toBe(
      "1 day ago",
    );
    expect(formatRelativeOrAbsoluteDate("2024-01-05T12:00:00.000Z")).toBe(
      "Jan 5, 2024",
    );
  });

  test("returns absolute date for dates exactly 3 days ago", () => {
    const threeDaysAgo = new Date("2024-01-12T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(threeDaysAgo)).toBe("Jan 12, 2024");
  });

  test("returns relative time for dates in the future", () => {
    const tomorrow = new Date("2024-01-16T12:00:00.000Z");
    expect(formatRelativeOrAbsoluteDate(tomorrow)).toBe("in 1 day");
  });
});
