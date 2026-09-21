import type { ReactNode } from 'react';
import {
  DeviceToggle,
  useViewMode,
  ViewModeToggle,
} from '@/features/switch-view-mode';
import { useMediaQuery } from '@/shared/lib';
import { DeviceFrame } from '@/widgets/device-frame';

/**
 * 화면 모드에 따라 앱을 브라우저 전체 폭(web) 또는 휴대폰 목업(mobile)에 담는다.
 * 반응형 스타일은 뷰포트가 아니라 .app-viewport 컨테이너 폭을 기준으로 하므로 목업 안에서도 실제 모바일 레이아웃이 적용된다.
 * 실제 모바일 기기(760px 이하)는 이미 모바일 화면이라 목업과 토글을 쓰지 않는다.
 */
export function ViewModeFrame({ children }: { children: ReactNode }) {
  const { mode, device } = useViewMode();
  const isPhoneViewport = useMediaQuery('(max-width: 760px)');
  const framed = mode === 'mobile' && !isPhoneViewport;
  return (
    <div
      className={`view-mode view-mode--${mode}${framed ? ' view-mode--framed' : ''}`}
    >
      <DeviceFrame framed={framed} device={device}>
        {children}
      </DeviceFrame>
      {!isPhoneViewport && (
        <div className="preview-toolbar">
          <ViewModeToggle />
          {framed && <DeviceToggle />}
        </div>
      )}
    </div>
  );
}
