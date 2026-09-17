import type { BatteryStatus } from "../model/useDeviceStatus";

// 기기 목업 상태바 전용 아이콘. SEED 아이콘 세트에 없는 OS 크롬이라 여기서만 그린다.

export function SignalIcon() {
  return (
    <svg className="device-status-icon" width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
      <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

export function WifiIcon({ online }: { online: boolean }) {
  return (
    <svg className="device-status-icon" width="15" height="11" viewBox="0 0 15 11" aria-hidden="true" opacity={online ? 1 : 0.35}>
      <path d="M7.5 2.2c2.1 0 4 .8 5.5 2.1l1.2-1.3A9.9 9.9 0 0 0 7.5.4 9.9 9.9 0 0 0 .8 3l1.2 1.3a8.1 8.1 0 0 1 5.5-2.1Z" fill="currentColor" />
      <path d="M7.5 5.5c1.2 0 2.3.4 3.2 1.2l1.2-1.3a6.5 6.5 0 0 0-8.8 0l1.2 1.3c.9-.8 2-1.2 3.2-1.2Z" fill="currentColor" />
      <path d="M7.5 8.6c.5 0 .9.2 1.2.4L7.5 10.4 6.3 9c.3-.2.7-.4 1.2-.4Z" fill="currentColor" />
    </svg>
  );
}

export function BatteryIcon({ battery }: { battery: BatteryStatus }) {
  const level = battery?.level ?? 1;
  return (
    <svg className="device-status-icon" width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width={Math.max(1.5, 18 * level)} height="8" rx="1.6" fill="currentColor" />
      <path d="M23 4v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
