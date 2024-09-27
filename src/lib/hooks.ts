"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useDebounce<T>(
  initialValue: T,
  delayMs: number,
): [T, Dispatch<SetStateAction<T>>] {
  const [realtimeValue, setRealtimeValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(realtimeValue);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [realtimeValue, delayMs]);

  return [debouncedValue, setRealtimeValue];
}
