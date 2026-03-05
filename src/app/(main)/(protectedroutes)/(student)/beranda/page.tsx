"use client";

import { useAuth } from "@/utils/context/auth_context";
import {
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { STUDENT_ROLE_ID } from "@/constants/student-data";
import { getImage } from "@/utils/function/function";
import { useEffect, useState } from "react";

export default function StudentHomePage() {
  const { auth, authLoading } = useAuth();

  const [isRegisteredToClass, setIsRegisteredToClass] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [latestDiscussions, setLatestDiscussions] = useState<any[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  const fetchLatestDiscussions = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions?per_page=3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal fetch diskusi");

      const json = await res.json();

      // pastikan hanya 3
      setLatestDiscussions((json.data || []).slice(0, 3));
    } catch (e) {
      console.error("Fetch diskusi gagal", e);
      setLatestDiscussions([]);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    if (!authLoading && auth) {
      fetchLatestDiscussions();
    }
  }, [authLoading, auth]);

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

      if (!res.ok) throw new Error("Gagal fetch kelas siswa");

      const json = await res.json();

      setClasses(json.data || []);
      setIsRegisteredToClass((json.data || []).length > 0);
    } catch (e) {
      console.error("Fetch kelas siswa gagal", e);
      setClasses([]);
      setIsRegisteredToClass(false);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (!authLoading && auth?.role_id === STUDENT_ROLE_ID) {
      fetchMyClasses();
      setStudentData(auth);
    }
  }, [authLoading, auth]);

  return (
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden w-full max-w-[480px] mx-auto bg-white min-h-screen">
        {/* Header dengan Sapaan */}
        <div className="w-full bg-white px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src="/img/wave.png"
                alt="sapa"
                className="size-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-[#575757]">
                  Assalamualaikum
                </p>
                <p className="text-sm sm:text-base font-bold text-[#006557] truncate">
                  {auth?.name || studentData?.name || "Siswa"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/profile-siswa"
                className="rounded-full border-2 border-teal-200 flex-shrink-0 hover:border-teal-400 transition"
              >
                <img
                  src={getImage(auth?.avatar)}
                  className="object-cover rounded-full size-10"
                  alt="Avatar"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Info sekolah untuk siswa */}
        {studentData?.school && (
          <div className="px-4 mb-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <AcademicCapIcon className="size-5 text-teal-600" />
              <span className="text-sm text-teal-700">{studentData.school}</span>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="px-4 space-y-3 mb-6">
          {isRegisteredToClass ? (
            <Link href="/kelas" className="block">
              <div className="relative bg-gradient-to-r from-[#00A86B] to-[#2ECC71] rounded-2xl p-5 shadow-lg overflow-hidden">
                <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-xl rotate-12 flex items-center justify-center">
                  <AcademicCapIcon className="size-10 text-white/80" />
                </div>
                <div className="absolute top-0 right-14 w-4 h-4 bg-white/30 rounded-full"></div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full mb-3">
                    {classes.length} KELAS TERDAFTAR
                  </span>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Kelas Saya
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    Akses materi pembelajaran, latihan soal, dan diskusi kelas.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-white rounded-full p-2">
                      <ChevronRightIcon className="size-4 text-[#00A86B]" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl p-5 shadow-lg overflow-hidden">
              <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-xl rotate-12 flex items-center justify-center">
                <ClockIcon className="size-10 text-white/80" />
              </div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full mb-3">
                  MENUNGGU PENDAFTARAN
                </span>
                <h3 className="text-white text-xl font-bold mb-1">
                  Kelas Belum Tersedia
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Guru akan mendaftarkanmu ke kelas. Tunggu konfirmasi dari gurumu
                  ya!
                </p>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <InformationCircleIcon className="size-5 text-white" />
                  <span className="text-white text-xs">
                    Hubungi guru PAI di sekolahmu untuk didaftarkan
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link href="/forum" className="block">
            <div className="relative bg-gradient-to-r from-[#00897B] to-[#26A69A] rounded-2xl p-5 shadow-lg overflow-hidden">
              <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-xl rotate-12 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="size-10 text-white/80" />
              </div>
              <div className="absolute top-0 right-14 w-4 h-4 bg-white/30 rounded-full"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full mb-3">
                  FORUM SEKOLAH
                </span>
                <h3 className="text-white text-xl font-bold mb-1">
                  Forum Publik
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Diskusi dan berbagi dengan seluruh siswa di sekolahmu.
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded-full p-2">
                    <ChevronRightIcon className="size-4 text-[#00897B]" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Forum Preview */}
        <div className="px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-700">Diskusi Terbaru</h2>
            <Link href="/forum" className="text-sm text-teal-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {loadingDiscussions && (
              <p className="text-sm text-slate-400">Memuat diskusi...</p>
            )}

            {!loadingDiscussions && latestDiscussions.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada diskusi</p>
            )}

            {latestDiscussions.map((post) => (
              <Link href={`/forum/${post.id}`} key={post.id} className="block">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-3">
                    <img
                      src={
                        post.user.avatar?.startsWith("http")
                          ? post.user.avatar
                          : `http://file.agpaiidigital.org/${post.user.avatar}`
                      }
                      alt={post.user.name}
                      className="size-10 rounded-full flex-shrink-0 object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700 text-sm">
                          {post.user.name}
                        </span>
                        <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                          {post.user.role_id === STUDENT_ROLE_ID
                            ? "Siswa"
                            : "Guru"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <HeartIcon className="size-4" />
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="size-4" />
                          {post.replies?.length || 0}
                        </span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block w-full min-h-screen bg-transparent pt-[4.5rem]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          
          {/* Desktop Header/Welcome */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-white/10 skew-x-12 translate-x-10"></div>
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <img
                  src={getImage(auth?.avatar)}
                  className="size-20 lg:size-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
                  alt="Avatar"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/img/wave.png" alt="sapa" className="size-6" />
                    <span className="text-teal-100 font-medium">Assalamualaikum</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    {auth?.name || studentData?.name || "Siswa Cerdas"}
                  </h1>
                  {studentData?.school && (
                    <div className="flex items-center gap-2 text-teal-50 bg-white/10 w-fit px-3 py-1.5 rounded-lg text-sm">
                      <AcademicCapIcon className="size-5" />
                      {studentData.school}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right hidden lg:block">
                <p className="text-teal-100 text-sm mb-1">Status Keanggotaan</p>
                <div className="bg-white/20 px-4 py-2 rounded-xl text-white font-semibold backdrop-blur-sm border border-white/20 shadow-sm">
                  Aktif Belajar
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                    <AcademicCapIcon className="size-5" />
                  </span>
                  Akses Utama
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {isRegisteredToClass ? (
                    <Link href="/kelas" className="block group">
                      <div className="bg-gradient-to-br from-[#00A86B] to-[#2ECC71] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                        <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/30 transition-colors">
                          <AcademicCapIcon className="size-16 rotate-12" />
                        </div>
                        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold tracking-wider rounded-lg mb-4">
                          {classes.length} KELAS
                        </span>
                        <h3 className="text-white text-2xl font-bold mb-2">Kelas Saya</h3>
                        <p className="text-white/90 text-sm mb-6 max-w-[80%]">Akses materi, tugas, dan ujian dari sekolahmu.</p>
                        <div className="flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                          Masuk Kelas <ChevronRightIcon className="size-4" />
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-gradient-to-br from-slate-500 to-slate-400 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-4 right-4 text-white/20">
                        <ClockIcon className="size-16" />
                      </div>
                      <div>
                        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold tracking-wider rounded-lg mb-4">
                          MENUNGGU
                        </span>
                        <h3 className="text-white text-2xl font-bold mb-2">Kelas Kosong</h3>
                        <p className="text-white/90 text-sm mb-6 max-w-[85%]">
                          Silahkan hubungi guru PAI di sekolahmu untuk mendaftarkanmu.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 font-medium text-sm">
                        <InformationCircleIcon className="size-5" /> Menunggu Pendaftaran
                      </div>
                    </div>
                  )}

                  <Link href="/forum" className="block group">
                    <div className="bg-gradient-to-br from-[#00897B] to-[#00695C] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                      <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                        <ChatBubbleLeftRightIcon className="size-16" />
                      </div>
                      <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold tracking-wider rounded-lg mb-4">
                        DISKUSI
                      </span>
                      <h3 className="text-white text-2xl font-bold mb-2">Forum Sekolah</h3>
                      <p className="text-white/80 text-sm mb-6 max-w-[80%]">Tanya jawab dan berbagi ilmu sesama siswa.</p>
                      <div className="flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                        Buka Forum <ChevronRightIcon className="size-4" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column (Sidebar Content) */}
            <div className="space-y-6">
              
              {/* Forum Terkini Desktop */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="size-5 text-teal-600" />
                    Forum Terkini
                  </h2>
                  <Link href="/forum" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition">
                    Lihat Semua
                  </Link>
                </div>

                <div className="space-y-4">
                  {loadingDiscussions && (
                     <div className="flex justify-center py-8">
                       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
                     </div>
                  )}
                  {!loadingDiscussions && latestDiscussions.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-slate-500 text-sm">Belum ada diskusi baru.</p>
                    </div>
                  )}
                  
                  {latestDiscussions.map((post) => (
                    <Link href={`/forum/${post.id}`} key={post.id} className="block group">
                      <div className="bg-slate-50 hover:bg-teal-50/50 rounded-xl p-4 transition-colors border border-transparent hover:border-teal-100/50">
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              post.user.avatar?.startsWith("http")
                                ? post.user.avatar
                                : `http://file.agpaiidigital.org/${post.user.avatar}`
                            }
                            alt={post.user.name}
                            className="size-10 rounded-full flex-shrink-0 object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                                {post.user.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <HeartIcon className="size-3" /> {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ChatBubbleLeftRightIcon className="size-3" /> {post.replies?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
