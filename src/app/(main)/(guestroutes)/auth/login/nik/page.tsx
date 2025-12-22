"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "@/utils/api/config";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { useState } from "react";

interface LoginFormData {
  nik: string;
}

export default function LoginNikPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch } = useForm<LoginFormData>();
  const [nikError, setNikError] = useState<string>("");
  
  const nikValue = watch("nik");

  const { mutate: submit, isPending: loading } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Validate NIK length
      if (data.nik.length !== 16) {
        throw new Error("NIK harus 16 digit");
      }
      
      const res = await API.post("/login", { nik: data.nik });
      if (res.status === 200) return res.data;
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err, "login");
      toast.error(errorMessage);
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data?.access_token);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/");
    },
  });

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    // Validate length
    if (value.length > 0 && value.length < 16) {
      setNikError("Nomor NIK Anda harus berisi setidaknya 16 angka.");
    } else {
      setNikError("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-medium text-gray-700">Login</h1>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit(submit as any)} className="flex-1 flex flex-col px-6 pt-8">
        <div className="space-y-6">
          {/* NIK Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nomor NIK
            </label>
            <input
              type="text"
              placeholder="Minimal 16 karakter"
              {...register("nik", { 
                required: true, 
                minLength: 16, 
                maxLength: 16,
                onChange: handleNikChange
              })}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                nikError 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-[#00AF70] focus:border-[#00AF70]"
              }`}
              maxLength={16}
            />
            {nikError && nikValue && nikValue.length < 16 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">{nikError}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || nikValue?.length !== 16}
            className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-auto pb-8 space-y-4">

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full py-4 bg-[#2C2C2C] text-white font-medium rounded-full text-center hover:bg-[#1a1a1a] transition"
          >
            Daftar Akun
          </Link>
        </div>
      </form>
    </div>
  );
}
