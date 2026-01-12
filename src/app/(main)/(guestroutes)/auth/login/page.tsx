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
export default function LoginPage() {
  interface iFormField {
    loginType: "email" | "nik";
    email: string;
    password?: string;
  }
  const { register, handleSubmit, setValue, watch } = useForm<iFormField>({
    defaultValues: {
      loginType: "email",
    },
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const [loginType, setLoginType] = useState<"email" | "nik">("email");
  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: iFormField) => {
      try {
        let payload;
        if (data.loginType === "email") {
          payload = {
            email: data.email,
            password: data.password,
          };
        } else {
          payload = {
            nik: data.email, // Send input as 'nik' for NIK login
          };
        }
        const res = await API.post("/login", payload);
        if (res.status === 200) return res.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw error.response.data;
        } else {
          throw error;
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err, "login");
      toast.error(errorMessage);
    },
    onSuccess: async (data) => {
      // simpan token
      localStorage.setItem("access_token", data?.access_token);

      // ambil role dari berbagai kemungkinan struktur response
      const roleId = Number(
        data?.data?.role_id ?? 
        data?.data?.role?.id ?? 
        data?.data?.role ?? 
        data?.role_id ?? 
        data?.role?.id ?? 
        data?.role
      );

      // refresh auth query dan tunggu selesai
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      // Tunggu sebentar untuk memastikan auth ter-refresh
      await new Promise(resolve => setTimeout(resolve, 100));

      // arahkan berdasarkan role
      if (roleId === 8) {
        router.replace("/beranda"); // 🎓 SISWA - gunakan replace agar tidak bisa back
      } else {
        router.replace("/"); // 👤 ROLE LAIN
      }
    },
  });
  // Watch loginType to conditionally render password field
  const currentLoginType = watch("loginType");
  // Handle tab switch
  const handleTabChange = (type: "email" | "nik") => {
    setLoginType(type);
    setValue("loginType", type);
    setValue("email", ""); // Clear input when switching tabs
    setValue("password", ""); // Clear password when switching tabs
  };
  return (
    <div className="h-screen px-[5%] sm:px-8 py-8 flex flex-col">
      <div className="flex flex-col sm:px-2 mb-16 px-1 items-center text-center">
        <img src="/svg/agpaii2.svg" className="size-20" alt="agpaii-logo" />
        <p className="font-semibold capitalize text-3xl text-[#009788] sm:text-4xl -mt-2">
          Loginsss
        </p>
        <p className="text-slate-500 mt-2">
          Silahkan login menggunakan akun anda
        </p>
      </div>
      <form
        onSubmit={handleSubmit(submit as any)}
        method="POST"
        className="flex flex-col mt-0 gap-3 flex-grow sm:px-2"
      >
        {/* Login Type Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
              currentLoginType === "email"
                ? "border-b-2 border-[#009788] text-[#009788]"
                : "text-slate-600"
            }`}
            onClick={() => handleTabChange("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
              currentLoginType === "nik"
                ? "border-b-2 border-[#009788] text-[#009788]"
                : "text-slate-600"
            }`}
            onClick={() => handleTabChange("nik")}
          >
            NIK
          </button>
        </div>
        {/* Email or NIK Input */}
        <FormControl
          register={register}
          className="rounded-lg overflow-hidden"
          inputType="text"
          name="email"
          type="input"
          placeholder={currentLoginType === "email" ? "Email" : "NIK"}
          required
        />
        {/* Password Input (only for email login) */}
        {currentLoginType === "email" && (
          <FormControl
            register={register}
            className="rounded-lg overflow-hidden"
            inputType="password"
            name="password"
            type="input"
            placeholder="Password"
            required
          />
        )}
        <div className="flex flex-col *:py-2 *:text-base *:px-5 *:rounded-full mt-0 text-center text-white">
          {loading ? (
            <div className="flex justify-center">
              <Loader className="size-8" />
            </div>
          ) : (
            <button
              disabled={loading}
              className="bg-[#009788] disabled:bg-[#2d9389]"
              type="submit"
            >
              Login
            </button>
          )}
          <p className="text-slate-600 !text-sm mt-2">
            Belum Punya Akun?{" "}
            <Link className="text-blue-500 font-medium" href={"/auth/register"}>
              Daftar Sekarang
            </Link>
          </p>
          <div className="">
            <div className="flex flex-col gap-2 justify-center items-center text-sm text-slate-600">
              <div className="flex items-center gap-1 pt-4">
                <IoLockClosed className="text-sm" />
                <Link
                  className="text-blue-500 hover:underline"
                  href={"/auth/password-reset"}
                >
                  Lupa Password? Reset Sekarang
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <IoMailOutline className="text-sm" />
                <Link
                  className="text-blue-500 hover:underline"
                  href={"/auth/search-email"}
                >
                  Lupa Email? Cari Sekarang
                </Link>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <a
                  href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 32 32"
                    fill="white"
                  >
                    <path d="M16.001 3.2c-7.063 0-12.8 5.736-12.8 12.8 0 2.256.588 4.449 1.708 6.377L3.2 28.8l6.557-1.653A12.744 12.744 0 0 0 16 28.8c7.063 0 12.8-5.736 12.8-12.8S23.064 3.2 16.001 3.2zm0 22.4c-2.048 0-4.036-.548-5.78-1.588l-.415-.244-3.889 1.009 1.039-3.792-.256-.396A10.38 10.38 0 0 1 5.6 16c0-5.744 4.657-10.4 10.4-10.4 5.744 0 10.4 4.656 10.4 10.4 0 5.744-4.656 10.4-10.4 10.4zm5.544-7.832c-.3-.15-1.768-.873-2.041-.972-.273-.1-.473-.15-.673.15-.2.3-.773.972-.947 1.172-.173.2-.347.223-.647.074-.3-.149-1.263-.465-2.405-1.482-.889-.793-1.49-1.77-1.664-2.07-.173-.3-.018-.462.13-.61.134-.133.3-.347.45-.52.15-.174.2-.3.3-.5.1-.2.05-.374-.025-.523-.075-.15-.673-1.623-.923-2.226-.243-.583-.49-.505-.673-.514-.173-.008-.373-.01-.573-.01-.2 0-.523.075-.797.374-.273.3-1.045 1.02-1.045 2.487 0 1.468 1.07 2.883 1.218 3.084.149.2 2.11 3.223 5.11 4.522.715.308 1.27.492 1.704.63.716.228 1.368.196 1.884.119.574-.085 1.768-.723 2.017-1.422.248-.7.248-1.301.173-1.422-.074-.12-.273-.196-.572-.346z" />
                  </svg>
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
