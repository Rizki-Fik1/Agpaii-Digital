"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "@/utils/api/config";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { FaWhatsapp } from "react-icons/fa";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginEmailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<LoginFormData>();

  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await API.post("/login", data);
      if (res.status === 200) return res.data;
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err, "login");
      toast.error(errorMessage);
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data?.access_token);
      
      const roleId = Number(data?.data?.role_id ?? data?.data?.role?.id ?? data?.data?.role);

      // Refresh auth dan tunggu
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      await new Promise(resolve => setTimeout(resolve, 100));

      // ===============================
      // 🎓 SISWA (role_id = 8 dari STUDENT_ROLE_ID)
      // ===============================
      if (roleId === 8) {
        router.replace("/beranda");
        return;
      }

      // ===============================
      // 👤 ROLE LAIN (Guru, Admin, dll)
      // ===============================
      router.replace("/");
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
      <form
        onSubmit={handleSubmit(submit as any)}
        className="flex-1 flex flex-col px-6 pt-8"
      >
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
            <Link
              href="/auth/password-reset"
              className="text-[#00AF70] font-medium"
            >
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
        </div>

        {/* Bottom Buttons */}
        <div className="mt-40 pb-8 space-y-4">
          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#01925B] text-white font-medium rounded-full text-center hover:bg-[#1a1a1a] transition"
          >
            <FaWhatsapp className="w-5 h-5" />
            Hubungi Kami
          </Link>
        </div>
      </form>
    </div>
  );
}
