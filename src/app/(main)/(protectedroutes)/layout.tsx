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
  if (!auth) {
    return <Navigate to="/getting-started" />;
  }

  // Cek apakah user adalah siswa
  const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);
  const isStudent = roleId === STUDENT_ROLE_ID;

  // Cek apakah user sudah di halaman siswa (student route group)
  // PENTING: /kelas-guru adalah untuk GURU, bukan siswa!
  const isStudentPage =
    pathname === "/beranda" ||
    pathname.startsWith("/beranda/") ||
    (pathname.startsWith("/kelas") && !pathname.startsWith("/kelas-guru")) ||
    pathname.startsWith("/forum") ||
    pathname === "/profile-siswa" ||
    pathname.startsWith("/profile-siswa/");

  // Redirect siswa ke halaman beranda siswa HANYA jika belum di halaman siswa
  // Ini mencegah siswa mengakses halaman guru
  if (isStudent && !isStudentPage) {
    return <Navigate to="/beranda" />;
  }

  // Redirect non-siswa dari halaman siswa ke home
  if (!isStudent && isStudentPage) {
    return <Navigate to="/" />;
  }

  return children;
}
