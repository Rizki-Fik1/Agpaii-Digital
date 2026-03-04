"use client";

import { usePathname } from "next/navigation";
import { ReactNode, Suspense } from "react";
import DesktopSidebar from "@/components/nav/desktop_sidebar";

const excludedPages = ["/auth", "/getting-started", "/fetching"];

const isExcluded = (pathname: string) =>
  excludedPages.some((path) => pathname.startsWith(path));

export default function MainLayout({ children }: { children: ReactNode }) {
  const p = usePathname();
  
  return !isExcluded(p) ? (
    <main className="w-full min-h-screen md:bg-gray-50 md:pl-20 lg:pl-64 flex justify-center">
      {/* Sidebar Desktop (Tidak akan tampil jika layar hp atau GuestPage) */}
      <div className="hidden md:flex lg:w-64 md:w-20 fixed left-0 top-0 bottom-0 z-50">
        <DesktopSidebar className="w-full" />
      </div>

      {/* Konten Utama */}
      <div className="w-full max-w-[480px] md:max-w-none relative mx-auto bg-white md:bg-transparent min-h-screen md:border-x border-slate-200">
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center"></div>
          }
        >
          {children}
        </Suspense>
      </div>
    </main>
  ) : (
    <>{children}</>
  );
}
