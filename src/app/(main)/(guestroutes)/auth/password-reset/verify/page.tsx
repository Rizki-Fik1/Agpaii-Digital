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

  return !verifySuccess ? (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6">
        <Link href="/auth/password-reset" className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-xl font-medium text-gray-700">Verifikasi OTP</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Masukkan Kode OTP
            </h2>
            <p className="text-gray-600">
              Kode verifikasi telah dikirim ke email Anda
            </p>
          </div>

          <OTPInput
            onComplete={(num) => setCredentials((c) => ({ ...c, code: num }))}
            length={4}
          />
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pb-8">
          {isPending ? (
            <div className="flex justify-center py-4">
              <Loader className="size-8" />
            </div>
          ) : (
            <button
              onClick={() => verify()}
              className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition"
            >
              Verifikasi
            </button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-medium text-gray-700">Reset Password</h1>
      </div>

      {/* Main Content */}
      <form
        onSubmit={handleSubmit(changePassword as any)}
        className="flex-1 flex flex-col px-6 pt-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Buat Password Baru
            </h2>
            <p className="text-gray-600">
              Masukkan password baru untuk akun Anda
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password Baru
            </label>
            <FormControl
              className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
              inputType="password"
              type={"input"}
              name="password"
              placeholder="Minimal 8 karakter"
              register={register}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Konfirmasi Password
            </label>
            <FormControl
              className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
              inputType="password"
              type={"input"}
              name="password_confirmation"
              placeholder="Ulangi password"
              register={register}
              error={errors["password_confirmation"]}
            />
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pb-8">
          {changePasswordPending ? (
            <div className="flex justify-center py-4">
              <Loader className="size-8" />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition"
            >
              Simpan Password
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
