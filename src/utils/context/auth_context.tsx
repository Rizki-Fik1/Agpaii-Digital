"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";
import API from "../api/config";
import { STUDENT_ROLE_ID } from "@/constants/student-data";

export const AuthContext = createContext<any>(null);

// ================================================
// 🔧 MODE DEMO SISWA
// ================================================
// Terdapat 2 akun demo:
// 1. siswa@demo.com - Siswa baru yang belum terdaftar di kelas
// 2. siswakelas@demo.com - Siswa yang sudah terdaftar di kelas (Ahmad Fauzan)
// Flag dicek dari localStorage (diset saat login dengan akun demo)

// Mock data siswa BARU (belum terdaftar di kelas apapun)
const MOCK_STUDENT_DATA = {
  id: 999,
  name: "Ahmad Siswa (DEMO)",
  email: "siswa.demo@sekolah.sch.id",
  role_id: STUDENT_ROLE_ID, // 12
  avatar: null,
  kta_id: null,
  user_activated_at: "2026-01-01",
  point: 0,
  settings: [],
  created_at: "2026-01-01",
  updated_at: "2026-01-07",
  expired_at: "2027-01-01",
  deleted_at: null,
  age: 15,
  profile: {
    id: 999,
    user_id: 999,
    nip: "",
    nik: "1234567890123456",
    contact: "081234567890",
    school_place: "SMP Negeri 1 Jakarta",
    home_address: "Jakarta",
    educational_level_id: 1,
    unit_kerja: "",
    nama_kepala_satuan_pendidikan: "",
    nip_kepala_satuan_pendidikan: "",
    gender: "L",
    birthdate: "2011-01-01",
    created_at: "2026-01-01",
    updated_at: "2026-01-07",
    province_id: 31,
    city_id: 3171,
    district_id: 317101,
    short_bio: null,
    long_bio: "",
    headmaster_name: "",
    headmaster_nip: "",
    grade_id: 9,
    school_status: "",
  },
  role: {
    id: STUDENT_ROLE_ID,
    name: "siswa",
    display_name: "Siswa",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
};

// Mock data siswa yang SUDAH TERDAFTAR di kelas (Ahmad Fauzan dari MOCK_STUDENTS_BY_CLASS)
// Siswa ini sudah memiliki kelas dan bisa mengakses fitur kelas lengkap
const MOCK_ENROLLED_STUDENT_DATA = {
  id: 101, // ID dari MOCK_STUDENTS_BY_CLASS
  name: "Ahmad Fauzan",
  email: "ahmad.fauzan@siswa.id",
  role_id: STUDENT_ROLE_ID, // 12
  avatar: null,
  kta_id: null,
  user_activated_at: "2026-01-01",
  point: 150,
  settings: [],
  created_at: "2024-01-05",
  updated_at: "2026-01-09",
  expired_at: "2027-01-01",
  deleted_at: null,
  age: 15,
  profile: {
    id: 101,
    user_id: 101,
    nip: "",
    nik: "0012345678", // NISN dari data
    contact: "081234567891",
    school_place: "SMP Negeri 1 Jakarta",
    home_address: "Jakarta",
    educational_level_id: 1,
    unit_kerja: "",
    nama_kepala_satuan_pendidikan: "",
    nip_kepala_satuan_pendidikan: "",
    gender: "L",
    birthdate: "2011-05-15",
    created_at: "2024-01-05",
    updated_at: "2026-01-09",
    province_id: 31,
    city_id: 3171,
    district_id: 317101,
    short_bio: "Siswa kelas 9A",
    long_bio: "",
    headmaster_name: "",
    headmaster_nip: "",
    grade_id: 9,
    school_status: "active",
  },
  role: {
    id: STUDENT_ROLE_ID,
    name: "siswa",
    display_name: "Siswa",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  // Flag khusus untuk menandakan siswa sudah terdaftar di kelas
  is_enrolled_in_class: true,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    isError,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      // Cek apakah mode demo siswa aktif
      const isDemoStudent = typeof window !== 'undefined' && localStorage.getItem("demo_student_mode") === "true";
      const isEnrolledStudent = typeof window !== 'undefined' && localStorage.getItem("demo_student_enrolled") === "true";
      
      if (isDemoStudent) {
        // Jika siswa sudah terdaftar di kelas, gunakan data enrolled
        if (isEnrolledStudent) {
          return MOCK_ENROLLED_STUDENT_DATA;
        }
        // Jika siswa baru, gunakan data siswa baru
        return MOCK_STUDENT_DATA;
      }

      try {
        const res = await API.get("/me");
        if (res.status === 200) return res.data;
        else return null;
      } catch (err) {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  const auth = useMemo(() => user, [user]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        authError: isError,
        authLoading: isLoading,
        authPending: isFetching,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
