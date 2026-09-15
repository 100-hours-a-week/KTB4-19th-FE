import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type AuthUser, type LoginRequest } from "../../features/auth/api/authApi";
import { reissueAccessToken } from "../api/client";
import { tokenStore } from "./tokenStore";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "anonymous"; user: null };

type AuthContextValue = AuthState & {
  login: (request: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let restorePromise: Promise<AuthUser | null> | null = null;

// refresh 쿠키로 세션을 복구한다. StrictMode의 effect 중복 실행에도 재발급·내 정보 조회는 한 번만 호출한다.
function restoreSession() {
  if (!restorePromise) {
    restorePromise = reissueAccessToken()
      .then((token) => (token ? authApi.me() : null))
      .catch(() => null)
      .finally(() => {
        restorePromise = null;
      });
  }
  return restorePromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    restoreSession().then((user) => {
      if (cancelled) return;
      setState(user ? { status: "authenticated", user } : { status: "anonymous", user: null });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 재발급까지 실패해 토큰이 사라지면 로그아웃 상태로 전환한다.
  useEffect(
    () =>
      tokenStore.subscribe((token) => {
        if (token === null) {
          setState((current) => (current.status === "authenticated" ? { status: "anonymous", user: null } : current));
        }
      }),
    [],
  );

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authApi.login(request);
    tokenStore.set(result.accessToken);
    setState({ status: "authenticated", user: result.user });
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 로그아웃 실패와 무관하게 클라이언트 인증 정보는 제거한다.
    } finally {
      tokenStore.set(null);
      queryClient.clear();
      setState({ status: "anonymous", user: null });
    }
  }, [queryClient]);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
