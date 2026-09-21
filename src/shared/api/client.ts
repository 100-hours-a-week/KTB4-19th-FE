import { tokenStore } from './tokenStore';
import { networkError, toApiError } from './errors';
import { toQueryString, type QueryParams } from './queryString.mjs';
import { apiBase } from '@/shared/config';
import type { DataResponse, ErrorResponseBody } from './types';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: QueryParams;
  /** 인증 헤더를 붙이고 401 시 재발급을 시도한다. */
  auth?: boolean;
  signal?: AbortSignal;
};

let reissuePromise: Promise<string | null> | null = null;

/**
 * refresh 쿠키로 access token을 재발급한다. 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행한다.
 */
export function reissueAccessToken(): Promise<string | null> {
  if (!reissuePromise) {
    reissuePromise = fetch(`${apiBase}/auth/reissue`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as DataResponse<{
          accessToken: string;
          tokenType: 'Bearer';
        }>;
        return payload.data.accessToken;
      })
      .catch(() => null)
      .then((token) => {
        tokenStore.set(token);
        return token;
      })
      .finally(() => {
        reissuePromise = null;
      });
  }
  return reissuePromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true } = options;
  const response = await send(path, options);
  if (response.status === 401 && auth) {
    const token = await reissueAccessToken();
    if (token) {
      return parse<T>(await send(path, options));
    }
  }
  return parse<T>(response);
}

async function send(
  path: string,
  { method = 'GET', body, query, auth = true, signal }: RequestOptions,
) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(`${apiBase}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error;
    throw networkError();
  }
}

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiError(response.status, payload as ErrorResponseBody | null);
  }
  return (payload as DataResponse<T>).data;
}
