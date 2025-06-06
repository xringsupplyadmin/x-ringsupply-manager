"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export function useDebounce<T>(
  initialValue: T,
  delayMs: number,
): [T, Dispatch<SetStateAction<T>>, T] {
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

  return [debouncedValue, setRealtimeValue, realtimeValue];
}
