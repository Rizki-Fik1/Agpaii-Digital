"use client";

import { motion } from "framer-motion";

export default function AuthBrandingPanel() {
  return (
    <div
      className="hidden md:flex w-[55%] lg:w-[52%] relative overflow-hidden flex-col min-h-screen flex-shrink-0"
      style={{ background: "linear-gradient(145deg, #004D40 0%, #00695C 35%, #00897B 70%, #26A69A 100%)" }}
    >
      {/* Animated mesh background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
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
          <img
            src="/img/agpai-logo.png"
            alt="AGPAII Logo"
            className="w-14 h-14 lg:w-16 lg:h-16 object-contain drop-shadow-xl"
          />
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
  );
}

