import { describe, it, expect } from "bun:test";
import { API_ERRORS } from "../error";

describe("packages/api - API_ERRORS", () => {
  describe("Constants", () => {
    it("should have correct UNAUTHORIZED definition", () => {
      expect(API_ERRORS.UNAUTHORIZED).toEqual({
        error: "Unauthorized",
        status: 401,
      });
    });

    it("should have correct FORBIDDEN definition", () => {
      expect(API_ERRORS.FORBIDDEN).toEqual({
        error: "Forbidden",
        status: 403,
      });
    });

    it("should have correct BAD_REQUEST definition", () => {
      expect(API_ERRORS.BAD_REQUEST).toEqual({
        error: "Bad Request",
        status: 400,
      });
    });

    it("should have correct NOT_FOUND definition", () => {
      expect(API_ERRORS.NOT_FOUND).toEqual({
        error: "Not Found",
        status: 404,
      });
    });

    it("should have correct INTERNAL_SERVER_ERROR definition", () => {
      expect(API_ERRORS.INTERNAL_SERVER_ERROR).toEqual({
        error: "Internal Server Error",
        status: 500,
      });
    });
  });

  describe("Custom Helpers", () => {
    it("customNotFound should return formatted 404 error", () => {
      const result = API_ERRORS.customNotFound("User");
      expect(result).toEqual({
        error: "User not found",
        status: 404,
      });
    });

    it("custom404 should return formatted 404 error with message", () => {
      const result = API_ERRORS.custom404("Custom message");
      expect(result).toEqual({
        error: "Custom message",
        status: 404,
      });
    });

    it("customBadRequest should return formatted 400 error", () => {
      const result = API_ERRORS.customBadRequest("Invalid input");
      expect(result).toEqual({
        error: "Invalid input",
        status: 400,
      });
    });

    it("customForbidden should return formatted 403 error", () => {
      const result = API_ERRORS.customForbidden("Access denied");
      expect(result).toEqual({
        error: "Access denied",
        status: 403,
      });
    });

    it("customInternal should return formatted 500 error", () => {
      const result = API_ERRORS.customInternal("Something went wrong");
      expect(result).toEqual({
        error: "Something went wrong",
        status: 500,
      });
    });

    it("customUnauthorized should return formatted 401 error", () => {
      const result = API_ERRORS.customUnauthorized("Please log in");
      expect(result).toEqual({
        error: "Please log in",
        status: 401,
      });
    });

    // Additional tests for edge cases
    it("customNotFound should handle empty string", () => {
      const result = API_ERRORS.customNotFound("");
      expect(result).toEqual({
        error: " not found",
        status: 404,
      });
    });

    it("custom404 should handle empty string", () => {
      const result = API_ERRORS.custom404("");
      expect(result).toEqual({
        error: "",
        status: 404,
      });
    });

    it("customBadRequest should handle empty string", () => {
      const result = API_ERRORS.customBadRequest("");
      expect(result).toEqual({
        error: "",
        status: 400,
      });
    });
  });
});
