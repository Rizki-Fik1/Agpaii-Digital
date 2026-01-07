"use client";
import Loader from "@/components/loader/loader";
import Navigate from "@/components/navigator/navigate";
import { STUDENT_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {

  const { auth, authLoading } = useAuth();
  const pathname = usePathname();

  if (authLoading)
    return (
      <div className="flex justify-center h-screen items-center">
        {" "}
        <Loader className="size-12" />{" "}
      </div>
    );
  
  // Redirect ke halaman login jika tidak ada auth
  if (!auth) return <Navigate to="/getting-started" />;
  
  // Cek apakah user sudah di halaman siswa (student route group)
  const isStudentPage = pathname === "/beranda" || pathname.startsWith("/kelas") || pathname.startsWith("/forum");
  
  // Redirect siswa ke halaman beranda siswa HANYA jika belum di halaman siswa
  // dan jika siswa mengakses halaman guru lainnya
  if (auth.role_id === STUDENT_ROLE_ID && !isStudentPage) {
    return <Navigate to="/beranda" />;
  }
  
  return children;
}

