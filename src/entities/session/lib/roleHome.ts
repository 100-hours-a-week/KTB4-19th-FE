import type { UserRole } from "../api/authApi";

export function roleHome(role: UserRole) {
  if (role === "MANAGER") return "/manager";
  if (role === "RESIDENT") return "/resident";
  return "/auth/role";
}
