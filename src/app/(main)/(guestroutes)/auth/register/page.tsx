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
  BuildingOfficeIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useCallback } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { STUDENT_ROLE_ID, MITRA_ROLE_ID } from "@/constants/student-data";
import { useAuth } from "@/utils/context/auth_context";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";

export default function Register() {
  const { setAuth } = useAuth();

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

  // Mitra-specific states
  const [instansi, setInstansi] = useState("");
  const [pic, setPic] = useState("");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [finalLogo, setFinalLogo] = useState<Blob | null>(null);
  const [finalLogoPreview, setFinalLogoPreview] = useState<string | null>(null);

  const roleOptions = [
    { name: "Guru PAI", value: 2 },
    { name: "Kepala Sekolah", value: 11 },
    { name: "Pengawas PAI", value: 7 },
    { name: "Anggota Luar Biasa", value: 9 },
    { name: "Anggota Kehormatan", value: 10 },
    { name: "Siswa", value: STUDENT_ROLE_ID },
    { name: "Mitra", value: MITRA_ROLE_ID },
  ];

  const isSiswaSelected = selectedRole?.value === STUDENT_ROLE_ID;
  const isMitraSelected = selectedRole?.value === MITRA_ROLE_ID;

  const userSchema = z
    .object({
      name: z.string().optional(),
      email: z.string().email(),
      no_hp: z.string().min(10),
      nik: z.string().optional().or(z.literal("")),
      password: z.string().min(8),
      password_confirmation: z.string(),
      role_id: z.string().min(1),
    })
    .refine((d) => d.password === d.password_confirmation, {
      path: ["password_confirmation"],
      message: "Password tidak sama"
    })
    .refine(
      (d) => {
        if (d.role_id !== STUDENT_ROLE_ID.toString() && d.role_id !== MITRA_ROLE_ID.toString()) {
          return d.nik && d.nik.length === 16;
        }
        return true;
      },
      { path: ["nik"], message: "NIK harus 16 digit" }
    )
    .refine(
        (d) => {
            if (d.role_id !== MITRA_ROLE_ID.toString()) {
                return d.name && d.name.length >= 3;
            }
            return true;
        },
        { path: ["name"], message: "Nama harus diisi minimal 3 karakter" }
    );

  type FormFields = z.infer<typeof userSchema>;
  const queryClient = useQueryClient();
  const router = useRouter();

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setLogoSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = async () => {
    if (!logoSrc || !croppedAreaPixels) return;
    try {
       const croppedImage = await getCroppedImg(logoSrc, croppedAreaPixels);
       if(croppedImage) {
           setFinalLogo(croppedImage.blob);
           setFinalLogoPreview(croppedImage.url);
           setIsCropping(false);
       }
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar");
    }
  };

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.role_id === MITRA_ROLE_ID.toString()) {
          const formData = new FormData();
          formData.append('brand_name', payload.instansi_name);
          formData.append('pic_name', payload.pic_name);
          formData.append('email', payload.email);
          formData.append('password', payload.password);
          formData.append('password_confirmation', payload.password_confirmation);
          formData.append('no_hp', payload.no_hp);
          
          if (payload.logo) {
              formData.append('logo', payload.logo);
          }

          if (payload.logo) {
              formData.append('logo', payload.logo);
          }

          const res = await API.post("/register-mitra", formData);
          return res.data;
      }

      let endpoint = "/register";
      if (payload.role_id === STUDENT_ROLE_ID.toString()) endpoint = "/register-student";

      const res = await API.post(endpoint, payload);
      return res.data;
    },
    onSuccess: async (data: any, variables) => {
      toast.success("Registrasi berhasil! Silakan login kembali.");
      router.push("/getting-started");
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
    } else if (isMitraSelected) {
        if (!instansi || instansi.length < 3) {
            toast.error("Nama Instansi harus diisi");
            return;
        }
        if (!pic || pic.length < 3) {
            toast.error("Nama PIC harus diisi");
            return;
        }
        createAccount({
            name: instansi,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            no_hp: data.no_hp,
            role_id: MITRA_ROLE_ID.toString(),
            instansi_name: instansi,
            pic_name: pic,
            logo: finalLogo
        });
    } else {
      createAccount(data);
    }
  };

  /* ===== SHARED FORM FIELDS (used in both mobile and desktop) ===== */
  const formFields = (
    <div className="space-y-4">
      {/* Daftar Sebagai */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Daftar Sebagai <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-left bg-white flex items-center justify-between transition ${
              errors.role_id
                ? "border-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-[#009788]"
            }`}
          >
            <span className={selectedRole ? "text-gray-700" : "text-gray-400"}>
              {selectedRole ? selectedRole.name : "Pilih Role"}
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(option);
                    setValue("role_id", option.value.toString(), { shouldValidate: true, shouldDirty: true });
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-teal-50 transition flex items-center gap-3 ${
                    selectedRole?.value === option.value
                      ? "bg-teal-50 text-[#009788] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option.value === STUDENT_ROLE_ID && <AcademicCapIcon className="w-5 h-5" />}
                  {option.value === MITRA_ROLE_ID && <BuildingOfficeIcon className="w-5 h-5" />}
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.role_id && <p className="text-red-500 text-sm mt-1">{errors.role_id.message}</p>}
      </div>

      {/* Mitra-specific fields */}
      {isMitraSelected && (
        <>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Nama Instansi / Brand <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="PT. Teknologi Edukasi" value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#009788] placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Nama PIC <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Budi Santoso" value={pic}
              onChange={(e) => setPic(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#009788] placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Logo Mitra <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
              {finalLogoPreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <img src={finalLogoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setFinalLogo(null); setFinalLogoPreview(null); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-gray-500 text-sm">Klik untuk upload logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Student-specific fields */}
      {isSiswaSelected && (
        <>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Nama Sekolah <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Contoh: SMA Negeri 1 Jakarta" value={schoolPlace}
              onChange={(e) => setSchoolPlace(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
                schoolPlace.trim().length >= 3 ? "border-[#009788]" : "border-slate-200 focus:border-[#009788]"
              }`}
            />
            <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter</p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              NISN <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="0012345678" value={nisn}
              onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
                nisn.length === 10 ? "border-[#009788]" : "border-slate-200 focus:border-[#009788]"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-500 text-xs">NISN 10 digit angka</p>
              {nisn.length > 0 && (
                <p className={`text-xs ${nisn.length === 10 ? "text-[#009788]" : "text-orange-500"}`}>
                  {nisn.length}/10
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Nama Lengkap */}
      {!isMitraSelected && (
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input type="text" placeholder="Ardianita" {...register("name")}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
              errors.name ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
      )}

      {/* Nomor HP */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Nomor HP <span className="text-red-500">*</span>
        </label>
        <input type="tel" placeholder="Minimal 10 karakter" {...register("no_hp")}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
            errors.no_hp ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
          }`}
        />
        {errors.no_hp && <p className="text-red-500 text-sm mt-1">{errors.no_hp.message}</p>}
      </div>

      {/* NIK - non-student & non-mitra only */}
      {!isSiswaSelected && !isMitraSelected && (
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            Nomor NIK <span className="text-red-500">*</span>
          </label>
          <input type="text" placeholder="16 digit" {...register("nik")} maxLength={16}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
              errors.nik ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
            }`}
          />
          {errors.nik && <p className="text-red-500 text-sm mt-1">{errors.nik.message}</p>}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Alamat Email <span className="text-red-500">*</span>
        </label>
        <input type="email" placeholder="contoh@email.com" {...register("email")}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
            errors.email ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Kata Sandi <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter"
            {...register("password")}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
              errors.password ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
            }`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2">
            {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Konfirmasi Kata Sandi <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Minimal 8 karakter"
            {...register("password_confirmation")}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none placeholder-gray-400 ${
              errors.password_confirmation ? "border-red-500" : "border-slate-200 focus:border-[#009788]"
            }`}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2">
            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Branding Panel - Desktop only */}
      <AuthBrandingPanel />

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative">
        {/* Top accent line - desktop */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-6 md:px-12 lg:px-16 xl:px-20 md:py-8">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-700 md:text-xl md:font-semibold">Daftar Akun</h1>
        </div>

        {/* Form - scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 md:px-12 lg:px-16 xl:px-20 pb-10"
          >
            <div className="hidden md:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Registrasi
            </div>
            <h2 className="hidden md:block text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500 mb-6 text-sm md:text-[15px]">
              Lengkapi data berikut untuk membuat akun baru di AGPAII Digital.
            </p>

            <div className="md:max-w-md">
              {formFields}

              {/* Submit Button */}
              <div className="mt-8 pb-8">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 bg-[#009788] hover:bg-[#00867a] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mendaftar...
                    </span>
                  ) : (
                    "Bergabung Sekarang"
                  )}
                </button>

                <p className="text-slate-500 text-sm text-center mt-4">
                  Sudah punya akun?{" "}
                  <Link className="text-[#009788] font-semibold hover:underline" href="/auth/login">
                    Masuk sekarang →
                  </Link>
                </p>
              </div>
            </div>
          </form>
          </motion.div>
        </div>
      </div>

      {/* CROPPER MODAL */}
      {isCropping && logoSrc && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md h-96 bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={logoSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={() => setIsCropping(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-full font-medium">
              Batal
            </button>
            <button onClick={showCroppedImage}
              className="px-6 py-2 bg-[#00DB81] text-white rounded-full font-medium">
              Potong & Simpan
            </button>
          </div>
          <div className="mt-4 w-full max-w-md px-4">
            <input
              type="range" value={zoom} min={1} max={3} step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
