"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { toast } from "sonner";
import { MOCK_CLASSES } from "@/constants/student-data";

// Demo: Sekolah guru diambil dari kelas pertama yang diampu
const TEACHER_SCHOOL = MOCK_CLASSES[0].school;

export default function TambahKelasPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    school: TEACHER_SCHOOL, // Auto-filled dari sekolah guru
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject) {
      toast.error("Lengkapi semua field");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Save to localStorage for demo
    const existingClasses = JSON.parse(localStorage.getItem("teacher_classes") || "[]");
    const newClass = {
      id: Date.now(),
      name: formData.name,
      subject: formData.subject,
      school: formData.school,
      totalStudents: 0,
      students: [],
      color: "from-teal-600 to-teal-500",
      createdAt: new Date().toISOString(),
    };
    existingClasses.push(newClass);
    localStorage.setItem("teacher_classes", JSON.stringify(existingClasses));
    
    setIsSubmitting(false);
    toast.success("Kelas berhasil dibuat!");
    router.push("/kelas-guru");
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
        {/* Sekolah - Auto-filled & Read-only */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Sekolah
          </label>
          <div className="relative">
            <BuildingOffice2Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={formData.school}
              readOnly
              className="w-full pl-12 pr-10 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <LockClosedIcon className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1">Sekolah otomatis sesuai profil Anda</p>
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Contoh: Pendidikan Agama Islam"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Tips:</strong> Setelah membuat kelas, Anda dapat menambahkan siswa dari sekolah Anda dengan mencari nama atau NISN mereka.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
