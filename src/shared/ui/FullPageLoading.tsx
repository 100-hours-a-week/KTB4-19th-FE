import { ProgressCircle } from 'seed-design/ui/progress-circle';

export function FullPageLoading() {
  return (
    <div className="full-page-loading" role="status" aria-label="불러오는 중">
      <ProgressCircle />
    </div>
  );
}
