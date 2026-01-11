"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { toast } from "sonner";

export default function TambahKelasPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    school_place: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.school_place) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Sesi login habis, silakan login ulang");
        router.push("/getting-started");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Gagal membuat kelas");
        return;
      }

      toast.success("Kelas berhasil dibuat");
      router.push("/kelas-guru");
    } catch (error) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/kelas-guru" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Tambah Kelas Baru</h1>
            <p className="text-xs text-teal-100">Buat kelas untuk siswa Anda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Nama Sekolah */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Sekolah
          </label>
          <div className="relative">
            <BuildingOffice2Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={formData.school_place}
              onChange={(e) =>
                setFormData({ ...formData, school_place: e.target.value })
              }
              placeholder="Contoh: SMP Negeri 1 Jakarta"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Nama Kelas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Kelas
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: PAI Kelas 9A"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mata Pelajaran
          </label>
          <div className="relative">
            <BookOpenIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Contoh: Pendidikan Agama Islam"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Tips:</strong> Setelah kelas dibuat, Anda bisa menambahkan
            siswa menggunakan NISN atau pencarian nama.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin size-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Membuat Kelas...
            </>
          ) : (
            <>
              <CheckCircleIcon className="size-5" />
              Buat Kelas
            </>
          )}
        </button>
      </form>
    </div>
  );
}
