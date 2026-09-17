import { apiRequest } from "@/shared/api";

export type UserRole = "NONE" | "MANAGER" | "RESIDENT";
export type SelectedUserRole = Exclude<UserRole, "NONE">;

export type RoleSelectionRequest = {
  userRole: SelectedUserRole;
};

export type RoleSelectionResponse = {
  userId: number;
  userRole: SelectedUserRole;
  accessToken: string;
  tokenType: "Bearer";
};

export type UserAgreement = {
  agreementId: number;
  termsType: "SERVICE" | "PRIVACY" | "MARKETING";
  isAgreed: boolean;
  agreedAt?: string | null;
};

export type AuthUser = {
  userId: number;
  userRole: UserRole;
  email: string;
  userName: string | null;
  phone?: string | null;
  agreements?: UserAgreement[];
};

export type ManagerProfileRequest = {
  userName: string;
  phone: string;
  agreements: Array<{
    termsType: "SERVICE" | "PRIVACY" | "MARKETING";
    isAgreed: boolean;
  }>;
};

export type ManagerProfileResponse = {
  userId: number;
  userName?: string;
  phone?: string;
  agreements?: UserAgreement[];
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
  selectRole: (request: RoleSelectionRequest) =>
    apiRequest<RoleSelectionResponse>("/users/me", { method: "PATCH", body: request }),
  updateManagerProfile: (request: ManagerProfileRequest) =>
    apiRequest<ManagerProfileResponse>("/users/me", { method: "PATCH", body: request }),
  me: () => apiRequest<AuthUser>("/users/me"),
};
