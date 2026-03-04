"use client";

import { useEffect, useState, useRef } from "react";

type CountdownTimerProps = {
  initialSeconds: number;
  onTimeUp: () => void;
};

export default function CountdownTimer({
  initialSeconds,
  onTimeUp,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]); 
  // keeping secondsLeft dependency is actually needed if we want to honor 'if (secondsLeft <= 0) return;' 
  // on mount.
  // actually, if we want a STABLE interval, we should not depend on secondsLeft.
  // BUT, if we don't depend on secondsLeft, how do we stop?
  // We stop inside the interval callback (clearInterval).
  // AND we need to restart if 'initialSeconds' changes.
  // The current logic with [secondsLeft] re-creates interval every second.
  // It effectively works like setTimeout(..., 1000) recursive.
  // It is fine for this purpose, drift is negligible for a few minutes exam.
  // I will stick to the previous logic but clean up the file content to be valid TSX.

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-orange-400 text-white px-6 py-2 rounded-full font-semibold">
      {formatTime(secondsLeft)}
    </div>
  );
}
