import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** web: 브라우저 폭 그대로 보는 기본 화면, mobile: 데스크톱에서 휴대폰 목업 안에 띄우는 화면 */
export type ViewMode = 'web' | 'mobile';
/** 모바일 모드에서 보여줄 기기 목업 */
export type PreviewDevice = 'iphone' | 'android';

const modeStorageKey = 'zipsai:view-mode';
const deviceStorageKey = 'zipsai:preview-device';

type ViewModeContextValue = {
  mode: ViewMode;
  device: PreviewDevice;
  setMode: (mode: ViewMode) => void;
  setDevice: (device: PreviewDevice) => void;
};

const viewModeContext = createContext<ViewModeContextValue | null>(null);

// 화면 모드는 개인 미리보기 설정이라 브라우저에만 남긴다. 저장소 접근이 막힌 환경에서는 기본값으로 시작한다.
function readStored<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 저장하지 못해도 현재 세션에서는 전환된 값을 유지한다.
  }
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(() =>
    readStored(modeStorageKey, ['web', 'mobile'], 'web'),
  );
  const [device, setDeviceState] = useState<PreviewDevice>(() =>
    readStored(deviceStorageKey, ['iphone', 'android'], 'iphone'),
  );

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
    store(modeStorageKey, next);
  }, []);

  const setDevice = useCallback((next: PreviewDevice) => {
    setDeviceState(next);
    store(deviceStorageKey, next);
  }, []);

  const value = useMemo(
    () => ({ mode, device, setMode, setDevice }),
    [mode, device, setMode, setDevice],
  );
  return (
    <viewModeContext.Provider value={value}>
      {children}
    </viewModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewMode() {
  const context = useContext(viewModeContext);
  if (!context)
    throw new Error('useViewMode must be used within ViewModeProvider');
  return context;
}
