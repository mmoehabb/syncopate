// Shared API Types

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  version: string
  message?: string
}

export interface ErrorResponse {
  error: string
  code: string
}
