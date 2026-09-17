import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import type { ViewState } from "@/shared/ui";

export function PreviewStateToolbar({ state, onStateChange }: { state: ViewState; onStateChange: (state: ViewState) => void }) {
  return (
    <aside className="review-toolbar" aria-label="프로토타입 상태 전환">
      <div><strong>디자인 상태</strong><span>서버 없이 화면 상태를 바꿔보세요</span></div>
      <SegmentedControl aria-label="화면 상태" value={state} onValueChange={(value) => onStateChange(value as ViewState)}>
        <SegmentedControlItem value="default">기본</SegmentedControlItem>
        <SegmentedControlItem value="loading">로딩</SegmentedControlItem>
        <SegmentedControlItem value="empty">빈화면</SegmentedControlItem>
        <SegmentedControlItem value="error">오류</SegmentedControlItem>
      </SegmentedControl>
    </aside>
  );
}
