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
    <div className="w-full bg-white md:bg-[#FAFBFC] min-h-screen pb-24 md:pb-12">
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 shadow-md rounded-b-2xl">
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

      {/* DESKTOP HERO BANNER */}
      <div className="hidden md:block relative bg-gradient-to-r from-teal-700 to-emerald-600 pt-16 pb-24 px-8 xl:px-12 shadow-md overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\\"60\\\" height=\\\"60\\\" viewBox=\\\"0 0 60 60\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"%3E%3Cg fill=\\\"none\\\" fill-rule=\\\"evenodd\\\"%3E%3Cg fill=\\\"%23ffffff\\\" fill-opacity=\\\"1\\\"%3E%3Cpath d=\\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
        ></div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
               <Link href="/other" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20 backdrop-blur-sm">
                  <ChevronLeftIcon className="size-5 text-white" />
               </Link>
               <h1 className="text-3xl font-bold tracking-tight">Kelas Saya</h1>
            </div>
            <p className="text-teal-100 opacity-90 max-w-xl text-sm leading-relaxed pl-12">
              Pantau progres belajar dan tingkat kehadiranmu di setiap kelas yang kamu ikuti.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center gap-4 shadow-xl">
            <div className="bg-white/20 rounded-xl p-3">
              <AcademicCapIcon className="size-8 text-white" />
            </div>
            <div>
              <p className="text-teal-50 text-xs font-semibold uppercase tracking-wider">Total Kelas</p>
              <p className="text-white font-black text-3xl">
                {classes.length} <span className="text-lg font-medium opacity-80">Kelas</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:py-8 md:px-8 xl:px-12 md:-mt-14 relative z-20 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
           <h2 className="text-sm md:text-xl font-bold text-slate-700 md:text-white md:bg-teal-800/80 md:backdrop-blur-md md:px-5 md:py-2.5 md:rounded-xl md:border md:border-teal-700/50 md:shadow-md">
             Daftar Kelas Aktif
           </h2>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white md:bg-transparent rounded-2xl">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
              <p className="text-center text-slate-400 text-sm font-medium">Memuat data kelas...</p>
          </div>
        )}
        
        {!loading && classes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white md:bg-white md:shadow-sm rounded-2xl border border-slate-100/50">
             <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-3xl mb-4">
               <AcademicCapIcon className="size-8 text-slate-300" />
             </div>
             <p className="text-center text-slate-500 font-bold md:text-lg">Kamu belum terdaftar di kelas mana pun.</p>
             <p className="text-center text-slate-400 text-sm mt-1">Silakan ikuti kelas terlebih dahulu untuk mulai belajar.</p>
          </div>
        )}
        
        {/* Classes List/Grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {classes.map((kelas) => {
            const attendance = attendanceMap[kelas.id];
            const gradient = gradients[kelas.id % gradients.length];

            return (
              <Link href={`/kelas/${kelas.id}`} key={kelas.id} className="block group">
                <div
                  className={clsx(
                    "rounded-xl md:rounded-2xl p-5 md:p-6 shadow-md md:shadow-lg hover:shadow-xl transition-all md:hover:-translate-y-1 relative overflow-hidden h-full flex flex-col",
                    gradient
                  )}
                >
                  {/* Decorative faint icon in bg */}
                  <div className="absolute -bottom-6 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <AcademicCapIcon className="size-32 text-white" />
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 pr-4">
                      <span className="inline-block px-2.5 py-1 bg-white/20 text-white text-[10px] md:text-xs font-bold rounded-md mb-3 tracking-wide backdrop-blur-sm border border-white/10 uppercase">
                        {kelas.subject}
                      </span>
                      <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2">
                        {kelas.name}
                      </h3>
                      <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                        {kelas.teacher?.name}
                      </p>

                      <div className="flex items-center gap-1.5 text-white/70 text-xs md:text-sm mt-3 bg-black/10 w-fit px-2.5 py-1 rounded-md border border-white/5">
                        <UserGroupIcon className="size-4" />
                        <span className="font-semibold">{kelas.total_students} <span className="font-normal">siswa tergabung</span></span>
                      </div>
                    </div>
                    <div className="bg-white/20 group-hover:bg-white text-white group-hover:text-teal-600 rounded-full p-2.5 transition-colors shadow-sm">
                      <ChevronRightIcon className="size-5" />
                    </div>
                  </div>

                  {/* Spacer for flex-col */}
                  <div className="flex-1 min-h-[1rem]"></div>

                  {/* Attendance Status Bar */}
                  {attendance && attendance.total > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20 relative z-10 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-white/95 text-xs md:text-sm font-medium">
                          <CheckCircleIcon className="size-4 text-teal-100" />
                          <span>
                            Hadir: {attendance.hadir}/{attendance.total} hari
                          </span>
                        </div>
                        <span
                          className={clsx(
                            "text-xs md:text-sm font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-md",
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

                      <div className="w-full bg-black/20 rounded-full h-2 md:h-2.5 overflow-hidden border border-white/10">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-1000",
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
  );
}
