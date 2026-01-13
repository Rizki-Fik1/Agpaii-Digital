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
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20">
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
                src={avatarPreview || "https://avatar.iran.liara.run/public"}
                alt="avatar"
                className="size-28 object-cover"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-lg"
            >
              <CameraIcon className="size-5 text-white" />
              <input
                id="avatar-upload"
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
  );
}
