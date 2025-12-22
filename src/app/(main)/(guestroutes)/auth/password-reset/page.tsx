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
    <div className="bg-white px-6 pt-4">
      <form
        method="POST"
        onSubmit={(e: any) => {
          e.preventDefault();
          searchUser();
        }}
      >
        <p className="text-center text-slate-600 mb-6">
          Masukkan alamat email anda untuk menerima kode OTP
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Alamat Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
            required
          />
        </div>

        <div className="space-y-4">
          {isPending ? (
            <div className="flex justify-center py-4">
              <Loader className="size-8" />
            </div>
          ) : (
            <>
              <button
                type="submit"
                className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition"
              >
                Kirim OTP
              </button>
              <p className="text-sm text-center text-slate-600">
                Lupa email?{" "}
                <Link
                  href={"/auth/password-reset/search-user"}
                  className="text-[#00AF70] font-medium"
                >
                  Klik Disini
                </Link>
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
