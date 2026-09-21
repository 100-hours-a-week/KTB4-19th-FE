export type SignupRequestForm = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  phone: string;
  acceptedRequiredTerms: boolean;
};

export type SignupRequestPayload = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string | null;
  phone: string | null;
  agreements: Array<{
    termsType: 'SERVICE' | 'PRIVACY' | 'MARKETING';
    isAgreed: boolean;
  }>;
};

export function buildSignupRequest(
  form: SignupRequestForm,
): SignupRequestPayload;
