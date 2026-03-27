"use client";

import OTPInput from "@/components/form/OTPInput";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import FormControl from "@/components/form/form_control";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/utils/error-handler";

const schema = z
  .object({
    password: z.string(),
    password_confirmation: z.string(),
  })
  .refine(
    ({ password, password_confirmation }) => password == password_confirmation,
    {
      message: "Konfirmasi password tidak sesuai",
      path: ["password_confirmation"],
    }
  );

type Fields = z.infer<typeof schema>;

import { motion } from "framer-motion";

export default function VerifyPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Record<string, any>>({
    email: null,
    code: null,
    password: null,
    password_confirmation: null,
  });

  const [verifySuccess, setVerifySuccess] = useState(false);
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  
  useEffect(() => {
    if (!!params.get("email"))
      setCredentials((c) => ({ ...c, email: params.get("email") }));
  }, [params]);

  const { data: user } = useQuery({
    enabled: !!credentials.email,
    queryKey: ["users", credentials.email],
    queryFn: async () => {
      const res = await API.get("/otp-client/search/" + credentials.email);
      if (res.status == 200) return res.data;
    },
  });

  const { mutate: verify, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await API.post("/otp-client/verify", {
          user_id: user.id,
          code: credentials.code,
        });

        if (res.status == 200) setVerifySuccess(true);
      } catch (error: any) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  const { mutate: changePassword, isPending: changePasswordPending } =
    useMutation({
      mutationFn: async (data: Fields) => {
        try {
          const res = await API.post("/otp-client/change-password", {
            user_id: user.id,
            code: credentials.code,
            password: data.password,
          });
          if (res.status == 200) {
            return res.data;
          }
        } catch (error: any) {
          if (error.response && error.response.data) throw error.response.data;
          else throw error;
        }
      },
      onError: async (err: any) => {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
      },
      onSuccess: async (data) => {
        toast.success(data.message);
        router.push("/auth/login");
      },
    });

  return (
    <div className="flex flex-col px-6 md:px-12 lg:px-16 xl:px-20 pb-10">
      <motion.div
        className="md:max-w-xl md:mx-auto md:w-full"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {!verifySuccess ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                Masukkan Kode OTP 📩
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Kami telah mengirimkan 4 digit kode verifikasi ke email <span className="font-bold text-slate-700">{credentials.email}</span>
              </p>
            </div>

            <div className="flex justify-center py-4">
              <OTPInput
                onComplete={(num) => setCredentials((c) => ({ ...c, code: num }))}
                length={4}
              />
            </div>

            <div className="pt-6">
              {isPending ? (
                <div className="flex justify-center py-4">
                  <Loader className="size-10" />
                </div>
              ) : (
                <button
                  onClick={() => verify()}
                  disabled={!credentials.code || credentials.code.length < 4}
                  className="w-full py-4 bg-[#009788] hover:bg-[#00867a] disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Verifikasi Sekarang
                </button>
              )}
              
              <p className="text-center text-sm text-slate-400 mt-6">
                Tidak menerima kode? <button className="text-[#009788] font-bold hover:underline">Kirim Ulang</button>
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(changePassword as any)}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                Buat Password Baru 🔒
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Gunakan kombinasi yang kuat agar akun Anda tetap aman.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-700 font-medium mb-2 text-sm">
                  Password Baru
                </label>
                <div className="relative group">
                   <FormControl
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#009788] transition-all outline-none bg-white placeholder-gray-400"
                    inputType="password"
                    type={"input"}
                    name="password"
                    placeholder="Minimal 8 karakter"
                    register={register}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2 text-sm">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <FormControl
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#009788] transition-all outline-none bg-white placeholder-gray-400"
                    inputType="password"
                    type={"input"}
                    name="password_confirmation"
                    placeholder="Ulangi password baru"
                    register={register}
                    error={errors["password_confirmation"]}
                  />
                </div>
                {errors["password_confirmation"] && (
                   <p className="text-red-500 text-xs mt-2 italic flex items-center gap-1">
                      <span>⚠️</span> {errors["password_confirmation"].message as string}
                   </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              {changePasswordPending ? (
                <div className="flex justify-center py-4">
                  <Loader className="size-10" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 bg-[#009788] hover:bg-[#00867a] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Simpan Password & Login
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
