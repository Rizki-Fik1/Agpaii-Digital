"use client";
import { useAuth } from "@/utils/context/auth_context";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { MOCK_CLASSES, getStudentsInClass, MOCK_MATERIALS, MOCK_EXERCISES } from "@/constants/student-data";
import clsx from "clsx";

export default function KelasGuruListPage() {
  const { auth } = useAuth();
  const router = useRouter();
  
  // Untuk guru, hanya tampilkan 1 kelas yang diampu (demo: kelas pertama)
  const teacherClass = MOCK_CLASSES[0];
  const studentCount = getStudentsInClass(teacherClass.id).length;

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeftIcon className="size-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Kelas Saya</h1>
            <p className="text-xs text-teal-100">Kelola kelas dan presensi siswa</p>
          </div>
          {/* Add Class Button */}
          <Link 
            href="/kelas-guru/tambah" 
            className="bg-white hover:bg-white/90 text-teal-600 rounded-lg px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition shadow-sm"
          >
            <PlusIcon className="size-4" />
            <span>Tambah</span>
          </Link>
        </div>
        
        {/* Summary Card */}
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <AcademicCapIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Kelas yang Diampu</p>
              <p className="text-white font-semibold text-lg">{teacherClass.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Class Card */}
      <div className="p-4">
        <Link href={`/kelas-guru/${teacherClass.id}`} className="block">
          <div className={clsx(
            "bg-gradient-to-r rounded-xl p-5 shadow-lg hover:shadow-xl transition",
            teacherClass.color
          )}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full mb-2">
                  {teacherClass.subject}
                </span>
                <h3 className="text-white font-bold text-xl">{teacherClass.name}</h3>
                <p className="text-white/80 text-sm mt-1">
                  {teacherClass.school}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <UserGroupIcon className="size-5" />
                    <span>{studentCount} Siswa</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <BookOpenIcon className="size-5" />
                    <span>{MOCK_MATERIALS.length} Materi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <ClipboardDocumentListIcon className="size-5" />
                    <span>{MOCK_EXERCISES.length} Latihan</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <ChevronRightIcon className="size-6 text-white" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Info Text */}
        <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            Klik pada kelas untuk mengelola siswa, presensi, materi, dan latihan soal
          </p>
        </div>
      </div>
    </div>
  );
}
