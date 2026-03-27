"use client";

import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error-handler";
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const { mutate: searchUser, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await API.get(`/otp-client/search/${email}`);
        if (res.status == 200) return res.data.id;
      } catch (err: any) {
        if (err.response && err.response.data)
          throw new Error(err.response.data.message);
        else throw err;
      }
    },
    onSuccess: (id) => sendOtp(id),
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err, "user");
      toast.error(errorMessage);
    },
  });

  const { mutate: sendOtp } = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await API.post("/otp-client", { user_id: id });
        if (res.status == 200) return res.data;
      } catch (err: any) {
        if (err.response && err.response.data)
          throw new Error(err.response.data.message);
        else throw err;
      }
    },
    onSuccess: async (data) => {
      toast.success(data.message);
      router.push("/auth/password-reset/verify/?email=" + email);
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (!!params.get("email")) {
      setEmail(params.get("email") as string);
    }
  }, [params]);

  return (
    <div className="flex flex-col justify-center px-[5%] sm:px-8 pb-10 md:px-12 lg:px-16 xl:px-20">
      <motion.div
        className="md:max-w-xl md:mx-auto md:w-full"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {/* Header content moved from layout to here for more context */}
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
            Lupa Password? 🔐
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Masukkan alamat email anda untuk menerima kode OTP
          </p>
        </div>

        <form
          method="POST"
          onSubmit={(e: any) => {
            e.preventDefault();
            searchUser();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#009788] transition-all outline-none bg-white placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-4 pt-2">
            {isPending ? (
              <div className="flex justify-center py-4">
                <Loader className="size-10" />
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isPending || email.length < 5}
                  className="w-full py-4 bg-[#009788] hover:bg-[#00867a] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Kirim Kode OTP
                </button>
                
                <div className="pt-4 flex flex-col gap-3">
                  <p className="text-sm text-center text-slate-500">
                    Ingat password anda?{" "}
                    <Link
                      href="/auth/login"
                      className="text-[#009788] font-bold hover:underline"
                    >
                      Login sekarang
                    </Link>
                  </p>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">atau</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>

                  <Link
                    href="/auth/password-reset/search-user"
                    className="flex items-center justify-center gap-2 text-sm text-[#009788] font-bold hover:bg-emerald-50 py-3 rounded-xl transition-colors"
                  >
                    Cari Email Saya
                  </Link>
                </div>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
