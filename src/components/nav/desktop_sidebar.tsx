"use client";

import { useAuth } from "@/utils/context/auth_context";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { STUDENT_ROLE_ID, MITRA_ROLE_ID } from "@/constants/student-data";
import {
  HomeIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  IdentificationIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  CalendarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  RectangleGroupIcon,
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
  MoonIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { getUserStatus } from "@/utils/function/function";
import { Status } from "@/constant/constant";

// Constants (dapat disesuaikan jika import dirasa beda dengan di komponen aslinya)
export default function DesktopSidebar({ className = "" }: { className?: string }) {
  const { auth, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (authLoading || !auth) return null;

  const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);
  const isStudent = roleId === STUDENT_ROLE_ID;
  const isMitra = roleId === MITRA_ROLE_ID;

  // Cek apakah sedang di halaman social media
  const isSocialMedia = pathname.startsWith("/social-media") || pathname.startsWith("/profile");
  
  // Sembunyikan sidebar di halaman login atau getting-started
  const isGuestPage = pathname === "/fetching" || pathname === "/getting-started" || pathname === "/auth/login";
  if (isGuestPage) return null;

  const userStatus = getUserStatus(auth);
  const isRestricted = userStatus === Status.EXPIRED || userStatus === Status.INACTIVE;

  let navGroups: { group: string | null; items: any[] }[] = [];

    const rawAvatar = auth?.avatar || auth?.foto;

      const avatarUrl = rawAvatar
        ? rawAvatar.startsWith("http")
          ? rawAvatar
          : `https://file.agpaiidigital.org/${rawAvatar}`
        : null;
  if (isStudent) {
    navGroups = [
      {
        group: "Menu Siswa",
        items: [
          {
            label: "Beranda",
            icon: <HomeIcon className="size-6" />,
            active: pathname === "/" || pathname.startsWith("/beranda"),
            link: "/beranda",
            restricted: false,
          },
          {
            label: "Kelas",
            icon: <BookOpenIcon className="size-6" />,
            active: pathname.startsWith("/kelas") && !pathname.startsWith("/kelas-guru"),
            link: "/kelas",
            restricted: true,
          },
          {
            label: "Forum",
            icon: <ChatBubbleLeftRightIcon className="size-6" />,
            active: pathname.startsWith("/forum"),
            link: "/forum",
            restricted: true,
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            link: `/profile-siswa`,
            active: pathname.startsWith(`/profile-siswa`),
            restricted: false,
          },
        ]
      }
    ];
  } else if (isMitra) {
    navGroups = [
      {
        group: "Mitra",
        items: [
          {
            label: "Mitra Dashboard",
            icon: <HomeIcon className="size-6" />,
            active: pathname.startsWith("/mitra"),
            link: "/mitra",
            restricted: false,
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname === "/profile-mitra",
            link: "/profile-mitra",
            restricted: false,
          }
        ]
      }
    ];
  } else {
            // Default Guru 
    navGroups = [
      {
        group: "Menu Utama",
        items: [
          {
            label: "Dashboard",
            icon: <HomeIcon className="size-6" />,
            active: pathname.startsWith("/dashboard") || pathname === "/beranda" || pathname === "/",
            link: "/",
            restricted: false,
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname.startsWith(`/profile/${auth.id}`) || pathname === "/profile/edit",
            link: `/profile/edit`,
            restricted: false,
          },
          {
            label: "Pesan",
            icon: <ChatBubbleLeftIcon className="size-6" />,
            link: "/social-media/chat",
            active: pathname.startsWith("/social-media/chat"),
            restricted: true,
          }
        ]
      },
      {
        group: "Acara & Organisasi",
        items: [
          {
            label: "KTA Digital",
            icon: <IdentificationIcon className="size-6" />,
            active: pathname.startsWith("/kta"),
            link: "/kta",
            restricted: true,
          },
          {
            label: "Social Media",
            icon: <GlobeAltIcon className="size-6" />,
            active: pathname.startsWith("/social-media") && !pathname.startsWith("/social-media/chat"),
            link: "/social-media",
            restricted: true,
          },
          {
            label: "Live",
            icon: <VideoCameraIcon className="size-6" />,
            link: "/live",
            active: pathname.startsWith("/live"),
            restricted: true,
          },
          {
            label: "Acara",
            icon: <CalendarIcon className="size-6" />,
            link: "/event",
            active: pathname.startsWith("/event"),
            restricted: true,
          },
          {
            label: "Struktur Organisasi",
            icon: <UserGroupIcon className="size-6" />,
            link: "/struktur",
            active: pathname.startsWith("/struktur"),
            restricted: true,
          },
          {
            label: "Informasi Anggota",
            icon: <ClipboardDocumentListIcon className="size-6" />,
            link: "/member",
            active: pathname.startsWith("/member"),
            restricted: true,
          },
          {
            label: "Data Iuran",
            icon: <CreditCardIcon className="size-6" />,
            link: "/iuran",
            active: pathname.startsWith("/iuran"),
            restricted: true,
          }
        ]
      },
      {
        group: "Edukasi",
        items: [
          {
            label: "Kelas Saya",
            icon: <AcademicCapIcon className="size-6" />,
            link: "/kelas-guru",
            active: pathname.startsWith("/kelas-guru"),
            restricted: true,
          },
          {
            label: "Baca Buku",
            icon: <BookOpenIcon className="size-6" />,
            link: "/baca-buku",
            active: pathname.startsWith("/baca-buku"),
            restricted: true,
          },
          {
            label: "Ruang Guru",
            icon: <BriefcaseIcon className="size-6" />,
            link: "/ruang-guru",
            active: pathname.startsWith("/ruang-guru"),
            restricted: true,
          },
          {
            label: "Perangkat Ajar",
            icon: <FolderOpenIcon className="size-6" />,
            link: "/perangkat-ajar",
            active: pathname.startsWith("/perangkat-ajar"),
            restricted: true,
          },
          {
            label: "RPP Digital",
            icon: <DocumentTextIcon className="size-6" />,
            link: "/rpp",
            active: pathname.startsWith("/rpp"),
            restricted: true,
          },
          {
            label: "Tryout",
            icon: <PencilSquareIcon className="size-6" />,
            link: "/cbt",
            active: pathname.startsWith("/cbt"),
            restricted: true,
          },
          {
            label: "Modul Digital",
            icon: <RectangleGroupIcon className="size-6" />,
            link: "/modul-ajar",
            active: pathname.startsWith("/modul"),
            restricted: true,
          },
        ]
      },
      {
        group: "Keagamaan",
        items: [
          {
            label: "Doa",
            icon: <SparklesIcon className="size-6" />,
            link: "/doa",
            active: pathname.startsWith("/doa"),
            restricted: true,
          },
          {
            label: "Al-Qur'an",
            icon: <BookOpenIcon className="size-6" />,
            link: "/murrotal/surat",
            active: pathname.startsWith("/murrotal"),
            restricted: true,
          },
          {
            label: "Tasbih Digital",
            icon: <ListBulletIcon className="size-6" />,
            link: "/tasbih",
            active: pathname.startsWith("/tasbih"),
            restricted: true,
          },
          {
            label: "Arah Kiblat",
            icon: <MapPinIcon className="size-6" />,
            link: "/arah-kiblat",
            active: pathname.startsWith("/arah-kiblat"),
            restricted: true,
          },
          {
            label: "Waktu Shalat",
            icon: <ClockIcon className="size-6" />,
            link: "/waktu-sholat",
            active: pathname.startsWith("/waktu"),
            restricted: true,
          },
          {
            label: "Ramadhan",
            icon: <MoonIcon className="size-6" />,
            link: "/ramadhan",
            active: pathname.startsWith("/ramadhan"),
            restricted: true,
          }
        ]
      },
      {
        group: "Perdagangan",
        items: [
          {
            label: "Marketplace",
            icon: <ShoppingBagIcon className="size-6" />,
            link: "/marketplace",
            active: pathname.startsWith("/marketplace"),
            restricted: true,
          },
          {
            label: "PPOB",
            icon: <DevicePhoneMobileIcon className="size-6" />,
            link: "/ecommerce",
            active: pathname.startsWith("/ecommerce"),
            restricted: true,
          },
          {
            label: "Mitra",
            icon: <UserGroupIcon className="size-6" />,
            link: "/mitra",
            active: pathname.startsWith("/mitra"),
            restricted: true,
          }
        ]
      }
    ];
  }

  return (
    <aside className={clsx("flex flex-col border-r shadow-sm border-slate-200 h-screen sticky top-0 bg-white z-[90]", className)}>
      <div className="p-4 lg:p-6 flex items-center border-b border-slate-100">
        <h1 className="ml-2 font-bold text-xl text-teal-700 hidden lg:block tracking-tight text-center w-full">AGPAII Digital</h1>
        <div className="lg:hidden mx-auto font-bold text-2xl text-teal-700">A</div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1.5">
            {group.group && (
              <h3 className="hidden lg:block px-4 text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-3 mt-2">
                {group.group}
              </h3>
            )}
            {group.items.map((item, i) => {
                const blocked = item.restricted && isRestricted;
                return (
                  <Link
                    key={i}
                    href={blocked ? "/" : item.link}
                    className={clsx(
                      "flex items-center gap-3 lg:gap-4 px-3 py-2.5 lg:px-4 rounded-xl transition-all duration-200 group relative",
                      item.active
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-teal-600 font-medium"
                    )}
                    title={item.label}
                  >
                    <div className={clsx(item.active ? "text-teal-600" : "text-slate-400 group-hover:text-teal-500 transition-colors")}>
                      {item.icon}
                    </div>
                    <span className="hidden lg:block text-sm">
                      {item.label}
                    </span>

                    {/* Tooltip untuk layout md di mana label disembunyikan */}
                    <div className="absolute left-16 z-50 p-2 text-xs text-white bg-slate-800 rounded shadow-lg opacity-0 invisible group-hover:visible lg:hidden group-hover:opacity-100 transition-all pointer-events-none">
                      {item.label}
                    </div>
                  </Link>
                );
            })}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100">
        <Link href="/profile/edit" className="flex items-center gap-3 px-1 lg:px-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="w-10 h-10 min-w-10 rounded-full border border-slate-200 object-cover"
              alt="Avatar"
            />
          ) : (
            <div className="w-10 h-10 min-w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
              {auth.name?.charAt(0)}
            </div>
          )}
          <div className="hidden lg:block overflow-hidden flex-1">
             <div className="text-sm font-bold text-slate-700 truncate">{auth.name}</div>
             <div className="text-xs text-slate-500 truncate">{auth.email}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

