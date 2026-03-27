"use client";
import Link from "next/link";
import { EnvelopeIcon, IdentificationIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";

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
              <Link href="/auth/login" className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-full bg-[#00DB81] text-white text-base font-semibold hover:bg-[#00c573] transition shadow-lg">
                <EnvelopeIcon className="w-6 h-6 flex-shrink-0" />
                <span>Masuk ke Akun</span>
              </Link>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
              <Link href="/auth/register" className="block w-full py-4 bg-[#01925B] text-white rounded-full text-base font-semibold text-center hover:bg-[#1a1a1a] transition shadow-lg">
                Daftar Akun Baru
              </Link>
            </motion.div>

            <motion.div className="flex items-center gap-4 py-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="text-white/80 font-medium text-sm">OR</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
              <a 
                href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Ada kendala? Hubungi Admin</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ============================================= */}
      {/* DESKTOP VIEW — Premium Redesign               */}
      {/* ============================================= */}
      <div className="hidden md:flex w-full min-h-screen">
        {/* ---- LEFT PANEL: Immersive Branding ---- */}
        <AuthBrandingPanel />

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
              <div className="mb-10 lg:mb-12 text-center md:text-left">
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

              {/* Hubungi Admin Section */}
              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-sm text-slate-400 text-center mb-4 italic">Butuh bantuan pendaftaran?</p>
                <a 
                  href="https://api.whatsapp.com/send/?phone=628567854448&text=Assalamualaikum%20Admin%20AGPAII%2C%20saya%20ingin%20bertanya%20%3A&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  Hubungi Admin AGPAII
                </a>
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