"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "@/utils/api/config";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";

interface LoginFormData {
  email: string;
  password: string;
}

// ================================================
// 🎓 AKUN DUMMY SISWA UNTUK TESTING
// ================================================
// Akun 1: Siswa baru (belum terdaftar di kelas)
const DUMMY_STUDENT_EMAIL = "siswa@demo.com";
const DUMMY_STUDENT_PASSWORD = "siswa123";
// Akun 2: Siswa yang sudah terdaftar di kelas
const DUMMY_STUDENT_ENROLLED_EMAIL = "siswakelas@demo.com";
const DUMMY_STUDENT_ENROLLED_PASSWORD = "siswa123";

export default function LoginEmailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<LoginFormData>();

  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Cek apakah login dengan akun dummy siswa (baru, belum terdaftar di kelas)
      if (data.email === DUMMY_STUDENT_EMAIL && data.password === DUMMY_STUDENT_PASSWORD) {
        // Set flag di localStorage untuk simulasi siswa baru
        localStorage.setItem("demo_student_mode", "true");
        localStorage.removeItem("demo_student_enrolled"); // Pastikan tidak enrolled
        return { access_token: "demo_student_token", is_demo_student: true };
      }
      
      // Cek apakah login dengan akun siswa yang sudah terdaftar di kelas
      if (data.email === DUMMY_STUDENT_ENROLLED_EMAIL && data.password === DUMMY_STUDENT_ENROLLED_PASSWORD) {
        // Set flag untuk siswa yang sudah terdaftar di kelas
        localStorage.setItem("demo_student_mode", "true");
        localStorage.setItem("demo_student_enrolled", "true");
        return { access_token: "demo_student_enrolled_token", is_demo_student: true, is_enrolled: true };
      }
      
      // Jika bukan akun dummy, hapus flag dan lanjut ke API biasa
      localStorage.removeItem("demo_student_mode");
      localStorage.removeItem("demo_student_enrolled");
      const res = await API.post("/login", data);
      if (res.status === 200) return res.data;
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err, "login");
      toast.error(errorMessage);
    },
    onSuccess: async (data) => {
      if (data?.is_demo_student) {
        // Untuk akun demo siswa, langsung invalidate dan redirect ke kelas
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        toast.success("Login berhasil sebagai Siswa Demo!");
        router.push("/kelas");
      } else {
        localStorage.setItem("access_token", data?.access_token);
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        router.push("/");
      }
    },
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-medium text-gray-700">Login</h1>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit(submit as any)} className="flex-1 flex flex-col px-6 pt-8">
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="Ardianita@example.com"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Sandi
            </label>
            <input
              type="password"
              placeholder="Minimal 8 karakter"
              {...register("password", { required: true })}
              className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Lupa kata sandi?</span>
            <Link href="/auth/password-reset" className="text-[#00AF70] font-medium">
              Atur ulang
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Masuk"}
          </button>

          {/* Demo Student Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 space-y-3">
            <p className="text-sm font-medium text-blue-700">🎓 Akun Demo Siswa:</p>
            
            {/* Akun Siswa Baru (belum di kelas) */}
            <div className="bg-white/60 rounded-md p-2">
              <p className="text-xs text-blue-700 font-medium mb-1">📝 Siswa Baru (belum di kelas)</p>
              <p className="text-xs text-blue-600">Email: <span className="font-mono">siswa@demo.com</span></p>
              <p className="text-xs text-blue-600">Password: <span className="font-mono">siswa123</span></p>
            </div>
            
            {/* Akun Siswa Terdaftar di Kelas */}
            <div className="bg-green-100/60 rounded-md p-2">
              <p className="text-xs text-green-700 font-medium mb-1">✅ Siswa Terdaftar di Kelas</p>
              <p className="text-xs text-green-600">Email: <span className="font-mono">siswakelas@demo.com</span></p>
              <p className="text-xs text-green-600">Password: <span className="font-mono">siswa123</span></p>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-auto pb-8 space-y-4">

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full py-4 bg-[#01925B] text-white font-medium rounded-full text-center hover:bg-[#1a1a1a] transition"
          >
            Daftar Akun
          </Link>
        </div>
      </form>
    </div>
  );
}

