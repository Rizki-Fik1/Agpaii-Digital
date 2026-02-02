"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import API from "@/utils/api/config";

export default function EditProfileSiswaPage() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    no_hp: "",
    school_place: "",
    nisn: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/me");
      const user = res.data;

      setForm({
        name: user.name ?? "",
        no_hp: user.profile?.contact ?? "",
        school_place: user.profile?.school_place ?? "",
        nisn: user.profile?.nisn ?? "",
        password: "",
        password_confirmation: "",
      });

      if (user.avatar) {
        setPhotoPreview(
          user.avatar.startsWith("http")
            ? user.avatar
            : `${process.env.NEXT_PUBLIC_API_BASE_URL_STORAGE}/${user.avatar}`
        );
      }
    } catch {
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.length < 3) {
      toast.error("Nama minimal 3 karakter");
      return;
    }

    if (form.password && form.password !== form.password_confirmation) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("contact", form.no_hp);
      formData.append("school_place", form.school_place);

      if (form.password) {
        formData.append("password", form.password);
        formData.append("password_confirmation", form.password_confirmation);
      }

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await API.post("/profile/siswa", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profil berhasil diperbarui");
      router.back();
    } catch {
      toast.error("Gagal menyimpan perubahan");
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b">
        <button onClick={() => router.back()}>
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-medium text-gray-700">Edit Profil</h1>
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-4">
        {/* Foto Profil */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Foto
              </div>
            )}
          </div>

          <label className="text-sm font-medium text-[#00AF70] cursor-pointer">
            Ganti Foto Profil
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                  toast.error("Ukuran foto maksimal 2MB");
                  return;
                }

                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <p className="text-xs text-gray-400">JPG / PNG, maksimal 2MB</p>
        </div>
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value="Email tidak dapat diubah"
            disabled
            className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500"
          />
        </div>

        {/* Nomor HP */}
        <div>
          <label className="block text-sm font-medium mb-1">Nomor HP</label>
          <input
            value={form.no_hp}
            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        {/* Sekolah */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama Sekolah</label>
          <input
            value={form.school_place}
            onChange={(e) => setForm({ ...form, school_place: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        {/* NISN (readonly atau opsional) */}
        <div>
          <label className="block text-sm font-medium mb-1">NISN</label>
          <input
            value={form.nisn}
            disabled
            className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Hubungi admin jika NISN perlu diubah
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Password Baru (opsional)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg"
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
        </div>

        {/* Konfirmasi Password */}
        {form.password && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-4 bg-[#00DB81] text-white rounded-full font-medium"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
