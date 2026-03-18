"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MurrotalRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/murrotal/surat");
  }, [router]);
  return null;
}
