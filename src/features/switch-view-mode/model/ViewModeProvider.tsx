import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** web: 브라우저 폭 그대로 보는 기본 화면, mobile: 데스크톱에서 모바일 폭 프레임 안에 띄우는 화면 */
export type ViewMode = "web" | "mobile";

const STORAGE_KEY = "zipsai:view-mode";

type ViewModeContextValue = {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

// 화면 모드는 개인 미리보기 설정이라 브라우저에만 남긴다. 저장소 접근이 막힌 환경에서는 web으로 시작한다.
function readStoredMode(): ViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "mobile" ? "mobile" : "web";
  } catch {
    return "web";
  }
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readStoredMode);

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 저장하지 못해도 현재 세션에서는 전환된 모드를 유지한다.
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) throw new Error("useViewMode must be used within ViewModeProvider");
  return context;
}
