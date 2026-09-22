export type ManagerProfileForm = {
  userName: string;
  phone: string;
  marketingAgreed: boolean;
};

export type ManagerProfileRequest = {
  userName: string;
  phone: string;
  agreements: Array<{
    termsType: 'SERVICE' | 'PRIVACY' | 'MARKETING';
    isAgreed: boolean;
  }>;
};

export function buildManagerProfileRequest(
  form: ManagerProfileForm,
): ManagerProfileRequest;
