"use client";
import Navigate from "@/components/navigator/navigate";
import { useAuth } from "@/utils/context/auth_context";
import {
  ArrowRightStartOnRectangleIcon,
  CloudIcon,
  CurrencyDollarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const menus = [
  {
    name: "Home",
    icon: <HomeIcon className="size-6 sm:max-lg:size-7" />,
    link: "/dashboard",
    active: (p: string) => p == "/dashboard",
  },
  {
    name: "Dokumen",
    icon: <CloudIcon className="size-6 sm:size-7" />,
    link: "/dashboard/cloud",
    active: (p: string) => p.includes("/dashboard/cloud"),
  },
  {
    name: "Mitra",
    icon: <CurrencyDollarIcon className="size-6 sm  :size-7" />,
    link: "/dashboard/partner",
    active: (p: string) => p.includes("/dashboard/partner"),
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();
  const p = usePathname();
  if (authLoading) return null;
  return auth && auth.role_id !== 1 ? (
    <Navigate to="/" />
  ) : (
    <>
      <div className="fixed bottom-0 left-0 max-sm:right-0 flex sm:flex-col sm:justify-start sm:max-lg:py-16 lg:py-12 justify-center gap-10 sm:gap-8 lg:gap-2 sm:top-0 px-4 py-3 lg:w-64 bg-[#009788] text-white z-[999] shadow-md">
        <Link
          href={"/dashboard"}
          className="max-lg:hidden font-semibold text-2xl mb-16 px-2 text-white"
        >
          Admin
        </Link>
        {menus.map((menu, i) => (
          <Link
            key={i}
            href={menu.link}
            className={clsx(
              "flex flex-col items-center  lg:gap-3  sm:flex-row px-3 py-1.5 rounded-md",
              menu.active(p)
                ? "bg-slate-100 text-[#009788] shadow-md"
                : "text-white"
            )}
          >
            <span>{menu.icon}</span>
            <h2 className="text-xs lg:text-base text-center sm:max-lg:hidden">
              {menu.name}
            </h2>
          </Link>
        ))}
        <Link
          className="flex gap-4 mt-auto px-3 max-lg:hidden text-white"
          href={"/"}
        >
          Back to Home
          <ArrowRightStartOnRectangleIcon className="size-6" />
        </Link>
      </div>
      <div className="sm:ml-[5.5rem] lg:ml-64">{children}</div>
    </>
  );
}
