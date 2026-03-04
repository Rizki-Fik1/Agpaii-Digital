"use client";
import Loader from "@/components/loader/loader";
import Navigate from "@/components/navigator/navigate";
import StudentNavbar from "@/components/nav/student_nav";
import MitraNavbar from "@/components/nav/mitra_nav";
import { STUDENT_ROLE_ID, MITRA_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();
  const pathname = usePathname();
 
  if (authLoading) return null;

  // Redirect ke halaman login jika tidak ada auth
  if (!auth) {
    return <Navigate to="/getting-started" />;
  }

  // Cek Role
  const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);
  const isStudent = roleId === STUDENT_ROLE_ID;
  const isMitra = roleId === MITRA_ROLE_ID;

  // --- LOGIC SISWA ---
  if (isStudent) {
      const isStudentPage =
        pathname === "/beranda" ||
        pathname.startsWith("/beranda/") ||
        (pathname.startsWith("/kelas") && !pathname.startsWith("/kelas-guru")) ||
        pathname.startsWith("/forum") ||
        pathname === "/profile-siswa" ||
        pathname.startsWith("/profile-siswa/");

      if (!isStudentPage) return <Navigate to="/beranda" />;
      
      return (
          <>
            {children}
            <StudentNavbar />
          </>
      );
  }

  // --- LOGIC MITRA ---
  if (isMitra) {
      const isMitraPage = 
        pathname === "/mitra" || 
        pathname.startsWith("/mitra/") || 
        pathname === "/profile-mitra"; // Only allow these pages

      if (!isMitraPage) return <Navigate to="/mitra" />;

      return (
          <>
            {children}
            <MitraNavbar />
          </>
      );
  }

  // --- LOGIC GURU/LAINNYA ---
  // (Assuming non-students/non-mitra don't use this specific layout wrapper or have their own logic handled elsewhere? 
  //  The original code just returned children for others, assuming they are allowed everywhere else)
  
  return children;
}
