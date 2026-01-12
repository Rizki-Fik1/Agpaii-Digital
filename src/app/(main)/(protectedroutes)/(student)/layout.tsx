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
      console.log("[StudentLayout] not authenticated → /getting-started");
      router.replace("/getting-started");
      return;
    }

    const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);

    console.log("[StudentLayout] role check", { roleId });
  }, [auth, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader className="size-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* <StudentNavbar /> jika ada */}
      {children}
    </div>
  );
}
