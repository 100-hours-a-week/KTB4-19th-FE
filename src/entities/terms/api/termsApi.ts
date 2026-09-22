import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';

export const TERMS_TYPES = ['SERVICE', 'PRIVACY', 'MARKETING'] as const;
export type TermsType = (typeof TERMS_TYPES)[number];

export type TermsSummary = {
  termsType: TermsType;
  title: string;
};

export type TermsListResponse = {
  terms: TermsSummary[];
};

export type TermsDetailResponse = {
  content: string;
};

const termsBase = '/terms';

export const termsApi = {
  list: () =>
    apiRequest<TermsListResponse>(termsBase, {
      auth: false,
    }),
  detail: (termsType: TermsType) =>
    apiRequest<TermsDetailResponse>(`${termsBase}/${termsType}`, {
      auth: false,
    }),
};

export const termsKeys = {
  list: () => ['terms', 'list'] as const,
  detail: (termsType: TermsType) => ['terms', 'detail', termsType] as const,
};

export function useTerms() {
  return useQuery({
    queryKey: termsKeys.list(),
    queryFn: termsApi.list,
  });
}

export function useTerm(termsType: TermsType | null) {
  return useQuery({
    queryKey: termsType ? termsKeys.detail(termsType) : ['terms', 'detail'],
    queryFn: () => termsApi.detail(termsType as TermsType),
    enabled: termsType !== null,
  });
}
