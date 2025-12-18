"use client";

import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    onError: (err) => toast.error(err.message),
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
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (!!params.get("email")) {
      setEmail(params.get("email") as string);
    }
  }, [params]);

  return (
    <form
      method="POST"
      onSubmit={(e: any) => {
        e.preventDefault();
        searchUser();
      }}
    >
      <p className="px-4 sm:px-12 text-sm -mt-3 text-center text-slate-500">
        Masukkan alamat email anda untuk menerima kode OTP
      </p>
      <div className="sm:px-8 w-full mt-6 flex flex-col items-center">
        <FormControl
          className="rounded-md mx-2 overflow-hidden"
          onChange={(e) => setEmail(e.target.value)}
          name={""}
          value={email}
          type="input"
          placeholder=""
          inputType={"text"}
        />
        {isPending ? (
          <div className="justify-center flex pt-12">
            <Loader className="size-8" />
          </div>
        ) : (
          <>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-[#009788] text-white rounded-md w-fit mt-8"
            >
              Kirim OTP
            </button>
            <p className="text-sm mt-3">
              Lupa email?{" "}
              <Link
                href={"/auth/password-reset/search-user"}
                className="text-[#009788]"
              >
                Klik Disini
              </Link>
            </p>
          </>
        )}
      </div>
    </form>
  );
}
