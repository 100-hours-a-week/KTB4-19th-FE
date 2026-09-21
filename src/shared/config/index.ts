export { type RouteRole } from './routeRole';

export const apiPrefix = '/api/v1';

function normalizeOrigin(origin: string | undefined) {
  return origin?.trim().replace(/\/+$/, '') ?? '';
}

export const apiBase = `${normalizeOrigin(import.meta.env.VITE_API_ORIGIN)}${apiPrefix}`;
