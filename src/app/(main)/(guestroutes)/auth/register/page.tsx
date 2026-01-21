"use client";

import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ChevronLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { STUDENT_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context"; // ✅ DITAMBAHKAN

export default function Register() {
  const { setAuth } = useAuth(); // ✅ DITAMBAHKAN

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    name: string;
    value: number;
  } | null>(null);

  // Student-specific states
  const [schoolPlace, setSchoolPlace] = useState("");
  const [nisn, setNisn] = useState("");

  const roleOptions = [
    { name: "Guru PAI", value: 2 },
    { name: "Kepala Sekolah", value: 11 },
    { name: "Pengawas PAI", value: 7 },
    { name: "Anggota Luar Biasa", value: 9 },
    { name: "Anggota Kehormatan", value: 10 },
    { name: "Siswa", value: STUDENT_ROLE_ID },
  ];

  const isSiswaSelected = selectedRole?.value === STUDENT_ROLE_ID;

  const userSchema = z
    .object({
      name: z.string().min(3),
      email: z.string().email(),
      no_hp: z.string().min(10),
      nik: z.string().optional().or(z.literal("")),
      password: z.string().min(8),
      password_confirmation: z.string(),
      role_id: z.string().min(1),
    })
    .refine((d) => d.password === d.password_confirmation, {
      path: ["password_confirmation"],
    })
    .refine(
      (d) => {
        if (d.role_id !== STUDENT_ROLE_ID.toString()) {
          return d.nik && d.nik.length === 16;
        }
        return true;
      },
      { path: ["nik"] }
    );

  type FormFields = z.infer<typeof userSchema>;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const endpoint =
        payload.role_id === STUDENT_ROLE_ID.toString()
          ? "/register-student"
          : "/register";

      const res = await API.post(endpoint, payload);
      return res.data;
    },
    onSuccess: async (data, variables) => {
      localStorage.setItem("access_token", data.access_token);

      // 🔥 INI KUNCI FIX MASALAH
      try {
        const me = await API.get("/me");
        setAuth(me.data); // ✅ SET AUTH CONTEXT
        queryClient.setQueryData(["auth"], me.data);
      } catch {
        // fallback aman
      }

      if (variables.role_id === STUDENT_ROLE_ID.toString()) {
        toast.success("Registrasi siswa berhasil!");
        router.push("/beranda");
      } else {
        toast.success("Registrasi berhasil!");
        router.push("/");
      }
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      no_hp: "",
      nik: "",
      password: "",
      password_confirmation: "",
      role_id: "",
    },
  });

  const onSubmit = (data: FormFields) => {
    if (isSiswaSelected) {
      if (!schoolPlace || schoolPlace.length < 3) {
        toast.error("Nama sekolah harus minimal 3 karakter");
        return;
      }
      if (!nisn || nisn.length !== 10) {
        toast.error("NISN harus 10 digit");
        return;
      }

      createAccount({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        no_hp: data.no_hp,
        nisn,
        school_place: schoolPlace.trim(),
        role_id: STUDENT_ROLE_ID.toString(),
      });
    } else {
      createAccount(data);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-medium text-gray-700">Daftar</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col px-6 pt-4"
      >
        <div className="space-y-4">
          {/* Daftar Sebagai */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Daftar Sebagai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-left bg-white flex items-center justify-between transition ${
                  errors.role_id
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#00AF70] focus:border-[#00AF70]"
                }`}
              >
                <span
                  className={selectedRole ? "text-gray-700" : "text-gray-400"}
                >
                  {selectedRole ? selectedRole.name : "Pilih Role"}
                </span>
                <svg
                  className={`w-5 h-5 text-[#00AF70] transition-transform ${
                    isRoleDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#00AF70] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(option);
                        setValue("role_id", option.value.toString(), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#00AF70] hover:bg-opacity-10 transition flex items-center gap-3 ${
                        selectedRole?.value === option.value
                          ? "bg-[#00AF70] bg-opacity-10 text-[#00AF70] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.value === STUDENT_ROLE_ID && (
                        <AcademicCapIcon className="w-5 h-5" />
                      )}
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.role_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role_id.message}
              </p>
            )}
          </div>

          {/* Student-specific fields */}
          {isSiswaSelected && (
            <>
              {/* Nama Sekolah - Manual Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nama Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  value={schoolPlace}
                  onChange={(e) => setSchoolPlace(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                    schoolPlace.trim().length >= 3
                      ? "border-[#00AF70] focus:border-[#00AF70]"
                      : "border-gray-300 focus:border-[#00AF70]"
                  }`}
                />
                <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter</p>
              </div>

              {/* NISN */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NISN (Nomor Induk Siswa Nasional){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0012345678"
                  value={nisn}
                  onChange={(e) =>
                    setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                    nisn.length === 10
                      ? "border-[#00AF70] focus:border-[#00AF70]"
                      : "border-gray-300 focus:border-[#00AF70]"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-500 text-xs">
                    NISN terdiri dari 10 digit angka
                  </p>
                  {nisn.length > 0 && (
                    <p
                      className={`text-xs ${
                        nisn.length === 10
                          ? "text-[#00AF70]"
                          : "text-orange-500"
                      }`}
                    >
                      {nisn.length}/10
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Nama Lengkap */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ardianita"
              {...register("name")}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#00AF70] focus:border-[#00AF70]"
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              </div>
            )}
          </div>

          {/* Nomor HP */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nomor HP <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Minimal 10 karakter"
              {...register("no_hp")}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                errors.no_hp
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#00AF70] focus:border-[#00AF70]"
              }`}
            />
            {errors.no_hp && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">{errors.no_hp.message}</p>
              </div>
            )}
          </div>

          {/* Nomor NIK - only for non-students */}
          {!isSiswaSelected && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nomor NIK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Minimal 16 karakter"
                {...register("nik")}
                maxLength={16}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                  errors.nik
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#00AF70] focus:border-[#00AF70]"
                }`}
              />
              {errors.nik && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                  <p className="text-red-500 text-sm">{errors.nik.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Alamat Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Alamat Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Ardianita@example.com"
              {...register("email")}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#00AF70] focus:border-[#00AF70]"
              }`}
            />
            {errors.email && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              </div>
            )}
          </div>

          {/* Tetapkan kata sandi Anda */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tetapkan kata sandi Anda <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                {...register("password")}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#00AF70] focus:border-[#00AF70]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              </div>
            )}
          </div>

          {/* Konfirmasi kata sandi Anda */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Konfirmasi kata sandi Anda <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                {...register("password_confirmation")}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
                  errors.password_confirmation
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#00AF70] focus:border-[#00AF70]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
                <p className="text-red-500 text-sm">
                  {errors.password_confirmation.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-8 pb-8">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Mendaftar...
              </span>
            ) : (
              "Bergabung Sekarang"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
