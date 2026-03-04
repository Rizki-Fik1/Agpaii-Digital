"use client";
import FormControl from "@/components/form/form_control";
import API from "@/utils/api/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader/loader";
import { useState } from "react";
import { IoLockClosed, IoMailOutline } from "react-icons/io5";
import { getErrorMessage } from "@/utils/error-handler";
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";

export default function LoginPage() {
  interface iFormField {
    loginType: "email" | "nik";
    email: string;
    password?: string; 
  }
  const { register, handleSubmit, setValue, watch } = useForm<iFormField>({
    defaultValues: { loginType: "email" },
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const [loginType, setLoginType] = useState<"email" | "nik">("email");
  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: iFormField) => {
      try {
        let payload;
        if (data.loginType === "email") {
          payload = { email: data.email, password: data.password };
        } else {
          payload = { nik: data.email };
        }
        const res = await API.post("/login", payload);
        if (res.status === 200) return res.data;
      } catch (error: any) {
        if (error.response && error.response.data) throw error.response.data;
        else throw error;
      }
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "login"));
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data?.access_token);
      const roleId = Number(
        data?.data?.role_id ?? data?.data?.role?.id ?? data?.data?.role ?? 
        data?.role_id ?? data?.role?.id ?? data?.role
      );
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      await new Promise(resolve => setTimeout(resolve, 100));
      if (roleId === 8) router.replace("/beranda");
      else if (roleId === 14) router.replace("/mitra");
      else router.replace("/");
    },
  });

  const currentLoginType = watch("loginType");
  const handleTabChange = (type: "email" | "nik") => {
    setLoginType(type);
    setValue("loginType", type);
    setValue("email", "");
    setValue("password", "");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Branding Panel - Desktop */}
      <AuthBrandingPanel />

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative">
        {/* Top accent line - desktop */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        <div className="flex-1 flex flex-col justify-center px-[5%] sm:px-8 py-8 md:px-12 lg:px-16 xl:px-20">
          <motion.div
            className="md:max-w-xl md:mx-auto md:w-full"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8 md:mb-10">
              {/* Mobile logo */}
              <img src="/svg/agpaii2.svg" className="size-20 md:hidden mx-auto" alt="agpaii-logo" />
              
              {/* Desktop badge */}
              <div className="hidden md:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Masuk ke Akun
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mt-4 md:mt-0 leading-tight">
                Selamat Datang 👋
              </h2>
              <p className="text-slate-500 mt-2 text-sm md:text-[15px]">
                Silakan masukkan detail akun Anda untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(submit as any)}
              method="POST"
              className="flex flex-col gap-5"
            >
              {/* Login Type Tabs */}
              <div className="flex bg-slate-100 md:bg-white md:border md:border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  className={`flex-1 py-2.5 px-4 text-center text-sm font-medium rounded-lg transition-all ${
                    currentLoginType === "email"
                      ? "bg-[#009788] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => handleTabChange("email")}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 px-4 text-center text-sm font-medium rounded-lg transition-all ${
                    currentLoginType === "nik"
                      ? "bg-[#009788] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => handleTabChange("nik")}
                >
                  NIK
                </button>
              </div>

              {/* Input Fields */}
              <div>
                <label className="block text-slate-700 font-medium text-sm mb-1.5">
                  {currentLoginType === "email" ? "Username atau Email" : "Nomor NIK"}
                </label>
                <FormControl
                  register={register}
                  className="rounded-xl overflow-hidden"
                  inputType="text"
                  name="email"
                  type="input"
                  placeholder={currentLoginType === "email" ? "contoh@email.com" : "Masukkan NIK Anda"}
                />
              </div>

              {currentLoginType === "email" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-medium text-sm">Password</label>
                    <Link className="text-[#009788] hover:underline text-sm font-medium" href="/auth/password-reset">
                      Lupa password?
                    </Link>
                  </div>
                  <FormControl
                    register={register}
                    className="rounded-xl overflow-hidden"
                    inputType="password"
                    name="password"
                    type="input"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Submit */}
              <div className="mt-1">
                {loading ? (
                  <div className="flex justify-center py-3">
                    <Loader className="size-8" />
                  </div>
                ) : (
                  <button
                    disabled={loading}
                    className="w-full py-3.5 bg-[#009788] hover:bg-[#00867a] disabled:bg-[#2d9389] text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md"
                    type="submit"
                  >
                    Masuk Ke Aplikasi
                  </button>
                )}
              </div>

              {/* Register Link */}
              <p className="text-slate-500 text-sm text-center mt-1">
                Baru tergabung dalam keanggotaan?{" "}
                <Link className="text-[#009788] font-semibold hover:underline" href="/auth/register">
                  Daftar sekarang →
                </Link>
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">bantuan</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Help Links */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <Link href="/auth/search-email"
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#009788] transition-colors">
                  <IoMailOutline className="text-sm" />
                  Lupa Email?
                </Link>
                <span className="hidden sm:block text-slate-200">|</span>
                <a
                  href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16.001 3.2c-7.063 0-12.8 5.736-12.8 12.8 0 2.256.588 4.449 1.708 6.377L3.2 28.8l6.557-1.653A12.744 12.744 0 0 0 16 28.8c7.063 0 12.8-5.736 12.8-12.8S23.064 3.2 16.001 3.2zm5.544 18.568c-.3-.15-1.768-.873-2.041-.972-.273-.1-.473-.15-.673.15-.2.3-.773.972-.947 1.172-.173.2-.347.223-.647.074-.3-.149-1.263-.465-2.405-1.482-.889-.793-1.49-1.77-1.664-2.07-.173-.3-.018-.462.13-.61.134-.133.3-.347.45-.52.15-.174.2-.3.3-.5.1-.2.05-.374-.025-.523-.075-.15-.673-1.623-.923-2.226-.243-.583-.49-.505-.673-.514-.173-.008-.373-.01-.573-.01-.2 0-.523.075-.797.374-.273.3-1.045 1.02-1.045 2.487 0 1.468 1.07 2.883 1.218 3.084.149.2 2.11 3.223 5.11 4.522.715.308 1.27.492 1.704.63.716.228 1.368.196 1.884.119.574-.085 1.768-.723 2.017-1.422.248-.7.248-1.301.173-1.422-.074-.12-.273-.196-.572-.346z" />
                  </svg>
                  Hubungi Kami
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
