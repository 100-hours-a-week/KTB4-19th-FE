export type QueryValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | undefined;

export type QueryParams = Record<string, QueryValue>;

export declare function toQueryString(query?: QueryParams): string;
