"use client";

import { useAuth } from "@/utils/context/auth_context";
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getImage } from "@/utils/function/function";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentProfilePage() {
  const { auth, authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Gagal fetch kelas");
        const json = await res.json();
        setClasses(json.data || []);
      } catch (e) {
        console.error(e);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    if (!authLoading && auth) {
      fetchMyClasses();
    }
  }, [authLoading, auth]);

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    router.replace("/getting-started");
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Memuat profil...</p>
      </div>
    );
  }

  return (
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeftIcon className="size-6 text-white" />
          </button>
          <h1 className="font-semibold text-lg ml-3 flex-grow">Profil Saya</h1>
          <Link
            href="/profile-siswa/edit"
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-white transition"
          >
            Edit
          </Link>
        </div>

        {/* Profile Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

          <div className="px-4 -mt-16 relative z-10">
            <div className="border-4 border-white rounded-full overflow-hidden bg-white inline-block">
              <img
                src={(auth?.avatar && getImage(auth.avatar)) || "/img/profileplacholder.png"}
                alt="avatar"
                className="size-28 object-cover"
              />
            </div>
          </div>

          <div className="px-4 pt-4 pb-6">
            <h1 className="font-bold text-2xl text-slate-900">{auth?.name}</h1>
            <p className="text-sm text-teal-600 font-medium mt-1">Siswa</p>

            <div className="mt-6 space-y-3">
              {(auth?.nisn || auth?.profile?.nisn) && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="p-2 bg-green-100 rounded-lg"><AcademicCapIcon className="size-5 text-green-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">NISN</p>
                    <p className="text-sm text-slate-700 font-medium">{auth?.nisn || auth?.profile?.nisn}</p>
                  </div>
                </div>
              )}

              {(auth?.school_place || auth?.profile?.school_place) && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><BuildingLibraryIcon className="size-5 text-purple-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Sekolah</p>
                    <p className="text-sm text-slate-700 font-medium">{auth?.school_place || auth?.profile?.school_place}</p>
                  </div>
                </div>
              )}

              {auth?.email && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="p-2 bg-teal-100 rounded-lg"><EnvelopeIcon className="size-5 text-teal-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-700 font-medium truncate">{auth.email}</p>
                  </div>
                </div>
              )}

              {(auth?.phone || auth?.no_hp) && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><PhoneIcon className="size-5 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Telepon</p>
                    <p className="text-sm text-slate-700 font-medium">{auth?.phone || auth?.no_hp}</p>
                  </div>
                </div>
              )}

              {(auth?.home_address || auth?.profile?.home_address) && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="p-2 bg-orange-100 rounded-lg"><MapPinIcon className="size-5 text-orange-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Alamat</p>
                    <p className="text-sm text-slate-700 font-medium">{auth?.home_address || auth?.profile?.home_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Statistik</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AcademicCapIcon className="size-5 text-teal-600" />
                <p className="text-xs text-teal-700 font-medium">Kelas</p>
              </div>
              <p className="text-2xl font-bold text-teal-700">{loadingClasses ? "..." : classes.length}</p>
              <p className="text-xs text-teal-600 mt-1">Kelas terdaftar</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDaysIcon className="size-5 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Bergabung</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{auth?.created_at ? new Date(auth.created_at).getFullYear() : "-"}</p>
              <p className="text-xs text-blue-600 mt-1">Tahun</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Kelas yang Diikuti</h2>
          {loadingClasses ? (
            <p className="text-sm text-slate-400">Memuat kelas...</p>
          ) : classes.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <ClockIcon className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Belum terdaftar di kelas manapun</p>
              <p className="text-xs text-slate-400 mt-1">Hubungi guru untuk didaftarkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((kelas) => (
                <div
                  key={kelas.id}
                  onClick={() => router.push(`/kelas/${kelas.id}`)}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-teal-100 rounded-xl"><AcademicCapIcon className="size-6 text-teal-600" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-700">{kelas.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{kelas.school_place}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Guru: {kelas.teacher?.name || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition"
          >
            <ArrowRightOnRectangleIcon className="size-5" /> Keluar
          </button>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block w-full min-h-screen bg-transparent pt-[4.5rem]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Profil Siswa</h1>
              <p className="text-slate-500 text-sm mt-1">Kelola data diri dan lihat perkembangan belajar Anda.</p>
            </div>
            <Link
              href="/profile-siswa/edit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition text-sm font-semibold shadow-sm"
            >
              Edit Profil
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (User Card & Stats) */}
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                <div className="px-6 relative flex flex-col items-center">
                  <div className="p-1.5 bg-white rounded-full -mt-14 relative z-10 shadow-sm">
                    <img
                      src={(auth?.avatar && getImage(auth.avatar)) || "/img/profileplacholder.png"}
                      alt="avatar"
                      className="size-24 rounded-full object-cover"
                    />
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-800 text-center">{auth?.name}</h2>
                  <p className="text-sm font-semibold text-teal-600 mt-0.5 mb-6 text-center">Siswa</p>
                </div>
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                   <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-xl border border-red-200 transition flex items-center justify-center gap-2 text-sm"
                   >
                     <ArrowRightOnRectangleIcon className="size-4" /> Keluar dari Akun
                   </button>
                </div>
              </div>

              {/* Stats Desktop */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-4 text-base">Statistik Singkat</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><AcademicCapIcon className="size-5" /></div>
                        <div>
                          <p className="text-xs text-teal-800 font-medium">Kelas Aktif</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-teal-700">{loadingClasses ? "..." : classes.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><CalendarDaysIcon className="size-5" /></div>
                        <div>
                          <p className="text-xs text-blue-800 font-medium">Bergabung</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-blue-700">{auth?.created_at ? new Date(auth.created_at).getFullYear() : "-"}</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column (Details & Classes) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-5 text-lg border-b border-slate-100 pb-3">Informasi Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><AcademicCapIcon className="size-3.5" /> NISN</p>
                      <p className="text-sm font-medium text-slate-800">{auth?.nisn || auth?.profile?.nisn || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><BuildingLibraryIcon className="size-3.5" /> Sekolah</p>
                      <p className="text-sm font-medium text-slate-800">{auth?.school_place || auth?.profile?.school_place || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><EnvelopeIcon className="size-3.5" /> Email</p>
                      <p className="text-sm font-medium text-slate-800">{auth?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><PhoneIcon className="size-3.5" /> Telepon</p>
                      <p className="text-sm font-medium text-slate-800">{auth?.phone || auth?.no_hp || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><MapPinIcon className="size-3.5" /> Alamat</p>
                      <p className="text-sm font-medium text-slate-800">{auth?.home_address || auth?.profile?.home_address || "-"}</p>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-5 text-lg flex items-center justify-between border-b border-slate-100 pb-3">
                  Kelas yang Diikuti
                </h3>
                
                {loadingClasses ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600 border-b-2"></div>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center ring-1 ring-inset ring-slate-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <AcademicCapIcon className="size-8 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium text-base mb-1">Anda belum terdaftar di kelas manapun</p>
                    <p className="text-sm text-slate-400">Hubungi guru PAI Anda untuk mendapatkan daftar kelas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((kelas) => (
                      <div
                        key={kelas.id}
                        onClick={() => router.push(`/kelas/${kelas.id}`)}
                        className="group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 cursor-pointer flex gap-4 items-start"
                      >
                        <div className="p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl group-hover:bg-teal-100 transition-colors border border-teal-100">
                          <AcademicCapIcon className="size-6 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors truncate">{kelas.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 truncate">{kelas.school_place}</p>
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 truncate max-w-full">
                              Guru: {kelas.teacher?.name || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
