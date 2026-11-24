import { useCallback, useEffect, useState } from "react";

export function useCooldown(initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  const start = useCallback((value = 60) => setSeconds(value), []);
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return { seconds, active: seconds > 0, label, start };
}
