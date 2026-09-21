import type { PreviewDevice } from '@/features/switch-view-mode';
import { useBattery, useClock, useOnline } from '../model/useDeviceStatus';
import { BatteryIcon, SignalIcon, WifiIcon } from './StatusIcons';

export function StatusBar({ device }: { device: PreviewDevice }) {
  const now = useClock();
  const battery = useBattery();
  const online = useOnline();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  // iOS 상태바는 오전/오후 없이 12시간제, Android는 24시간제로 표시한다.
  const time =
    device === 'iphone'
      ? `${hours % 12 || 12}:${minutes}`
      : `${String(hours).padStart(2, '0')}:${minutes}`;
  const batteryPercent = battery ? Math.round(battery.level * 100) : null;
  const batteryLabel =
    batteryPercent === null
      ? '배터리 정보 없음'
      : `배터리 ${batteryPercent}%${battery?.charging ? ', 충전 중' : ''}`;

  return (
    <div
      className="device-status-bar"
      role="status"
      aria-label={`${time}, ${online ? '온라인' : '오프라인'}, ${batteryLabel}`}
    >
      <time
        className="device-status-time"
        dateTime={now.toISOString()}
        aria-hidden="true"
      >
        {time}
      </time>
      <span className="device-camera" aria-hidden="true" />
      <span className="device-status-icons" aria-hidden="true">
        <SignalIcon />
        <WifiIcon online={online} />
        {device === 'android' && batteryPercent !== null && (
          <span className="device-battery-percent">{batteryPercent}%</span>
        )}
        <BatteryIcon battery={battery} />
      </span>
    </div>
  );
}
