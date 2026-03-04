"use client";

import { useState, useEffect } from "react";
import { getImage } from "@/utils/function/function";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  className?: string; // Expecting tailwind classes like "w-10 h-10 rounded-full"
  onClick?: () => void;
}

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function getBackgroundColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export default function UserAvatar({
  src,
  name,
  className = "",
  onClick,
}: UserAvatarProps) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      setImageSrc(getImage(src));
      setError(false);
    } else {
      setImageSrc(null);
      setError(true);
    }
  }, [src]);

  // Clean className to ensure we can control layout if needed
  // Note: Parent is expected to pass width/height/rounded classes
  
  if (error || !imageSrc) {
    return (
      <div
        onClick={onClick}
        className={`${className} ${getBackgroundColor(
          name
        )} flex items-center justify-center text-white font-semibold select-none overflow-hidden`}
        title={name}
      >
        <span className="text-[inherit]" style={{ fontSize: "120%" }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={name}
      className={`${className} object-cover`}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
}
