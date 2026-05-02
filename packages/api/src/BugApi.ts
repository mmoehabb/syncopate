import { ApiClient } from "./ApiClient";
import type { BugReportPayload, BugReportResponse } from "@syncoboard/types";

export class BugApi extends ApiClient {
  constructor() {
    super("/api/bugs");
  }

  public async reportBug(
    payload: BugReportPayload,
  ): Promise<BugReportResponse> {
    const response = await this.post<BugReportResponse>("", payload);
    return response.data;
  }
}

export const bugApi = new BugApi();
