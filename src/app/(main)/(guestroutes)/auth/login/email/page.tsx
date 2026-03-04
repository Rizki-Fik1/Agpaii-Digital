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
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";

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
      toast.error(getErrorMessage(err, "login"));
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data?.access_token);
      const roleId = Number(data?.data?.role_id ?? data?.data?.role?.id ?? data?.data?.role);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      if (roleId === 8) { router.replace("/beranda"); return; }
      router.replace("/");
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AuthBrandingPanel />

      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative">
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-6 md:px-12 lg:px-16 xl:px-20 md:py-8">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-700 md:text-xl md:font-semibold">Login dengan Email</h1>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-20 -mt-16 md:-mt-10">
          <motion.div
            className="md:max-w-md"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="hidden md:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Login Email
            </div>
            <h2 className="hidden md:block text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Masuk dengan Email</h2>
            <p className="hidden md:block text-slate-500 text-sm mb-8">Gunakan alamat email dan sandi Anda.</p>

            <form onSubmit={handleSubmit(submit as any)} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Alamat Email</label>
                <input type="email" placeholder="contoh@email.com"
                  {...register("email", { required: true })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#009788] placeholder-gray-400 bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 font-medium text-sm">Sandi</label>
                  <Link href="/auth/password-reset" className="text-[#009788] font-medium text-sm hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <input type="password" placeholder="••••••••"
                  {...register("password", { required: true })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#009788] placeholder-gray-400 bg-white transition-colors"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#009788] hover:bg-[#00867a] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? "Loading..." : "Masuk Ke Aplikasi"}
              </button>

              <div className="flex justify-center">
                <Link href="/auth/search-email" className="text-[#009788] font-medium text-sm hover:underline">
                  Lupa Email? Cari Sekarang
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">atau</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <a href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition"
              >
                <FaWhatsapp className="w-5 h-5" />
                Hubungi Kami
              </a>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
