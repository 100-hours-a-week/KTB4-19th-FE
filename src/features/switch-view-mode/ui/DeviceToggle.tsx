import {
  SegmentedControl,
  SegmentedControlItem,
} from 'seed-design/ui/segmented-control';
import { useViewMode, type PreviewDevice } from '../model/ViewModeProvider';

export function DeviceToggle() {
  const { device, setDevice } = useViewMode();
  return (
    <div className="view-mode-toggle">
      <SegmentedControl
        aria-label="미리보기 기기"
        value={device}
        onValueChange={(value) => setDevice(value as PreviewDevice)}
      >
        <SegmentedControlItem value="iphone">iPhone</SegmentedControlItem>
        <SegmentedControlItem value="android">Android</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
