"use client";

import Link from "next/link";
import { EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function GettingStarted() {
  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #007E51 0%, #005738 50%, #242424 100%)"
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-2 px-6">
        <img 
          src="/img/icon_masjid.png" 
          alt="Masjid" 
          className="w-24 h-24 object-contain"
        />
        <p className="text-white text-center text-lg font-bold">
          Assalamualaikum,
        </p>
        <p className="text-white text-center text-base">
          Selamat datang di <span className="font-semibold">AGPAII</span> 🌙
        </p>
      </div>

      {/* Image Tasbih - Positioned at right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none top-[370px]">
        <img 
          src="/img/ilustrasi_tasbih.png" 
          alt="Tasbih" 
          className="w-[340px] h-auto object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 top-[220px]">
        <p className="text-white text-center text-base mb-2 px-4">
          Buat akun Anda untuk menyimpan pengajaran
        </p>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-2">
          <Link
            href="/auth/login/email"
            className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-full bg-[#00DB81] text-black font-medium hover:bg-[#00c573] transition"
          >
            <EnvelopeIcon className="w-6 h-6" />
            <span>Lanjut dengan Email</span>
          </Link>

          <Link
            href="/auth/login/nik"
            className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-full bg-[#FDFDFD] text-black font-medium hover:bg-gray-100 transition"
          >
            <IdentificationIcon className="w-6 h-6" />
            <span>Lanjut dengan NIK</span>
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-8 pt-4">
        <p className="text-white text-center text-xs leading-relaxed">
          Dengan membuat akun di <span className="font-semibold">AGPAII Digital</span>, Anda setuju dengan{" "}
          <span className="font-semibold">Syarat dan Ketentuan</span> serta{" "}
          <span className="font-semibold">Kebijakan Privasi</span>
        </p>
      </div>
    </div>
  );
}
