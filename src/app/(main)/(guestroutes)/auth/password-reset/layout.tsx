"use client";

import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function PasswordResetLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const getBackLink = () => {
    if (pathname === "/auth/password-reset") return "/auth/login";
    return "/auth/password-reset";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Branding Panel - Desktop */}
      <AuthBrandingPanel />

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative overflow-hidden">
        {/* Top accent line - desktop */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        {/* Dynamic Mobile Header */}
        <div className="flex items-center gap-4 px-6 py-6 md:px-12 lg:px-16 xl:px-20 md:py-8">
          <button 
            onClick={() => router.push(getBackLink())} 
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors bg-white/50 md:bg-transparent shadow-sm md:shadow-none"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-700 md:text-xl md:font-semibold">
            {pathname.includes("verify") ? "Verifikasi OTP" : "Reset Password"}
          </h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
