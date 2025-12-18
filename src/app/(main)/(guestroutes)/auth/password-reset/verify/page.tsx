"use client";

import OTPInput from "@/components/form/OTPInput";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import FormControl from "@/components/form/form_control";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
        toast.error(error.response.data.message);
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
      onError: async (err) => toast.error(err.message),
      onSuccess: async (data) => {
        toast.success(data.message);
        router.push("/auth/login");
      },
    });

  return !verifySuccess ? (
    <div className="flex flex-col items-center px-[5%] sm:px-6 ">
      {" "}
      <Link
        href={"/auth/password-reset"}
        className="flex items-center gap-2 pt-4 justify-start w-full pb-40"
      >
        <ChevronLeftIcon className="size-4" />
        <h1 className="text-[0.9rem]">Kembali</h1>
      </Link>
      <OTPInput
        onComplete={(num) => setCredentials((c) => ({ ...c, code: num }))}
        length={4}
      />
      <h1 className="text-slate-600 mt-6 text-center mx-6 ">
        Masukkan kode otp yang telah dikirimkan ke email anda
      </h1>
      {isPending ? (
        <div className="flex justify-center mt-8">
          <Loader className="size-12" />
        </div>
      ) : (
        <button
          onClick={() => verify()}
          className="px-4 w-2/3 mt-8 py-2 bg-[#009788] text-white rounded-md"
        >
          Verifikasi
        </button>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center pt-28 px-6">
      <h1 className="text-2xl font-semibold text-slate-800 mt-4">
        Reset Password
      </h1>
      <p className="mt-0 text-slate-500">Masukkan password baru anda.</p>
      <form
        onSubmit={handleSubmit(changePassword as any)}
        className="flex flex-col mt-16 gap-3 w-full sm:px-8"
      >
        <div className="relative w-full ">
          <FormControl
            className="rounded-md overflow-hidden"
            inputType="password"
            type={"input"}
            name="password"
            placeholder="Masukkan Password"
            register={register}
          />
          <FormControl
            className="rounded-md mt-3 overflow-hidden"
            inputType="password"
            type={"input"}
            name="password_confirmation"
            placeholder="Konfirmasi Password"
            register={register}
            error={errors["password_confirmation"]}
          />
        </div>
        {changePasswordPending ? (
          <div className="flex justify-center mt-8">
            <Loader className="size-10" />
          </div>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-[#009788] text-white rounded-md mt-8 flex justify-center"
          >
            Submit
          </button>
        )}
      </form>
    </div>
  );
}
