"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type ClassItem = {
  id: number;
  name: string;
  subject: string;
  school_place: string;
  total_students: number;
  students_count: number;
  is_active: boolean;
};

export default function KelasGuruListPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Sesi login habis");
          router.push("/getting-started");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiUrl) {
          toast.error("API URL belum diset");
          return;
        }

        const res = await fetch(`${apiUrl}/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          toast.error(json?.message || "Gagal memuat kelas");
          return;
        }

        setClasses(json.data);
      } catch {
        toast.error("Kesalahan server");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [router]);

  // ================= STATE =================

  if (classes.length === 0) {
    return (
      <div className="w-full max-w-[480px] md:max-w-none mx-auto min-h-screen bg-white">
        <div className="p-6 text-center text-slate-500">
          <p className="mb-4">Belum ada kelas</p>
          <Link
            href="/kelas-guru/tambah"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg"
          >
            <PlusIcon className="size-5" />
            Tambah Kelas
          </Link>
        </div>
      </div>
    );
  }

  // ================= VIEW =================
  return (
    <div className="w-full bg-white md:bg-[#FAFBFC] min-h-screen pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 md:rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between mb-4 md:max-w-6xl md:mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeftIcon className="size-6 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Kelas Saya</h1>
              <p className="text-xs text-teal-100">
                Kelola kelas dan presensi siswa
              </p>
            </div>
          </div>
          {/* Add Class Button */}
          <Link
            href="/kelas-guru/tambah"
            className="bg-white hover:bg-white/90 text-teal-600 rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium transition"
          >
            <PlusIcon className="size-5" />
            <span className="hidden sm:inline">Tambah</span>
          </Link>
        </div>

        <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3 md:max-w-6xl md:mx-auto">
          <AcademicCapIcon className="size-6 text-white" />
          <div>
            <p className="text-white/80 text-xs">Total Kelas</p>
            <p className="text-white font-semibold text-lg">
              {classes.length} Kelas
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0 md:max-w-6xl md:mx-auto md:mt-8">
        {classes.map((kelas) => (
          <Link key={kelas.id} href={`/kelas-guru/${kelas.id}`} className="block">
            <div
              className={clsx(
                "bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 shadow hover:shadow-xl transition h-full flex flex-col relative overflow-hidden group/item"
              )}
            >
              {/* Decorative icon */}
              <div className="absolute -bottom-6 -right-4 opacity-10 group-hover/item:opacity-20 transition-opacity">
                <AcademicCapIcon className="size-32 text-white" />
              </div>
              
              <div className="relative z-10 flex-1">
                <span className="text-white text-xs bg-white/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border border-white/10 backdrop-blur-sm">
                  {kelas.subject}
                </span>

                <h3 className="text-white font-bold text-lg md:text-xl mt-3 leading-tight">
                  {kelas.name}
                </h3>

                <p className="text-white/80 text-sm mt-1">{kelas.school_place}</p>
              </div>

              <div className="flex items-center mt-6 text-white/90 text-sm relative z-10 bg-black/10 w-fit px-3 py-1.5 rounded-md border border-white/5">
                <div className="flex items-center gap-1.5">
                  <UserGroupIcon className="size-4" />
                  <span className="font-semibold">{kelas.students_count} <span className="font-normal text-white/70">Siswa</span></span>
                </div>
              </div>
              
              <div className="absolute right-5 bottom-5 bg-white/20 text-white rounded-full p-2 transition-colors">
                 <ChevronRightIcon className="size-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
