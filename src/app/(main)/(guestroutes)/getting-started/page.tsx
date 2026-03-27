"use client";
import Link from "next/link";
import { EnvelopeIcon, IdentificationIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function GettingStarted() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ============================================= */}
      {/* MOBILE VIEW — Original (unchanged)            */}
      {/* ============================================= */}
      <div
        className="flex flex-col flex-1 overflow-hidden md:hidden"
        style={{
          background: "linear-gradient(180deg, #007E51 0%, #005738 50%, #242424 100%)",
        }}
      >
        <motion.div
          className="flex flex-col items-center pt-10 pb-8 px-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src="/img/agpai-logo.png" alt="AGPAII Logo" className="w-20 h-20 object-contain" />
          <p className="text-white text-center text-2xl font-bold mt-4 mb-2">Assalamualaikum,</p>
          <p className="text-white text-center text-lg px-4">
            Selamat datang di <span className="font-semibold">AGPAII Digital</span> 🌙
          </p>
        </motion.div>

        <div className="flex justify-center items-center py-4 flex-shrink-0">
          <motion.div
            className="w-[340px] max-w-[90vw]"
            initial={{ x: 0, y: 100, opacity: 0 }}
            animate={{ x: 0, y: [0, -12, 0], opacity: 1 }}
            transition={{
              x: { duration: 0.8, ease: "easeOut" },
              y: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 0.8 },
              opacity: { duration: 0.8, ease: "easeOut" },
            }}
          >
            <img src="/img/bg.png" alt="Background" className="w-full h-auto object-contain" />
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col items-center justify-center px-5 pb-10 pt-2 flex-1 -mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <div className="w-full max-w-sm space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Link href="/auth/login/email" className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-full bg-[#00DB81] text-white text-base font-semibold hover:bg-[#00c573] transition shadow-lg">
                <EnvelopeIcon className="w-6 h-6 flex-shrink-0" />
                <span>Login dengan email</span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Link href="/auth/login/nik" className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-full bg-[#FDFDFD] text-black text-base font-semibold hover:bg-gray-100 transition shadow-lg">
                <IdentificationIcon className="w-6 h-6 flex-shrink-0" />
                <span>Login dengan NIK</span>
              </Link>
            </motion.div>
            <motion.div className="flex items-center gap-4 py-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="text-white/80 font-medium text-sm">OR</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
              <Link href="/auth/register" className="block w-full py-4 bg-[#01925B] text-white rounded-full text-base font-semibold text-center hover:bg-[#1a1a1a] transition shadow-lg">
                Daftar Akun
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ============================================= */}
      {/* DESKTOP VIEW — Premium Redesign               */}
      {/* ============================================= */}
      <div className="hidden md:flex w-full min-h-screen">
        {/* ---- LEFT PANEL: Immersive Branding ---- */}
        <div className="w-[55%] lg:w-[52%] relative overflow-hidden flex flex-col"
          style={{ background: "linear-gradient(145deg, #004D40 0%, #00695C 35%, #00897B 70%, #26A69A 100%)" }}
        >
          {/* Animated mesh background */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                                radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          
          {/* Large decorative blobs */}
          <motion.div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,219,129,0.12) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1 p-10 lg:p-14 xl:p-16">
            {/* Top: Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/img/agpai-logo.png" alt="AGPAII Logo" className="w-14 h-14 lg:w-16 lg:h-16 object-contain drop-shadow-xl" />
              <div>
                <p className="text-white/90 font-bold text-lg tracking-tight">AGPAII</p>
                <p className="text-white/50 text-xs tracking-widest uppercase">Digital Platform</p>
              </div>
            </motion.div>

            {/* Center: Hero copy */}
            <div className="flex-1 flex flex-col -mb-10 justify-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-emerald-300/80 text-sm font-semibold tracking-widest uppercase mb-4">
                  Assalamualaikum Warahmatullahi Wabarakatuh
                </p>
                <h1 className="text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white leading-[1.15] tracking-tight">
                  Portal AGPAII Digital <br />
                  <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                    Asosiasi Guru PAI Indonesia
                  </span>
                </h1>
              </motion.div>

              {/* Feature highlights */}
              <motion.div
                className="mt-18 lg:mt-20 -mb-10 grid grid-cols-3 pb-10 gap-4 max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {[
                  { label: "KTA Digital", value: "Kartu Anggota" },
                  { label: "Modul Ajar", value: "Perangkat Guru" },
                  { label: "Sosial Media", value: "Komunitas PAI" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] rounded-2xl p-4 hover:bg-white/[0.12] transition-colors cursor-default"
                    whileHover={{ y: -2 }}
                  >
                    <p className="text-white font-bold text-sm">{item.label}</p>
                    <p className="text-white/40 text-xs mt-1">{item.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom: Stats */}
            <motion.div
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex -space-x-3">
                {["AG", "BL", "SI", "KT"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#004D40] flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${
                        ["#00BFA5", "#00897B", "#4DB6AC", "#26A69A"][i]
                      }, ${["#00897B", "#004D40", "#00695C", "#00796B"][i]})`,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-xl">10,000+</p>
                <p className="text-white/40 text-xs">Anggota Aktif Nasional</p>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div>
                <p className="text-white font-bold text-xl">34</p>
                <p className="text-white/40 text-xs">Provinsi</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---- RIGHT PANEL: Auth Actions ---- */}
        <div className="w-[45%] lg:w-[48%] bg-[#FAFBFC] flex flex-col justify-center relative">
          {/* Subtle decorative */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

          <div className="px-12 lg:px-16 xl:px-20 max-w-xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {/* Greeting */}
              <div className="mb-10 lg:mb-12">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Platform Aktif
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
                  Selamat Datang
                  <br />
                  <span className="text-slate-400 font-medium text-2xl lg:text-3xl">di AGPAII Digital</span>
                </h2>
                <p className="text-slate-500 mt-4 text-sm lg:text-[15px] leading-relaxed">
                  Pilih metode untuk melanjutkan ke aplikasi.
                </p>
              </div>

              {/* Auth Actions */}
              <div className="space-y-3.5">
                <Link
                  href="/auth/login"
                  className="group flex items-center justify-between w-full py-4 px-6 rounded-2xl bg-[#009788] text-white font-semibold hover:bg-[#00867a] transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">Masuk ke Akun</p>
                      <p className="text-[11px] text-white/60 font-normal">Login dengan email atau NIK</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/auth/register"
                  className="group flex items-center justify-between w-full py-4 px-6 rounded-2xl bg-white text-slate-700 font-semibold border-2 border-slate-200 hover:border-[#009788] hover:text-[#009788] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                      <IdentificationIcon className="w-5 h-5 text-slate-400 group-hover:text-[#009788] transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">Daftar Akun Baru</p>
                      <p className="text-[11px] text-slate-400 font-normal">Buat akun untuk bergabung</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-slate-300 group-hover:text-[#009788] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">atau langsung</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Quick Login Options */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login/email"
                  className="flex flex-col items-center gap-2 py-4 px-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <EnvelopeIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700 transition-colors">Login Email</span>
                </Link>
                <Link
                  href="/auth/login/nik"
                  className="flex flex-col items-center gap-2 py-4 px-4 rounded-2xl bg-white border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <IdentificationIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700 transition-colors">Login NIK</span>
                </Link>
              </div>

              {/* Footer hint */}
              <p className="text-center text-slate-400 text-xs mt-10 leading-relaxed">
                Dengan masuk, Anda menyetujui{" "}
                <span className="text-slate-500 hover:underline cursor-pointer">Syarat Ketentuan</span>
                {" "}dan{" "}
                <span className="text-slate-500 hover:underline cursor-pointer">Kebijakan Privasi</span> kami.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}