import { Link, useParams } from 'react-router-dom';
import {
  TERMS_TYPES,
  useTerm,
  useTerms,
  type TermsType,
} from '@/entities/terms';
import { Logo, StateBoundary } from '@/shared/ui';

export function TermsPage() {
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

  return (
    <div className="terms-page">
      <Link className="brand" to="/auth/signup" aria-label="집사이">
        <Logo />
      </Link>
      <article>
        <p className="eyebrow">공통 정책</p>
        {termsType === null ? (
          <StateBoundary state="error">
            <></>
          </StateBoundary>
        ) : (
          <>
            <h1>{term?.title ?? '약관'}</h1>
            <StateBoundary
              state={state}
              onRetry={() => {
                void termsQuery.refetch();
                void detailQuery.refetch();
              }}
            >
              <div className="terms-content">{detailQuery.data?.content}</div>
            </StateBoundary>
          </>
        )}
      </article>
    </div>
  );
}

function toTermsType(value: string | undefined): TermsType | null {
  return TERMS_TYPES.includes(value as TermsType) ? (value as TermsType) : null;
}
