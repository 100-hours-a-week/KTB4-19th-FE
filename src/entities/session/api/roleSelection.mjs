const BACKEND_ROLE = {
  manager: "MANAGER",
  resident: "RESIDENT",
};

const SUCCESS_PATH = {
  manager: "/manager/onboarding/profile",
  resident: "/resident/connect",
};

export function roleSelectionRequest(selectedRole) {
  const userRole = BACKEND_ROLE[selectedRole];
  if (!userRole) throw new TypeError("Unsupported role selection");
  return { userRole };
}

export function roleSelectionSuccessPath(selectedRole) {
  const path = SUCCESS_PATH[selectedRole];
  if (!path) throw new TypeError("Unsupported role selection");
  return path;
}
