"use client";

import { usePathname } from "next/navigation";
import { ReactNode, Suspense } from "react";

const pages = ["/dashboard"];

const includePages = (pathname: string) =>
  pages.some((path) => pathname.includes(path));

export default function MainLayout({ children }: { children: ReactNode }) {
  const p = usePathname();
  return !includePages(p) ? (
    <main className="max-w-[480px] border mx-auto min-h-screen relative border-slate-300">
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center"></div>
        }
      >
        {children}
      </Suspense>
    </main>
  ) : (
    <>{children}</>
  );
}
