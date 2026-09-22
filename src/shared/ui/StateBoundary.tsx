import { IconDocumentLine } from '@karrotmarket/react-monochrome-icon';
import type { ReactNode } from 'react';
import { ActionButton } from 'seed-design/ui/action-button';

/** API 또는 데이터 소스의 로딩·빈 결과·오류 상태를 표시한다. */
export type ViewState = 'default' | 'loading' | 'empty' | 'error';

export function StateBoundary({
  state,
  children,
  emptyTitle = '표시할 내용이 없어요',
  onRetry,
}: {
  state: ViewState;
  children: ReactNode;
  emptyTitle?: string;
  onRetry?: () => void;
}) {
  if (state === 'loading') {
    return (
      <div className="skeleton-stack" aria-label="불러오는 중">
        {[1, 2, 3].map((item) => (
          <div className="skeleton-card" key={item} />
        ))}
      </div>
    );
  }
  if (state === 'empty') {
    return (
      <div className="result-state">
        <span className="result-icon">
          <IconDocumentLine />
        </span>
        <h2>{emptyTitle}</h2>
        <p>새 항목이 생기면 이곳에서 확인할 수 있어요.</p>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="result-state">
        <span className="result-icon result-icon--critical">!</span>
        <h2>내용을 불러오지 못했어요</h2>
        <p>잠시 후 다시 시도해 주세요.</p>
        <ActionButton variant="neutralOutline" onClick={onRetry}>
          다시 시도
        </ActionButton>
      </div>
    );
  }
  return children;
}
