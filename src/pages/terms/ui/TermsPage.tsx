import { useParams } from 'react-router-dom';
import {
  TERMS_TYPES,
  useTerm,
  useTerms,
  type TermsType,
} from '@/entities/terms';
import { PageTitle, StateBoundary } from '@/shared/ui';
import { useAuth } from '@/entities/session';
import { AppShell } from '@/widgets/app-shell';

export function TermsPage() {
  const auth = useAuth();
  const { termsType: rawTermsType } = useParams();
  const termsType = toTermsType(rawTermsType);
  const termsQuery = useTerms();
  const detailQuery = useTerm(termsType);
  const term = termsQuery.data?.terms.find(
    (item) => item.termsType === termsType,
  );
  const state =
    termsQuery.isPending || detailQuery.isPending
      ? 'loading'
      : termsQuery.isError || detailQuery.isError || !term || !detailQuery.data
        ? 'error'
        : 'default';
  const description = termsType === 'PRIVACY'
    ? '기본 개인정보 수집 및 이용 동의 약관입니다.'
    : '기본 서비스 이용약관입니다.';

  const content = (
    <div className="terms-page">
      <article>
        {termsType === null ? (
          <StateBoundary state="error">
            <></>
          </StateBoundary>
        ) : (
          <>
            <PageTitle eyebrow="공통 정책" title={term?.title ?? '약관'} description={description} />
            <StateBoundary state={state} onRetry={() => { void termsQuery.refetch(); void detailQuery.refetch(); }}>
              {detailQuery.data?.content !== description && <div className="terms-content">{detailQuery.data?.content}</div>}
            </StateBoundary>
          </>
        )}
      </article>
    </div>
  );
  if (auth.status === 'authenticated' && (auth.user.userRole === 'MANAGER' || auth.user.userRole === 'RESIDENT')) {
    return <AppShell role={auth.user.userRole === 'MANAGER' ? 'manager' : 'resident'}>{content}</AppShell>;
  }
  return content;
}

function toTermsType(value: string | undefined): TermsType | null {
  return TERMS_TYPES.includes(value as TermsType) ? (value as TermsType) : null;
}
