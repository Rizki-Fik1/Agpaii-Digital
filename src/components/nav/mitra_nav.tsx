"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function MitraNavbar() {
  const { auth } = useAuth();
  const pathname = usePathname();

  const navList: {
    label: string;
    icon: ReactNode;
    link: string;
    active?: boolean;
  }[] = [
    {
      label: "Mitra",
      icon: <HomeIcon className="size-6" />,
      active: pathname === "/mitra" || pathname.startsWith("/mitra/"),
      link: "/mitra",
    },
    {
      label: "Profil",
      icon: <UserIcon className="size-6" />,
      active: pathname.startsWith("/profile-mitra"),
      link: "/profile-mitra",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-lg">
      <div className="flex items-stretch justify-around h-16">
        {navList.map((item, i) => (
          <Link
            key={i}
            href={item.link}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition"
          >
            <div
              className={clsx(
                "transition-colors",
                item.active ? "text-green-600" : "text-slate-400"
              )}
            >
              {item.icon}
            </div>
            <span
              className={clsx(
                "text-xs font-medium",
                item.active ? "text-green-600" : "text-slate-400"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
