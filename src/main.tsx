import "@seed-design/css/base.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { isApiError } from "./shared/api/errors";
import { AuthProvider } from "./shared/auth/AuthProvider";
import "./styles.css";

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
