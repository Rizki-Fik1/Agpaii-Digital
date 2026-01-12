"use client";
import { useAuth } from "@/utils/context/auth_context";
import { useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  MOCK_CLASSES,
  getAttendanceDates,
  getAttendanceByClassAndDate,
  MOCK_STUDENTS_BY_CLASS,
} from "@/constants/student-data";
import clsx from "clsx";

export default function KelasListPage() {
  const { auth } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  const gradients = [
    "from-teal-600 to-teal-500",
    "from-blue-600 to-indigo-500",
    "from-emerald-600 to-green-500",
  ];

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/my/attendance-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch attendance");

        const json = await res.json();

        // ubah jadi map: { class_id: summary }
        const map: Record<number, any> = {};
        json.data.forEach((item: any) => {
          map[item.class_id] = item;
        });

        setAttendanceMap(map);
      } catch (err) {
        console.error("Fetch attendance gagal", err);
        setAttendanceMap({});
      }
    };

    fetchAttendanceSummary();
  }, []);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch kelas");

        const json = await res.json();
        setClasses(json.data || []);
      } catch (err) {
        console.error("Fetch kelas gagal", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/other" className="p-1">
            <ChevronLeftIcon className="size-6 text-white" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Kelas Saya</h1>
            <p className="text-xs text-teal-100">Pilih kelas untuk memulai</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <AcademicCapIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Total Kelas Terdaftar</p>
              <p className="text-white font-semibold text-lg">
                {classes.length} Kelas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-medium text-slate-500 mb-2">
          Daftar Kelas
        </h2>
        {loading && (
          <p className="text-center text-slate-400 text-sm">Memuat kelas...</p>
        )}
        {!loading && classes.length === 0 && (
          <p className="text-center text-slate-400 text-sm">
            Kamu belum terdaftar di kelas mana pun
          </p>
        )}
        {classes.map((kelas) => {
          const attendance = attendanceMap[kelas.id];
          const gradient = gradients[kelas.id % gradients.length];

          return (
            <Link href={`/kelas/${kelas.id}`} key={kelas.id} className="block">
              <div
                className={clsx(
                  "bg-gradient-to-r rounded-xl p-4 shadow-md hover:shadow-lg transition",
                  gradient
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full mb-2">
                      {kelas.subject}
                    </span>
                    <h3 className="text-white font-bold text-lg">
                      {kelas.name}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {kelas.teacher?.name}
                    </p>

                    <div className="flex items-center gap-1 text-white/70 text-xs mt-2">
                      <UserGroupIcon className="size-4" />
                      <span>{kelas.total_students} siswa</span>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full p-2">
                    <ChevronRightIcon className="size-5 text-white" />
                  </div>
                </div>

                {/* Attendance Status Bar */}
                {attendance && attendance.total > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-white/90 text-xs">
                        <CheckCircleIcon className="size-4" />
                        <span>
                          Kehadiran: {attendance.hadir}/{attendance.total} hari
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          attendance.percentage >= 80
                            ? "bg-green-500/30 text-green-100"
                            : attendance.percentage >= 60
                            ? "bg-yellow-500/30 text-yellow-100"
                            : "bg-red-500/30 text-red-100"
                        )}
                      >
                        {attendance.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className={clsx(
                          "h-2 rounded-full transition-all",
                          attendance.percentage >= 80
                            ? "bg-green-400"
                            : attendance.percentage >= 60
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        )}
                        style={{ width: `${attendance.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
