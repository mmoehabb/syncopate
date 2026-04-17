import type { ApiErrorDefinition } from "@syncopate/types";

export const API_ERRORS = {
  UNAUTHORIZED: { error: "Unauthorized", status: 401 } as ApiErrorDefinition,
  FORBIDDEN: { error: "Forbidden", status: 403 } as ApiErrorDefinition,
  BAD_REQUEST: { error: "Bad Request", status: 400 } as ApiErrorDefinition,
  NOT_FOUND: { error: "Not Found", status: 404 } as ApiErrorDefinition,
  INTERNAL_SERVER_ERROR: {
    error: "Internal Server Error",
    status: 500,
  } as ApiErrorDefinition,

  // Custom helpers
  customNotFound: (entity: string): ApiErrorDefinition => ({
    error: `${entity} not found`,
    status: 404,
  }),
  custom404: (message: string): ApiErrorDefinition => ({
    error: message,
    status: 404,
  }),
  customBadRequest: (message: string): ApiErrorDefinition => ({
    error: message,
    status: 400,
  }),
  customForbidden: (message: string): ApiErrorDefinition => ({
    error: message,
    status: 403,
  }),
  customInternal: (message: string): ApiErrorDefinition => ({
    error: message,
    status: 500,
  }),
  customUnauthorized: (message: string): ApiErrorDefinition => ({
    error: message,
    status: 401,
  }),
};
