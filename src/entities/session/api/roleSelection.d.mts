export type SelectedRouteRole = "manager" | "resident";
export type SelectedUserRole = "MANAGER" | "RESIDENT";
export type RoleSelectionRequest = { userRole: SelectedUserRole };

export function roleSelectionRequest(selectedRole: SelectedRouteRole): RoleSelectionRequest;
export function roleSelectionSuccessPath(selectedRole: SelectedRouteRole): string;
