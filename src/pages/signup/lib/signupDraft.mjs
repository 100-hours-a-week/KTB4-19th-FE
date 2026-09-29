export const signupDraftKey = 'signupDraft';

export function toSignupDraft({
  email,
  userName,
  phone,
  emailAvailable,
  acceptedServiceTerms,
  acceptedPrivacyTerms,
}) {
  return JSON.stringify({
    email,
    userName,
    phone,
    emailAvailable,
    acceptedServiceTerms,
    acceptedPrivacyTerms,
  });
}

export function parseSignupDraft(raw) {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw);
    return {
      email: textOf(draft.email),
      userName: textOf(draft.userName),
      phone: textOf(draft.phone),
      emailAvailable:
        typeof draft.emailAvailable === 'boolean' ? draft.emailAvailable : null,
      acceptedServiceTerms: draft.acceptedServiceTerms === true,
      acceptedPrivacyTerms: draft.acceptedPrivacyTerms === true,
    };
  } catch {
    return null;
  }
}

function textOf(value) {
  return typeof value === 'string' ? value : '';
}
