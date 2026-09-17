import type { ReactNode } from "react";
import { useViewMode, ViewModeToggle } from "@/features/switch-view-mode";

/**
 * 화면 모드에 따라 앱을 브라우저 전체 폭(web) 또는 모바일 폭 프레임(mobile)에 담는다.
 * 반응형 스타일은 뷰포트가 아니라 .app-viewport 컨테이너 폭을 기준으로 하므로
 * 프레임 안에서도 실제 모바일과 같은 레이아웃이 적용된다. 실제 모바일 기기에서는 프레임과 토글을 숨긴다.
 */
export function ViewModeFrame({ children }: { children: ReactNode }) {
  const { mode } = useViewMode();
  return (
    <div className={`view-mode view-mode--${mode}`}>
      <div className="view-mode__device">
        <div className="app-viewport">{children}</div>
      </div>
      <ViewModeToggle className="view-mode-toggle--floating" />
    </div>
  );
}
