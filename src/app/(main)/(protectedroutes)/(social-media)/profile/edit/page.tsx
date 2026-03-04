"use client";

import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import { useModal } from "@/utils/hooks/use_modal";
import {
  UserIcon,
  MapPinIcon,
  AcademicCapIcon,
  CameraIcon,
  LockClosedIcon,
  ArrowLeftStartOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import {
  isInformationProfileCompleted,
  isLocationProfileCompleted,
  isPnsStatusCompleted,
} from "@/utils/function/function";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function EditProfile() {
  const queryClient = useQueryClient();
  const { auth, authLoading } = useAuth();
  const router = useRouter();
  const { show, toggle } = useModal();

  if (authLoading || !auth) return null;

  const completionStatus = {
    information: isInformationProfileCompleted(auth),
    region: isLocationProfileCompleted(auth),
    status: isPnsStatusCompleted(auth),
  };

  const totalSection = 3;
  const completedSection =
    Number(completionStatus.information) +
    Number(completionStatus.region) +
    Number(completionStatus.status);

  const completionPercent = Math.round(
    (completedSection / totalSection) * 100
  );

  const menuList: {
    label: string;
    link: string;
    icon: ReactNode;
    completed?: boolean;
    description?: string;
  }[] = [
    {
      label: "Informasi Umum",
      link: "edit/information",
      icon: <UserIcon className="size-5" />,
      completed: completionStatus.information,
      description: "Nama, email, nomor telepon",
    },
    {
      label: "Provinsi / Kota",
      link: "edit/region",
      icon: <MapPinIcon className="size-5" />,
      completed: completionStatus.region,
      description: "Lokasi tempat tinggal",
    },
    {
      label: "Status Guru",
      link: "edit/status",
      icon: <AcademicCapIcon className="size-5" />,
      completed: completionStatus.status,
      description: "Status kepegawaian",
    },
    {
      label: "Profile Sosmed",
      link: "edit/social-media",
      icon: <CameraIcon className="size-5" />,
      description: "Avatar, banner, bio",
    },
    {
      label: "Ubah Password",
      link: "edit/password",
      icon: <LockClosedIcon className="size-5" />,
      description: "Keamanan akun",
    },
  ];

  const logout = async () => {
    localStorage.removeItem("access_token");
    await queryClient
      .invalidateQueries({ queryKey: ["auth"] })
      .then(() => router.push("/auth/login"));
  };

  return (
    <>
      {/* Logout Modal */}
      <Modal show={show} onClose={toggle} className="w-[20rem]">
        <div className="mt-8">
          <h1 className="mb-8 text-left text-sm text-slate-600">
            Apakah anda yakin ingin log out?
          </h1>
          <div className="flex gap-2 justify-end">
            <button
              onClick={toggle}
              className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={logout}
              className="bg-[#009788] hover:bg-[#00867a] px-5 py-2 rounded-xl text-white text-sm font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>

      <div className="pt-[4.21rem] min-h-screen bg-white md:bg-[#FAFBFC]">
        <TopBar withBackButton href="/">
          Edit Profile
        </TopBar>

        <div className="md:max-w-3xl md:mx-auto px-[5%] sm:px-6 md:px-8 mt-4 md:mt-8 pb-10">

          {/* HEADER */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Edit Profile
            </h2>
            <p className="text-sm md:text-[15px] text-slate-500 mt-1">
              Lengkapi data anda untuk mengaktifkan semua fitur
            </p>
          </div>

          {/* PROGRESS CARD */}
          <div className="bg-gradient-to-r from-[#004D40] to-[#00897B] p-5 md:p-6 rounded-2xl shadow-sm mb-6 md:mb-8 text-white">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-sm text-white/80">
                Kelengkapan Profil
              </span>
              <span className="font-bold text-lg">
                {completionPercent}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-emerald-300 h-2.5 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-white/50 mt-2">
              {completedSection} dari {totalSection} kategori sudah lengkap
            </p>
          </div>

          {/* MENU LIST */}
          <div className="space-y-3">
            {menuList.map((menu, i) => (
              <Link
                href={menu.link}
                key={i}
                className={`flex items-center px-5 py-4 rounded-2xl border transition-all hover:shadow-md group
                  ${
                    menu.completed === false
                      ? "border-red-200 bg-red-50 md:bg-white md:border-red-200"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  menu.completed === false
                    ? "bg-red-100 text-red-500"
                    : menu.completed === true
                    ? "bg-emerald-100 text-[#009788]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-[#009788]"
                } transition-colors`}>
                  {menu.icon}
                </div>

                <div className="ml-4 flex-1">
                  <h3 className="text-slate-800 text-sm font-semibold">
                    {menu.label}
                  </h3>
                  {menu.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{menu.description}</p>
                  )}
                  {menu.completed === false && (
                    <p className="text-xs text-red-500 mt-0.5 font-medium">
                      Data belum lengkap
                    </p>
                  )}
                  {menu.completed === true && (
                    <p className="text-xs text-emerald-600 mt-0.5 font-medium">
                      Data sudah lengkap
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {menu.completed === true && (
                    <CheckCircleIcon className="size-5 text-emerald-500" />
                  )}
                  {menu.completed === false && (
                    <ExclamationCircleIcon className="size-5 text-red-500" />
                  )}
                  <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* ADMIN ONLY */}
          {auth.role_id == 1 && (
            <Link
              href={"/edit-user"}
              className="flex items-center px-5 py-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all mt-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <UserIcon className="size-5" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-slate-800 text-sm font-semibold">Edit User</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kelola akun pengguna</p>
              </div>
              <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          )}

          {/* LOGOUT */}
          <div
            onClick={toggle}
            className="flex items-center px-5 py-4 rounded-2xl border border-slate-100 bg-white hover:border-red-200 hover:bg-red-50 transition-all mt-10 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <ArrowLeftStartOnRectangleIcon className="size-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-slate-700 text-sm font-semibold group-hover:text-red-600 transition-colors">
                Logout
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Keluar dari akun Anda</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}