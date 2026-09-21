import { useRef, type CSSProperties, type ReactNode } from 'react';
import type { PreviewDevice } from '@/features/switch-view-mode';
import { useFitScale } from '../model/useFitScale';
import { AndroidNavBar } from './AndroidNavBar';
import { StatusBar } from './StatusBar';

// 목업 바깥 여백(px). 축소 배율 계산에만 쓴다.
const stageGutter = 32;

type Props = {
  /** false면 기기 크롬 없이 children만 브라우저 폭으로 렌더링한다. */
  framed: boolean;
  device: PreviewDevice;
  children: ReactNode;
};

/**
 * 웹/모바일 모드 모두 같은 DOM 구조를 유지해 모드를 바꿔도 앱 상태(입력값, 라우트 상태)가 초기화되지 않는다.
 * framed일 때만 베젤·상태바·홈 인디케이터·내비게이션 바를 그린다.
 */
export function DeviceFrame({ framed, device, children }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(frameRef, { enabled: framed, gutter: stageGutter });
  return (
    <div
      className={framed ? 'device-slot device-slot--framed' : 'device-slot'}
      data-device={device}
      style={
        framed ? ({ '--device-scale': scale } as CSSProperties) : undefined
      }
    >
      <div className="device-frame" ref={frameRef}>
        <div className="device-screen">
          {framed && <StatusBar device={device} />}
          <div className="device-app">
            <div className="app-viewport">{children}</div>
          </div>
          {framed && device === 'android' && <AndroidNavBar />}
          {framed && device === 'iphone' && (
            <span className="device-home-indicator" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
