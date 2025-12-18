"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  BellIcon,
  HeartIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SocialMediaNavbar() {
  const { auth } = useAuth();
  const pathname = usePathname();
  const hiddenNavPages = ["/social-media/post", "/profile/edit"];
  const isNavHidden = () => {
    return hiddenNavPages.some((page) => pathname.includes(page));
  };

  const navList: {
    label: string;
    icon: ReactNode;
    link: string;
    active?: boolean;
  }[] = [
    {
      label: "Beranda",
      icon: <HomeIcon className="size-7 -mb-0.5 fill-inherit" />,
      active: pathname === "/social-media",
      link: "/social-media",
    },
    {
      label: "Disukai",
      icon: <HeartIcon className="size-7 -mb-0.5 fill-inherit" />,
      active: pathname === "/social-media/liked",
      link: "/social-media/liked",
    },
    {
      label: "Notifikasi",
      icon: <BellIcon className="size-7 fill-inherit -mb-0.5" />,
      link: "/social-media/notification",
      active: pathname === "/social-media/notification",
    },
    {
      label: "Profile",
      icon: <UserIcon className="size-7 fill-inherit -mb-0.5" />,
      link: `/profile/${auth.id}`,
      active: pathname === `/profile/${auth.id}`,
    },
  ];

  return (
    !isNavHidden() && (
      <div className="flex z-[99] fixed w-full gap-4 justify-around items-end bottom-0 max-w-[478px] mx-auto shadow px-5 sm:px-9 py-3.5 bg-white border-y border-slate-300">
        {navList.map((list, i) => (
          <Link
            key={i}
            href={list.link}
            className="flex flex-col items-center relative"
          >
            <span
              className={clsx(
                list.active ? "fill-[#009788]" : "fill-slate-400",
              )}
            >
              {list.icon}
            </span>
            <span
              className={clsx(
                "text-xs mt-1",
                list.active ? "text-black" : "text-slate-500",
              )}
            >
              {list.label}
            </span>
          </Link>
        ))}
      </div>
    )
  );
}