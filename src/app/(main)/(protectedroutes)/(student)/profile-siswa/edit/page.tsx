"use client";

import { useAuth } from "@/utils/context/auth_context";
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getImage } from "@/utils/function/function";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import API from "@/utils/api/config";

export default function EditStudentProfilePage() {
  const { auth, authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nisn, setNisn] = useState("");
  const [schoolPlace, setSchoolPlace] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (auth) {
      setName(auth.name || "");
      setEmail(auth.email || "");

      setPhone(auth.profile?.contact || "");
      setNisn(auth.nisn || auth.profile?.nisn || "");
      setSchoolPlace(auth.school_place || auth.profile?.school_place || "");

      if (auth.avatar) {
        setAvatarPreview(getImage(auth.avatar));
      }
    }
  }, [auth]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    if (!email.trim()) {
      toast.error("Email tidak boleh kosong");
      return;
    }

    if (!phone.trim()) {
      toast.error("Nomor telepon tidak boleh kosong");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("contact", phone.trim());

      if (nisn.trim()) {
        formData.append("nisn", nisn.trim());
      }

      if (schoolPlace.trim()) {
        formData.append("school_place", schoolPlace.trim());
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await API.post("/profile/siswa", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        toast.success("Profil berhasil diperbarui");

        // Update auth context
        const meRes = await API.get("/me");
        queryClient.setQueryData(["auth"], meRes.data);

        router.push("/profile-siswa");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Memuat...</p>
      </div>
    );
  }

  return (
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeftIcon className="size-6 text-white" />
          </button>
          <h1 className="font-semibold text-lg ml-3 flex-grow">Edit Profil</h1>
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

          {/* Avatar with Edit Button */}
          <div className="px-4 -mt-16 relative z-10">
            <div className="relative inline-block">
              <div className="border-4 border-white rounded-full overflow-hidden bg-white">
                <img
                  src={avatarPreview || "/img/profileplacholder.png"}
                  alt="avatar"
                  className="size-28 object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload-mobile"
                className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-lg"
              >
                <CameraIcon className="size-5 text-white" />
                <input
                  id="avatar-upload-mobile"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 pt-6 space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* NISN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="size-4 text-green-600" />
                NISN
              </div>
            </label>
            <input
              type="text"
              value={nisn}
              onChange={(e) =>
                setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Nomor Induk Siswa Nasional"
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
            />
            <p className="text-xs text-slate-500 mt-1">10 digit angka</p>
          </div>

          {/* Sekolah */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <BuildingLibraryIcon className="size-4 text-purple-600" />
                Nama Sekolah
              </div>
            </label>
            <input
              type="text"
              value={schoolPlace}
              onChange={(e) => setSchoolPlace(e.target.value)}
              placeholder="Contoh: SMA Negeri 1 Jakarta"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="size-4 text-teal-600" />
                Email <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Telepon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-4 text-blue-600" />
                Nomor Telepon <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pt-6 pb-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
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
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>

          <button
            onClick={() => router.back()}
            disabled={saving}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block w-full min-h-screen bg-slate-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl shadow-sm transition-all text-slate-600 group"
            >
              <ArrowLeftIcon className="size-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Profil Siswa</h1>
              <p className="text-sm text-slate-500 mt-1">Perbarui informasi data diri Anda di bawah ini dengan benar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             {/* Left sidebar for Photo */}
             <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
                   <div className="relative group mb-6">
                      <div className="w-40 h-40 rounded-full border-4 border-slate-50 shadow-md overflow-hidden bg-slate-100">
                         <img
                           src={avatarPreview || "/img/profileplacholder.png"}
                           alt="avatar"
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         />
                      </div>
                      <label
                        htmlFor="avatar-upload-desktop"
                        className="absolute bottom-2 right-2 p-3 bg-teal-600 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg border-2 border-white"
                      >
                        <CameraIcon className="size-5 text-white" />
                        <input
                           id="avatar-upload-desktop"
                           type="file"
                           accept="image/*"
                           onChange={handleAvatarChange}
                           className="hidden"
                        />
                      </label>
                   </div>
                   <h3 className="font-bold text-slate-800 text-lg mb-1 text-center">{name || "Nama Pengguna"}</h3>
                   <span className="text-xs font-semibold bg-teal-50 text-teal-600 px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-teal-100">Siswa</span>
                   <p className="text-xs text-slate-500 text-center leading-relaxed">
                      Unggah pas foto terbaikmu dengan ukuran file maksimum 2MB. Format (.jpg, .png).
                   </p>
                </div>
             </div>

             {/* Right content for Form */}
             <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="border-b border-slate-100 p-6 bg-slate-50/50">
                      <h2 className="text-lg font-bold text-slate-800">Informasi Dasar</h2>
                      <p className="text-sm text-slate-500 mt-1">Lengkapi data agar profilmu tampil lebih profesional.</p>
                   </div>
                   <div className="p-6 space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Nama Lengkap */}
                         <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             Nama Lengkap <span className="text-red-500">*</span>
                           </label>
                           <input
                             type="text"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder="Masukkan nama lengkap sesuai identitas"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                           />
                         </div>

                         {/* NISN */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             <div className="flex items-center gap-2">
                               <AcademicCapIcon className="size-4 text-emerald-600" />
                               NISN
                             </div>
                           </label>
                           <input
                             type="text"
                             value={nisn}
                             onChange={(e) =>
                               setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))
                             }
                             placeholder="Misal: 0012345678"
                             maxLength={10}
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                           />
                           <p className="text-[11px] font-medium text-slate-400 mt-1.5 ml-1">Harus terdiri dari 10 digit angka</p>
                         </div>

                         {/* Sekolah */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             <div className="flex items-center gap-2">
                               <BuildingLibraryIcon className="size-4 text-purple-600" />
                               Nama Sekolah Asal
                             </div>
                           </label>
                           <input
                             type="text"
                             value={schoolPlace}
                             onChange={(e) => setSchoolPlace(e.target.value)}
                             placeholder="Contoh: SMA Negeri 1 Jakarta"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                           />
                         </div>

                         {/* Email */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             <div className="flex items-center gap-2">
                               <EnvelopeIcon className="size-4 text-amber-500" />
                               Alamat Email <span className="text-red-500">*</span>
                             </div>
                           </label>
                           <input
                             type="email"
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder="email@sekolah.com"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                           />
                         </div>

                         {/* Telepon */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             <div className="flex items-center gap-2">
                               <PhoneIcon className="size-4 text-blue-500" />
                               Nomor Telepon/WA <span className="text-red-500">*</span>
                             </div>
                           </label>
                           <input
                             type="tel"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             placeholder="Contoh: 081234567890"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                           />
                         </div>
                      </div>

                   </div>

                   {/* Footer Actions Desktop */}
                   <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
                      <button
                        onClick={() => router.back()}
                        disabled={saving}
                        className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg hover:shadow-teal-600/20 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
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
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Perubahan"
                        )}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
