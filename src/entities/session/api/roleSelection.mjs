const backendRole = {
  manager: 'MANAGER',
  resident: 'RESIDENT',
};

const successPath = {
  manager: '/manager/building/new',
  resident: '/resident/connect',
};

export function roleSelectionRequest(selectedRole) {
  const userRole = backendRole[selectedRole];
  if (!userRole) throw new TypeError('Unsupported role selection');
  return { userRole };
}

export function roleSelectionSuccessPath(selectedRole) {
  const path = successPath[selectedRole];
  if (!path) throw new TypeError('Unsupported role selection');
  return path;
}
