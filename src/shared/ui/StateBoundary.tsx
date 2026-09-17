import { IconDocumentLine } from "@karrotmarket/react-monochrome-icon";
import type { ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";

/** 서버 없이 화면 상태를 바꿔보기 위한 프로토타입 상태 */
export type ViewState = "default" | "loading" | "empty" | "error";

export function StateBoundary({ state, children, emptyTitle = "표시할 내용이 없어요" }: { state: ViewState; children: ReactNode; emptyTitle?: string }) {
  if (state === "loading") {
    return (
      <div className="skeleton-stack" aria-label="불러오는 중">
        {[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}
      </div>
    );
  }
  if (state === "empty") {
    return <div className="result-state"><span className="result-icon"><IconDocumentLine /></span><h2>{emptyTitle}</h2><p>새 항목이 생기면 이곳에서 확인할 수 있어요.</p></div>;
  }
  if (state === "error") {
    return <div className="result-state"><span className="result-icon result-icon--critical">!</span><h2>내용을 불러오지 못했어요</h2><p>잠시 후 다시 시도해 주세요.</p><ActionButton variant="neutralOutline">다시 시도</ActionButton></div>;
  }
  return children;
}
