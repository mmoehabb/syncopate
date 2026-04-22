export interface BugReportPayload {
  message: string;
  stack?: string;
  url?: string;
}

export interface BugReportResponse {
  success: boolean;
  id: string;
}
