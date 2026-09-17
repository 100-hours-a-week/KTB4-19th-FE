import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/entities/session";
import { isApiError } from "@/shared/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx는 재시도해도 결과가 같으므로 네트워크·서버 오류만 한 번 재시도한다.
      retry: (failureCount, error) => failureCount < 1 && (!isApiError(error) || error.isServerError),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
