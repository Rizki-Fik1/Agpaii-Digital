"use client";
import Loader from "@/components/loader/loader";
import StudentNavbar from "@/components/nav/student_nav";
import Navigate from "@/components/navigator/navigate";
import { STUDENT_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();
  const pathname = usePathname();

  if (authLoading) {
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader className="size-12" />
      </div>
    );
  }

  // Jika tidak ada auth, redirect ke login
  if (!auth) {
    return <Navigate to="/getting-started" />;
  }

  // Jika bukan siswa, redirect ke home (halaman guru)
  if (auth.role_id !== STUDENT_ROLE_ID) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}


