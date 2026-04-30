import { NextResponse } from "next/server";
import { API_ERRORS } from "@syncopate/api";
import type { ApiErrorDefinition } from "@syncopate/types";

export { API_ERRORS };
export type { ApiErrorDefinition };

export function apiError(errorDef: ApiErrorDefinition) {
  return NextResponse.json(
    { error: errorDef.error },
    { status: errorDef.status },
  );
}
