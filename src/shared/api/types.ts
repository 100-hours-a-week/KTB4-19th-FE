export type DataResponse<T> = {
  data: T;
};

export type FieldViolation = {
  field: string;
  reason: string;
};

export type ErrorResponseBody = {
  message?: string;
  error?: {
    code?: string;
    details?: {
      violations?: FieldViolation[];
      field?: string;
      reason?: string;
      retryAfterSeconds?: number;
    };
  };
  data: null;
};
