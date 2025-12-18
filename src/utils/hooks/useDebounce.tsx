"use client";

import { useEffect, useRef, useState } from "react";

export default function useDebounceValue(value: any, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState("");
  const timer = useRef<any>(undefined);

  useEffect(() => {
    timer.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);

  return debouncedValue;
}
