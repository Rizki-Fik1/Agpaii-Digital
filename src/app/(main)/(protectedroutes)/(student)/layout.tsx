"use client";

import Loader from "@/components/loader/loader";
import StudentNavbar from "@/components/nav/student_nav";
import { STUDENT_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (redirectedRef.current) return;

    if (!auth) {
      redirectedRef.current = true;
      router.replace("/getting-started");
      return;
    }

    const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);

    // Jika bukan siswa, redirect ke home
    if (roleId !== STUDENT_ROLE_ID) {
      redirectedRef.current = true;
      router.replace("/");
      return;
    }
  }, [auth, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader className="size-12" />
      </div>
    );
  }

  // Jika tidak ada auth atau bukan siswa, tampilkan loading sementara redirect
  if (!auth || Number(auth?.role_id ?? auth?.role?.id ?? auth?.role) !== STUDENT_ROLE_ID) {
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader className="size-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
