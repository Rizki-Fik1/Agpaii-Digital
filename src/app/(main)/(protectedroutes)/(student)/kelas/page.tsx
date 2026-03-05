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
  getAttendanceDates,
  getAttendanceByClassAndDate,
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
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden w-full bg-white min-h-screen pb-24">
        {/* MOBILE HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 shadow-md rounded-b-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/other" className="p-1 hover:bg-white/10 rounded-full transition">
              <ChevronLeftIcon className="size-6 text-white" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Kelas Saya</h1>
              <p className="text-xs text-teal-100">Pilih kelas untuk memulai</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white/20 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2.5">
                <AcademicCapIcon className="size-6 text-white" />
              </div>
              <div>
                <p className="text-teal-50 text-xs font-medium">Total Kelas Terdaftar</p>
                <p className="text-white font-bold text-lg">
                  {classes.length} Kelas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 relative z-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700">
              Daftar Kelas Aktif
            </h2>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
                <p className="text-center text-slate-400 text-sm font-medium">Memuat data kelas...</p>
            </div>
          )}
          
          {!loading && classes.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100/50">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-3xl mb-4">
                <AcademicCapIcon className="size-8 text-slate-300" />
              </div>
              <p className="text-center text-slate-500 font-bold">Kamu belum terdaftar di kelas mana pun.</p>
              <p className="text-center text-slate-400 text-sm mt-1">Silakan ikuti kelas terlebih dahulu untuk mulai belajar.</p>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            {classes.map((kelas) => {
              const attendance = attendanceMap[kelas.id];
              const gradient = gradients[kelas.id % gradients.length];

              return (
                <Link href={`/kelas/${kelas.id}`} key={kelas.id} className="block group">
                  <div className={clsx("rounded-xl p-5 shadow-md relative overflow-hidden flex flex-col", gradient)}>
                    <div className="absolute -bottom-6 -right-4 opacity-10">
                      <AcademicCapIcon className="size-32 text-white" />
                    </div>

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1 pr-4">
                        <span className="inline-block px-2.5 py-1 bg-white/20 text-white text-[10px] font-bold rounded-md mb-3 tracking-wide backdrop-blur-sm border border-white/10 uppercase">
                          {kelas.subject}
                        </span>
                        <h3 className="text-white font-bold text-lg leading-tight mb-2">
                          {kelas.name}
                        </h3>
                        <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                          {kelas.teacher?.name}
                        </p>

                        <div className="flex items-center gap-1.5 text-white/70 text-xs mt-3 bg-black/10 w-fit px-2.5 py-1 rounded-md border border-white/5">
                          <UserGroupIcon className="size-4" />
                          <span className="font-semibold">{kelas.total_students} <span className="font-normal">siswa tergabung</span></span>
                        </div>
                      </div>
                      <div className="bg-white/20 text-white rounded-full p-2.5 shadow-sm">
                        <ChevronRightIcon className="size-5" />
                      </div>
                    </div>

                    <div className="flex-1 min-h-[1rem]"></div>

                    {attendance && attendance.total > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20 relative z-10 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-white/95 text-xs font-medium">
                            <CheckCircleIcon className="size-4 text-teal-100" />
                            <span>
                              Hadir: {attendance.hadir}/{attendance.total} hari
                            </span>
                          </div>
                          <span
                            className={clsx(
                              "text-xs font-bold px-2 py-0.5 rounded-md",
                              attendance.percentage >= 80
                                ? "bg-emerald-500/30 text-emerald-100 border border-emerald-400/30"
                                : attendance.percentage >= 60
                                ? "bg-yellow-500/30 text-yellow-100 border border-yellow-400/30"
                                : "bg-red-500/30 text-red-100 border border-red-400/30"
                            )}
                          >
                            {attendance.percentage}%
                          </span>
                        </div>

                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden border border-white/10">
                          <div
                            className={clsx(
                              "h-full rounded-full",
                              attendance.percentage >= 80
                                ? "bg-emerald-400"
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
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block w-full min-h-screen bg-transparent pt-6 md:pt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kelas Saya</h1>
              <p className="text-slate-500 text-sm mt-1">Daftar kelas yang sedang Anda ikuti</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 flex items-center gap-3 px-4 py-2 rounded-xl">
              <AcademicCapIcon className="size-6 text-teal-600" />
              <div>
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Total Kelas</p>
                <p className="text-lg font-black text-teal-800 leading-none">{classes.length}</p>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Memuat data kelas...</p>
            </div>
          )}
          
          {!loading && classes.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
               <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl mb-5 shadow-inner">
                 <AcademicCapIcon className="size-10 text-slate-400" />
               </div>
               <p className="text-slate-800 font-bold text-xl mb-2">Belum Terdaftar di Kelas Manapun</p>
               <p className="text-slate-500">Silakan ikuti kelas terlebih dahulu dengan menghubungi guru PAI Anda.</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((kelas) => {
              const attendance = attendanceMap[kelas.id];
              const gradient = gradients[kelas.id % gradients.length];

              return (
                <Link href={`/kelas/${kelas.id}`} key={kelas.id} className="block group h-full">
                  <div
                    className={clsx(
                      "rounded-2xl p-6 shadow-sm border border-transparent hover:border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col",
                      gradient
                    )}
                  >
                    <div className="absolute -bottom-6 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                       <AcademicCapIcon className="size-32 text-white" />
                    </div>

                    <div className="flex items-start justify-between relative z-10 mb-6">
                      <div className="flex-1 pr-2">
                        <span className="inline-block px-2.5 py-1 bg-white/20 text-white text-xs font-bold rounded-lg mb-4 tracking-wide backdrop-blur-sm border border-white/10 uppercase shadow-sm">
                          {kelas.subject}
                        </span>
                        <h3 className="text-white font-bold text-xl leading-tight mb-2 group-hover:underline decoration-white/30 underline-offset-4">
                          {kelas.name}
                        </h3>
                        <p className="text-white/90 text-sm font-medium flex items-center gap-1.5 bg-black/10 w-fit px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_5px_rgba(94,234,212,0.8)]"></span>
                          {kelas.teacher?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-h-[0.5rem]"></div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm bg-black/10 w-fit px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <UserGroupIcon className="size-4" />
                        <span className="font-semibold">{kelas.total_students} <span className="font-normal opacity-80">siswa</span></span>
                      </div>

                      {attendance && attendance.total > 0 && (
                        <div className="pt-4 border-t border-white/20 w-full">
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5 text-white/95 text-sm font-medium">
                              <CheckCircleIcon className="size-4 text-teal-100" />
                              <span>
                                Hadir: {attendance.hadir}/{attendance.total}
                              </span>
                            </div>
                            <span
                              className={clsx(
                                "text-sm font-bold px-2.5 py-1 rounded-md shadow-sm",
                                attendance.percentage >= 80
                                  ? "bg-emerald-500 text-white border border-emerald-400"
                                  : attendance.percentage >= 60
                                  ? "bg-yellow-500 text-white border border-yellow-400"
                                  : "bg-red-500 text-white border border-red-400"
                              )}
                            >
                              {attendance.percentage}%
                            </span>
                          </div>

                          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden border border-white/10 shadow-inner">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all duration-1000 relative overflow-hidden",
                                attendance.percentage >= 80
                                  ? "bg-emerald-400"
                                  : attendance.percentage >= 60
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              )}
                              style={{ width: `${attendance.percentage}%` }}
                            >
                              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
