"use client";

import Link from "next/link";
import { EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function GettingStarted() {
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #007E51 0%, #005738 50%, #242424 100%)"
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6">
        <img 
          src="/img/agpai-logo.png" 
          alt="Masjid" 
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
        <p className="text-white text-center text-base sm:text-lg font-bold mt-2">
          Assalamualaikum,
        </p>
        <p className="text-white text-center text-sm sm:text-base">
          Selamat datang di <span className="font-semibold">AGPAII</span> 🌙
        </p>
      </div>

      {/* Image Tasbih */}
      <div className="flex justify-end items-center py-2 sm:py-4 pr-0">
        <div className="w-[240px] sm:w-[260px] md:w-[300px]">
          <img 
            src="/img/ilustrasi_tasbih.png" 
            alt="Tasbih" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pb-8 pt-4 sm:pt-6">
        <p className="text-white text-center text-sm sm:text-base mb-6 sm:mb-8 px-2 max-w-md">
          Buat akun Anda untuk menyimpan pengajaran
        </p>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3 sm:space-y-4">
          <Link
            href="/auth/login/email"
            className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-full bg-[#00DB81] text-white text-sm sm:text-base font-medium hover:bg-[#00c573] transition shadow-lg"
          >
            <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span>Lanjut dengan Email</span>
          </Link>

          <Link
            href="/auth/login/nik"
            className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-full bg-[#FDFDFD] text-black text-sm sm:text-base font-medium hover:bg-gray-100 transition shadow-lg"
          >
            <IdentificationIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span>Lanjut dengan NIK</span>
          </Link>

          {/* OR Divider */}
          <div className="flex items-center gap-3 sm:gap-4 py-2">
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="text-white/80 font-medium text-sm">OR</span>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full py-3 sm:py-3.5 bg-[#2C2C2C] text-white text-sm sm:text-base font-medium rounded-full text-center hover:bg-[#1a1a1a] transition shadow-lg"
          >
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
