"use client";

import Link from "next/link";
import { EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function GettingStarted() {
  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #007E51 0%, #005738 50%, #242424 100%)"
      }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col items-center pt-4 pb-6 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <img 
          src="/img/agpai-logo.png" 
          alt="Masjid" 
          className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
        />
        <p className="text-white text-center text-base sm:text-lg font-bold mt-1">
          Assalamualaikum,
        </p>
        <p className="text-white text-center text-sm sm:text-base">
          Selamat datang di <span className="font-semibold">AGPAII</span> 🌙
        </p>
      </motion.div>

      {/* Image Tasbih */}
      <div className="flex justify-end items-center py-0 pr-0 flex-shrink-0">
        <motion.div 
          className="w-[240px] sm:w-[200px] md:w-[240px]"
          initial={{ x: 100, y: 100, opacity: 0 }}
          animate={{ 
            x: 0, 
            y: [0, -15, 0],
            opacity: 1 
          }}
          transition={{
            x: { duration: 0.8, ease: "easeOut" },
            y: { 
              duration: 3, 
              ease: "easeInOut", 
              repeat: Infinity,
              delay: 0.8
            },
            opacity: { duration: 0.8, ease: "easeOut" }
          }}
        >
          <img 
            src="/img/ilustrasi_tasbih2.png" 
            alt="Tasbih" 
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-2 sm:pt-2 flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        <p className="text-white text-center text-xs sm:text-sm mb-2 sm:mb-4 px-2 max-w-md">
          Buat akun Anda untuk menyimpan pengajaran
        </p>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-2 sm:space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              href="/auth/login/email"
              className="flex items-center justify-center gap-2 w-full py-3 sm:py-3 px-4 sm:px-6 rounded-full bg-[#00DB81] text-white text-xs sm:text-sm font-medium hover:bg-[#00c573] transition shadow-lg"
            >
              <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Lanjut dengan Email</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              href="/auth/login/nik"
              className="flex items-center justify-center gap-2 w-full py-3 sm:py-3 px-4 sm:px-6 rounded-full bg-[#FDFDFD] text-black text-xs sm:text-sm font-medium hover:bg-gray-100 transition shadow-lg"
            >
              <IdentificationIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Lanjut dengan NIK</span>
            </Link>
          </motion.div>

          {/* OR Divider */}
          <motion.div 
            className="flex items-center gap-3 sm:gap-4 py-1 sm:py-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="text-white/80 font-medium text-xs sm:text-sm">OR</span>
            <div className="flex-1 h-px bg-white/30"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Link
              href="/auth/register"
              className="block w-full py-3 sm:py-3 bg-[#01925B] text-white rounded-full text-xs sm:text-sm font-medium rounded-f-full text-center hover:bg-[#1a1a1a] transition shadow-lg"
            >
              Daftar Akun
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
