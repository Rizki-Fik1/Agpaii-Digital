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
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
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
                src={
                  (auth?.avatar && getImage(auth.avatar)) ||
                  "https://avatar.iran.liara.run/public"
                }
                className="object-cover rounded-full size-10"
                alt=""
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

      {/* === SELURUH UI DI BAWAH TIDAK DIUBAH SAMA SEKALI === */}

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
                    src="https://avatar.iran.liara.run/public"
                    alt={post.user.name}
                    className="size-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700 text-sm">
                        {post.user.name}
                      </span>
                      <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {post.user.role_id === STUDENT_ROLE_ID ? "Siswa" : "Guru"}
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
  );
}
