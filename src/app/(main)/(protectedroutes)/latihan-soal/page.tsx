"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LathanSoalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cbt");
  }, [router]);

  return null;
}
