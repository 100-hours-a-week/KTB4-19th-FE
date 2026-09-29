export type SignupDraft = {
  email: string;
  userName: string;
  phone: string;
  emailAvailable: boolean | null;
  acceptedServiceTerms: boolean;
  acceptedPrivacyTerms: boolean;
};

export const signupDraftKey: string;

export function toSignupDraft(draft: SignupDraft): string;

export function parseSignupDraft(raw: string | null): SignupDraft | null;
