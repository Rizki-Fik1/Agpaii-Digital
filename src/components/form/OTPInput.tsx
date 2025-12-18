"use client";

import { useRef, useState } from "react";

const OTPInput = ({
  length = 4,
  onComplete,
}: {
  length: number;
  onComplete: (otpNumber: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement[]>(Array(length).fill(null));

  const [OTP, setOTP] = useState<string[]>(Array(length).fill(""));

  const handleTextChange = (input: string, index: number) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);

    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }

    if (newPin.every((digit) => digit !== "")) {
      onComplete(newPin.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (OTP[index] === "" && index > 0) {
        inputRef.current[index - 1]?.focus();
      }
    }
    if (isNaN(Number(e.key)) && e.key !== "Backspace") e.preventDefault();
  };

  return (
    (<div className="flex flex-wrap gap-4">
      {Array.from({ length }, (_, index) => (
        <input
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={ref => {
            (inputRef.current[index] = ref as any);
          }}
          onChange={(e) => handleTextChange(e.target.value, index)}
          value={OTP[index]}
          key={index}
          type="text"
          maxLength={1}
          className={`caret-transparent border border-slate-300 rounded-md focus:border-[#009788] p-2 size-12 text-center`}
        />
      ))}
    </div>)
  );
};

export default OTPInput;
