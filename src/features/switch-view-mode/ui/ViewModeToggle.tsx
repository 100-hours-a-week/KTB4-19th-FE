import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useViewMode, type ViewMode } from "../model/ViewModeProvider";

export function ViewModeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useViewMode();
  return (
    <div className={className ? `view-mode-toggle ${className}` : "view-mode-toggle"}>
      <SegmentedControl aria-label="화면 모드" value={mode} onValueChange={(value) => setMode(value as ViewMode)}>
        <SegmentedControlItem value="web">웹</SegmentedControlItem>
        <SegmentedControlItem value="mobile">모바일</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
