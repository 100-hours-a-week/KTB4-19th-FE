import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { reissueAccessToken, tokenStore } from "@/shared/api";
import { authApi, type AuthUser, type LoginRequest, type ManagerProfileRequest, type SelectedUserRole } from "../api/authApi";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "anonymous"; user: null };

type AuthContextValue = AuthState & {
  login: (request: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  selectRole: (role: SelectedUserRole) => Promise<SelectedUserRole>;
  updateManagerProfile: (request: ManagerProfileRequest) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let restorePromise: Promise<AuthUser | null> | null = null;

// refresh 쿠키로 세션을 복구한다. StrictMode의 effect 중복 실행에도 재발급·내 정보 조회는 한 번만 호출한다.
function restoreSession() {
  if (!restorePromise) {
    restorePromise = reissueAccessToken()
      .then(async (token) => {
        if (!token) return null;
        const [user, onboarding] = await Promise.all([authApi.me(), authApi.onboardingStatus()]);
        return { ...user, onboarding };
      })
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
    const onboarding = await authApi.onboardingStatus();
    setState({ status: "authenticated", user: { ...result.user, onboarding } });
    return result.user;
  }, []);

  const selectRole = useCallback(async (role: SelectedUserRole) => {
    const result = await authApi.selectRole({ userRole: role });
    // 서버가 역할이 반영된 새 토큰을 돌려주므로 이후 요청은 새 권한으로 보낸다.
    tokenStore.set(result.accessToken);
    setState((current) =>
      current.status === "authenticated"
        ? { ...current, user: { ...current.user, userRole: result.userRole } }
        : current,
    );
    return result.userRole;
  }, []);

  const updateManagerProfile = useCallback(async (request: ManagerProfileRequest) => {
    const result = await authApi.updateManagerProfile(request);
    setState((current) =>
      current.status === "authenticated"
        ? {
            ...current,
            user: {
              ...current.user,
              userName: result.userName ?? request.userName,
              phone: result.phone ?? request.phone,
              agreements: result.agreements ?? current.user.agreements,
            },
          }
        : current,
    );
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

  const value = useMemo(() => ({ ...state, login, logout, selectRole, updateManagerProfile }), [state, login, logout, selectRole, updateManagerProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
