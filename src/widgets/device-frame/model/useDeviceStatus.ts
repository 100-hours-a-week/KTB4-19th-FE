import { useEffect, useState } from "react";

type BatteryManagerLike = EventTarget & { level: number; charging: boolean };
type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManagerLike> };

export type BatteryStatus = { level: number; charging: boolean } | null;

/** 상태바 시계. 분이 바뀌는 시점에 맞춰 갱신한다. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(schedule, 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds()));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);
  return now;
}

/** Battery Status API를 지원하는 브라우저(Chromium)에서는 실제 기기 배터리를, 아니면 null을 준다. */
export function useBattery(): BatteryStatus {
  const [battery, setBattery] = useState<BatteryStatus>(null);
  useEffect(() => {
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) return;
    let manager: BatteryManagerLike | null = null;
    let cancelled = false;
    const update = () => {
      if (manager && !cancelled) setBattery({ level: manager.level, charging: manager.charging });
    };
    getBattery.call(navigator).then((result) => {
      manager = result;
      update();
      manager.addEventListener("levelchange", update);
      manager.addEventListener("chargingchange", update);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  }, []);
  return battery;
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
