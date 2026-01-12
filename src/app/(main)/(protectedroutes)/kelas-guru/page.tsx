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
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Memuat kelas...
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-white">
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
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeftIcon className="size-6 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Kelas Saya</h1>
              <p className="text-xs text-teal-100">Kelola kelas dan presensi siswa</p>
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

        <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
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
      <div className="p-4 space-y-4">
        {classes.map((kelas) => (
          <Link key={kelas.id} href={`/kelas-guru/${kelas.id}`}>
            <div
              className={clsx(
                "bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 shadow hover:shadow-lg transition"
              )}
            >
              <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {kelas.subject}
              </span>

              <h3 className="text-white font-bold text-lg mt-2">
                {kelas.name}
              </h3>

              <p className="text-white/80 text-sm">{kelas.school_place}</p>

              <div className="flex items-center gap-4 mt-4 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="size-5" />
                  {kelas.total_students} Siswa
                </div>

                <ChevronRightIcon className="size-5 ml-auto" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
