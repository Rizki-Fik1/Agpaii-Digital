"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const hiddenPage = ["/auth/password-reset/verify"];
  const pathname = usePathname();
  return !hiddenPage.includes(pathname) ? (
    <div className=" px-[5%] sm:px-6 min-h-screen">
      <Link
        href={
          pathname === "/auth/password-reset"
            ? "/auth/login/email"
            : "/auth/password-reset"
        }
        className="flex items-center gap-2 pt-4 justify-start w-full pb-6"
      >
        <ChevronLeftIcon className="size-4" />
        <h1 className="text-[0.9rem]">Kembali</h1>
      </Link>
      <div className="flex flex-col items-center pt-20">
        <h1 className="mt-6 text-xl font-semibold text-slate-700">
          Reset Password
        </h1>
        <div className="flex flex-col items-center mt-4">{children}</div>
      </div>
    </div>
  ) : (
    <>{children}</>
  );
}
