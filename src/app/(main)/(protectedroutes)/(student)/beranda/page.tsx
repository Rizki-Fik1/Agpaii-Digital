"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  MOCK_CLASS_INFO,
  MOCK_FORUM_POSTS,
} from "@/constants/student-data";
import { getImage } from "@/utils/function/function";

export default function StudentHomePage() {
  const { auth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fungsi logout untuk akun demo siswa
  const handleLogout = async () => {
    // Hapus flag demo student mode dari localStorage
    localStorage.removeItem("demo_student_mode");
    localStorage.removeItem("access_token");
    
    // Invalidate auth query
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    
    // Redirect ke halaman login
    router.push("/getting-started");
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header dengan Sapaan */}
      <div className="w-full bg-white px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/img/wave.png" alt="sapa" className="size-8 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-[#575757]">Assalamualaikum</p>
              <p className="text-sm sm:text-base font-bold text-[#006557] truncate">{auth?.name || "Siswa"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-full transition"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="size-5 text-red-500" />
            </button>
            {/* Profile Image */}
            <Link href="/kelas?tab=profile" className="rounded-full border-2 border-white flex-shrink-0">
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

      {/* Info Kelas */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-xl p-2">
              <AcademicCapIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Kelas Anda</p>
              <p className="text-white font-semibold text-lg">{MOCK_CLASS_INFO.name}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Wali Kelas</span>
              <span className="text-white font-medium">{MOCK_CLASS_INFO.teacher.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-white/80">Sekolah</span>
              <span className="text-white font-medium">{MOCK_CLASS_INFO.school}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-white/80">Jumlah Siswa</span>
              <span className="text-white font-medium">{MOCK_CLASS_INFO.totalStudents} siswa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 space-y-3 mb-6">
        {/* Kelas Saya Card */}
        <Link href="/kelas" className="block">
          <div className="relative bg-gradient-to-r from-[#00A86B] to-[#2ECC71] rounded-2xl p-5 shadow-lg overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-xl rotate-12 flex items-center justify-center">
              <AcademicCapIcon className="size-10 text-white/80" />
            </div>
            <div className="absolute top-0 right-14 w-4 h-4 bg-white/30 rounded-full"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full mb-3">
                DASHBOARD UTAMA
              </span>
              <h3 className="text-white text-xl font-bold mb-1">Kelas Saya</h3>
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

        {/* Forum Publik Card */}
        <Link href="/forum" className="block">
          <div className="relative bg-gradient-to-r from-[#00897B] to-[#26A69A] rounded-2xl p-5 shadow-lg overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-xl rotate-12 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="size-10 text-white/80" />
            </div>
            <div className="absolute top-0 right-14 w-4 h-4 bg-white/30 rounded-full"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full mb-3">
                FORUM SEKOLAH
              </span>
              <h3 className="text-white text-xl font-bold mb-1">Forum Publik</h3>
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

      {/* Forum Preview Section */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-700">Diskusi Terbaru</h2>
          <Link href="/forum" className="text-sm text-teal-600 hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="space-y-3">
          {MOCK_FORUM_POSTS.slice(0, 3).map((post) => (
            <Link href="/forum" key={post.id} className="block">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex gap-3">
                  <img
                    src="https://avatar.iran.liara.run/public"
                    alt={post.authorName}
                    className="size-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700 text-sm">
                        {post.authorName}
                      </span>
                      <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {post.authorRole}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <HeartIcon className="size-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="size-4" />
                        {post.comments}
                      </span>
                      <span>{post.createdAt}</span>
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
