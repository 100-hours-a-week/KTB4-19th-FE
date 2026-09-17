import { apiRequest } from "../../../shared/api/client";

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

export type EmailAvailabilityResponse = {
  email: string;
  isAvailable: boolean;
};

export type SignupRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string | null;
  phone: string | null;
  agreements: Array<{
    termsType: "SERVICE" | "PRIVACY" | "MARKETING";
    isAgreed: boolean;
  }>;
};

export type SignupResponse = { userId: number };

export const authApi = {
  signup: (request: SignupRequest) =>
    apiRequest<SignupResponse>("/auth/signup", { method: "POST", body: request, auth: false }),
  checkEmailAvailability: (email: string) =>
    apiRequest<EmailAvailabilityResponse>("/users/email-availability", {
      query: { email },
      auth: false,
    }),
  login: (request: LoginRequest) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: request, auth: false }),
  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthUser>("/users/me"),
};
