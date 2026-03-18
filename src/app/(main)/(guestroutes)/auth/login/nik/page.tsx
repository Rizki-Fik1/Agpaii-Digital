"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "@/utils/api/config";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";

interface LoginFormData {
  nik: string;
}

export default function LoginNikPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch } = useForm<LoginFormData>();
  const [nikError, setNikError] = useState<string>("");
  const nikValue = watch("nik");
  const [goBack, setGoBack] = useState(false);

  useEffect(() => {
    if (goBack) {
      router.replace("/getting-started");
    }
  }, [goBack, router]);

  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      if (data.nik.length !== 16) throw new Error("NIK harus 16 digit");
      const res = await API.post("/login", { nik: data.nik });
      if (res.status === 200) return res.data;
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "login"));
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data?.access_token);
      const roleId = Number(data?.data?.role_id ?? data?.data?.role?.id ?? data?.data?.role);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      if (roleId === 8) window.location.href = "/beranda";
      else window.location.href = "/";
    },
  });

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;
    if (value.length > 0 && value.length < 16) {
      setNikError("Nomor NIK Anda harus berisi setidaknya 16 angka.");
    } else {
      setNikError("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AuthBrandingPanel />

      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative">
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 px-6 py-6 md:px-12 lg:px-16 xl:px-20 md:py-8">
          <button
            onClick={() => setGoBack(true)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-700 md:text-xl md:font-semibold">Login dengan NIK</h1>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-20 -mt-16 md:-mt-10 pointer-events-none md:pointer-events-auto">
          <motion.div
            className="md:max-w-md pointer-events-auto"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="hidden md:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Login NIK
            </div>
            <h2 className="hidden md:block text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Masuk dengan NIK</h2>
            <p className="hidden md:block text-slate-500 text-sm mb-8">Masukkan 16 digit Nomor Induk Kependudukan Anda.</p>

            <form onSubmit={handleSubmit(submit as any)} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Nomor NIK</label>
                <input type="text" placeholder="Masukkan 16 digit NIK"
                  {...register("nik", { required: true, minLength: 16, maxLength: 16, onChange: handleNikChange })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 bg-white transition-colors ${
                    nikError ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#009788]"
                  }`}
                  maxLength={16}
                />
                {nikError && nikValue && nikValue.length < 16 && (
                  <p className="text-red-500 text-sm mt-1.5">{nikError}</p>
                )}
              </div>

              <button type="submit" disabled={loading || nikValue?.length !== 16}
                className="w-full py-3.5 bg-[#009788] hover:bg-[#00867a] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? "Loading..." : "Masuk Ke Aplikasi"}
              </button>

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
