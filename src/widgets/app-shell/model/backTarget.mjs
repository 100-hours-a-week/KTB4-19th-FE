const backRules = [
  {
    pattern: /^\/resident\/conversations\/[^/]+$/,
    path: '/resident/conversations',
  },
  { pattern: /^\/resident\/complaints\/[^/]+$/, path: '/resident/complaints' },
  { pattern: /^\/resident\/notifications$/, path: '/resident' },
  { pattern: /^\/manager\/rooms\/[^/]+$/, path: '/manager/rooms' },
  { pattern: /^\/manager\/complaints\/[^/]+$/, path: '/manager/complaints' },
  {
    pattern: /^\/manager\/conversations\/[^/]+$/,
    path: '/manager/complaints',
    preferHistory: true,
  },
  { pattern: /^\/manager\/documents\/[^/]+$/, path: '/manager/documents' },
  { pattern: /^\/manager\/notifications$/, path: '/manager' },
];

export function backTarget(pathname) {
  const rule = backRules.find(({ pattern }) => pattern.test(pathname));
  if (!rule) return null;
  return { path: rule.path, preferHistory: rule.preferHistory ?? false };
}
