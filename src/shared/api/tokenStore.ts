type Listener = (token: string | null) => void;

// Access token은 메모리에만 보관한다. 새로고침 시에는 HttpOnly refresh 쿠키로 재발급받는다.
let accessToken: string | null = null;
let revision = 0;
const listeners = new Set<Listener>();

export const tokenStore = {
  get: () => accessToken,
  getRevision: () => revision,
  set(token: string | null) {
    revision++;
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
