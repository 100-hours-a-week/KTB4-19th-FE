import { apiRequest } from "@/shared/api";

export type UserRole = "NONE" | "MANAGER" | "RESIDENT";

export type AuthUser = {
  userId: number;
  userRole: UserRole;
  email: string;
  userName: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  user: AuthUser;
};

export const authApi = {
  login: (request: LoginRequest) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: request, auth: false }),
  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthUser>("/users/me"),
};
