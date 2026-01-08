"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { MOCK_CLASSES, getStudentsInClass } from "@/constants/student-data";
import clsx from "clsx";

export default function KelasGuruListPage() {
  const { auth } = useAuth();

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Kelas Saya</h1>
            <p className="text-xs text-teal-100">Kelola kelas dan presensi siswa</p>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <AcademicCapIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Total Kelas Diampu</p>
              <p className="text-white font-semibold text-lg">{MOCK_CLASSES.length} Kelas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-medium text-slate-500 mb-2">Daftar Kelas</h2>
        
        {MOCK_CLASSES.map((kelas) => {
          const studentCount = getStudentsInClass(kelas.id).length;
          
          return (
            <Link href={`/kelas-guru/${kelas.id}`} key={kelas.id} className="block">
              <div className={clsx(
                "bg-gradient-to-r rounded-xl p-4 shadow-md hover:shadow-lg transition",
                kelas.color
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full mb-2">
                      {kelas.subject}
                    </span>
                    <h3 className="text-white font-bold text-lg">{kelas.name}</h3>
                    <p className="text-white/80 text-sm mt-1">
                      {kelas.school}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-white/70 text-xs">
                        <UserGroupIcon className="size-4" />
                        <span>{studentCount} siswa</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/70 text-xs">
                        <ClipboardDocumentCheckIcon className="size-4" />
                        <span>Presensi</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full p-2">
                    <ChevronRightIcon className="size-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
