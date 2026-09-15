import type { ErrorResponseBody, FieldViolation } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly violations: FieldViolation[];
  readonly retryAfterSeconds?: number;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    violations?: FieldViolation[];
    retryAfterSeconds?: number;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.violations = params.violations ?? [];
    this.retryAfterSeconds = params.retryAfterSeconds;
  }

  get isServerError() {
    return this.status >= 500 || this.status === 0;
  }

  violationFor(field: string) {
    return this.violations.find((violation) => violation.field === field)?.reason;
  }
}

const FALLBACK_MESSAGE = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

export function toApiError(status: number, body: ErrorResponseBody | null): ApiError {
  const details = body?.error?.details;
  const violations = details?.violations ?? (details?.field && details.reason ? [{ field: details.field, reason: details.reason }] : []);
  return new ApiError({
    status,
    code: body?.error?.code,
    message: body?.message ?? FALLBACK_MESSAGE,
    violations,
    retryAfterSeconds: details?.retryAfterSeconds,
  });
}

export function networkError() {
  return new ApiError({ status: 0, code: "NETWORK_ERROR", message: "네트워크 연결을 확인해 주세요." });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
