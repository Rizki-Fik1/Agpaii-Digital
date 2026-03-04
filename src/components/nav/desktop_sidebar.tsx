"use client";

import { useAuth } from "@/utils/context/auth_context";
import { usePathname } from "next/navigation";
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

  if (authLoading || !auth) return null;

  const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);
  const isStudent = roleId === STUDENT_ROLE_ID;
  const isMitra = roleId === MITRA_ROLE_ID;

  // Cek apakah sedang di halaman social media
  const isSocialMedia = pathname.startsWith("/social-media") || pathname.startsWith("/profile");
  
  // Sembunyikan sidebar di halaman login atau getting-started
  const isGuestPage = pathname === "/fetching" || pathname === "/getting-started" || pathname === "/auth/login";
  if (isGuestPage) return null;

  let navGroups: { group: string | null; items: any[] }[] = [];

  if (isSocialMedia && getUserStatus(auth) === Status.ACTIVE) {
    navGroups = [
      {
        group: "Sosial Media",
        items: [
          {
            id: "beranda",
            label: "Beranda",
            icon: <HomeIcon className="size-6" />,
            active: pathname === "/social-media",
            link: "/social-media",
          },
          {
            id: "disukai",
            label: "Disukai",
            icon: <HeartIcon className="size-6" />,
            active: pathname === "/social-media/liked",
            link: "/social-media/liked",
          },
          {
            id: "posting",
            label: "Posting Baru",
            icon: <PlusIcon className="size-6" />,
            link: "/social-media/post/new",
            active: false,
          },
          {
            id: "pesan",
            label: "Pesan",
            icon: <ChatBubbleLeftIcon className="size-6" />,
            link: "/social-media/chat",
            active: pathname === "/social-media/chat",
          },
          {
            id: "profil",
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            link: `/profile/${auth.id}`,
            active: pathname.startsWith(`/profile/${auth.id}`),
          },
        ]
      }
    ];
  } else if (isStudent) {
    navGroups = [
      {
        group: "Menu Siswa",
        items: [
          {
            label: "Beranda",
            icon: <HomeIcon className="size-6" />,
            active: pathname === "/" || pathname.startsWith("/beranda"),
            link: "/beranda",
          },
          {
            label: "Kelas",
            icon: <BookOpenIcon className="size-6" />,
            active: pathname.startsWith("/kelas") && !pathname.startsWith("/kelas-guru"),
            link: "/kelas",
          },
          {
            label: "Forum",
            icon: <ChatBubbleLeftRightIcon className="size-6" />,
            active: pathname.startsWith("/forum"),
            link: "/forum",
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            link: `/profile-siswa`,
            active: pathname.startsWith(`/profile-siswa`),
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
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname === "/profile-mitra",
            link: "/profile-mitra",
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
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname.startsWith(`/profile/${auth.id}`) || pathname === "/profile/edit",
            link: `/profile/edit`,
          },
          {
            label: "Pesan",
            icon: <ChatBubbleLeftIcon className="size-6" />,
            link: "/social-media/chat",
            active: pathname.startsWith("/social-media/chat"),
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
          },
          {
            label: "Social Media",
            icon: <GlobeAltIcon className="size-6" />,
            active: pathname.startsWith("/social-media") && !pathname.startsWith("/social-media/chat"),
            link: "/social-media",
          },
          {
            label: "Live",
            icon: <VideoCameraIcon className="size-6" />,
            link: "/live",
            active: pathname.startsWith("/live"),
          },
          {
            label: "Acara",
            icon: <CalendarIcon className="size-6" />,
            link: "/event",
            active: pathname.startsWith("/event"),
          },
          {
            label: "Struktur Organisasi",
            icon: <UserGroupIcon className="size-6" />,
            link: "/struktur",
            active: pathname.startsWith("/struktur"),
          },
          {
            label: "Informasi Anggota",
            icon: <ClipboardDocumentListIcon className="size-6" />,
            link: "/member",
            active: pathname.startsWith("/member"),
          },
          {
            label: "Data Iuran",
            icon: <CreditCardIcon className="size-6" />,
            link: "/iuran",
            active: pathname.startsWith("/iuran"),
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
          },
          {
            label: "Baca Buku",
            icon: <BookOpenIcon className="size-6" />,
            link: "/baca-buku",
            active: pathname.startsWith("/baca-buku"),
          },
          {
            label: "Ruang Guru",
            icon: <BriefcaseIcon className="size-6" />,
            link: "/ruang-guru",
            active: pathname.startsWith("/ruang-guru"),
          },
          {
            label: "Perangkat Ajar",
            icon: <FolderOpenIcon className="size-6" />,
            link: "/perangkat-ajar",
            active: pathname.startsWith("/perangkat-ajar"),
          },
          {
            label: "RPP Digital",
            icon: <DocumentTextIcon className="size-6" />,
            link: "/rpp",
            active: pathname.startsWith("/rpp"),
          },
          {
            label: "Tryout",
            icon: <PencilSquareIcon className="size-6" />,
            link: "/cbt",
            active: pathname.startsWith("/cbt"),
          },
          {
            label: "Modul Digital",
            icon: <RectangleGroupIcon className="size-6" />,
            link: "/modul-ajar",
            active: pathname.startsWith("/modul"),
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
          },
          {
            label: "Al-Qur'an",
            icon: <BookOpenIcon className="size-6" />,
            link: "/murrotal/surat",
            active: pathname.startsWith("/murrotal"),
          },
          {
            label: "Tasbih Digital",
            icon: <ListBulletIcon className="size-6" />,
            link: "/tasbih",
            active: pathname.startsWith("/tasbih"),
          },
          {
            label: "Arah Kiblat",
            icon: <MapPinIcon className="size-6" />,
            link: "/arah-kiblat",
            active: pathname.startsWith("/arah-kiblat"),
          },
          {
            label: "Waktu Shalat",
            icon: <ClockIcon className="size-6" />,
            link: "/waktu-sholat",
            active: pathname.startsWith("/waktu"),
          },
          {
            label: "Ramadhan",
            icon: <MoonIcon className="size-6" />,
            link: "/ramadhan",
            active: pathname.startsWith("/ramadhan"),
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
          },
          {
            label: "PPOB",
            icon: <DevicePhoneMobileIcon className="size-6" />,
            link: "/ecommerce",
            active: pathname.startsWith("/ecommerce"),
          },
          {
            label: "Mitra",
            icon: <UserGroupIcon className="size-6" />,
            link: "/mitra",
            active: pathname.startsWith("/mitra"),
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
            {group.items.map((item, i) => (
              <Link
                key={i}
                href={item.link}
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
            ))}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-1 lg:px-2">
          {auth.avatar || auth.foto ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={auth.avatar || auth.foto} className="w-10 h-10 min-w-10 rounded-full border border-slate-200 object-cover" alt="Avatar"/>
          ) : (
           <div className="w-10 h-10 min-w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
             {auth.name?.charAt(0)}
           </div>
          )}
          <div className="hidden lg:block overflow-hidden flex-1">
             <div className="text-sm font-bold text-slate-700 truncate">{auth.name}</div>
             <div className="text-xs text-slate-500 truncate">{auth.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
