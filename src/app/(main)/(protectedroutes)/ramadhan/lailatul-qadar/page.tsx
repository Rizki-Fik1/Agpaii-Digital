import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { RiMoonClearFill } from "react-icons/ri";
import { BsStarFill, BsSearch } from "react-icons/bs";
import { HiOutlineBookOpen, HiOutlineSparkles } from "react-icons/hi";
import { FaPrayingHands } from "react-icons/fa";
import { GiCrystalBall } from "react-icons/gi";

const lailatulQadarData = {
  overview: {
    title: "Lailatul Qadar",
    subtitle: "Malam Seribu Bulan",
    description: "Lailatul Qadar adalah malam yang lebih baik dari seribu bulan. Malam ini terjadi pada salah satu malam ganjil di 10 hari terakhir bulan Ramadhan.",
  },
  keutamaan: [
    {
      title: "Lebih Baik dari 1000 Bulan",
      description: "Beribadah di malam ini lebih baik dari beribadah selama 1000 bulan (83 tahun lebih)",
      icon: "🌟"
    },
    {
      title: "Turunnya Al-Qur'an",
      description: "Al-Qur'an pertama kali diturunkan pada malam Lailatul Qadar",
      icon: "📖"
    },
    {
      title: "Malaikat Turun",
      description: "Para malaikat dan Jibril turun ke bumi dengan izin Allah",
      icon: "👼"
    },
    {
      title: "Malam Penuh Kedamaian",
      description: "Malam yang penuh kedamaian hingga terbit fajar",
      icon: "☮️"
    },
    {
      title: "Pengampunan Dosa",
      description: "Siapa yang menghidupkannya dengan iman dan ihtisab, diampuni dosanya",
      icon: "💝"
    },
  ],
  malamGanjil: [
    { malam: 21, hijri: "21 Ramadhan", estimasi: "19 Maret 2026*" },
    { malam: 23, hijri: "23 Ramadhan", estimasi: "21 Maret 2026*" },
    { malam: 25, hijri: "25 Ramadhan", estimasi: "23 Maret 2026*" },
    { malam: 27, hijri: "27 Ramadhan", estimasi: "25 Maret 2026*" },
    { malam: 29, hijri: "29 Ramadhan", estimasi: "27 Maret 2026*" },
  ],
  amalan: [
    {
      title: "Sholat Malam",
      description: "Perbanyak sholat tahajud dan tarawih",
      icon: "🕌"
    },
    {
      title: "Membaca Al-Qur'an",
      description: "Tadarus dan mentadabburi ayat-ayat Allah",
      icon: "📖"
    },
    {
      title: "Dzikir & Istighfar",
      description: "Memperbanyak dzikir dan memohon ampunan",
      icon: "📿"
    },
    {
      title: "Berdoa",
      description: "Memanjatkan doa-doa dengan khusyu",
      icon: "🤲"
    },
    {
      title: "I'tikaf",
      description: "Berdiam di masjid untuk fokus beribadah",
      icon: "🏠"
    },
    {
      title: "Sedekah",
      description: "Memperbanyak sedekah dan berbuat baik",
      icon: "💰"
    },
  ],
  doaLailatulQadar: {
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    latin: "Allāhumma innaka 'afuwwun tuḥibbul 'afwa fa'fu 'annī",
    arti: "Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai pemberian maaf, maka maafkanlah aku.",
    source: "HR. Tirmidzi, dari Aisyah RA"
  },
  tandaTanda: [
    "Malam yang tenang, tidak terlalu panas dan tidak terlalu dingin",
    "Bulan bersinar terang namun tidak menyilaukan",
    "Matahari terbit keesokan harinya tanpa sinar yang menyilaukan",
    "Malam yang penuh ketenangan dan kedamaian",
    "Hati terasa tentram dan khusyu dalam beribadah",
  ],
  dalilQuran: {
    surah: "Surat Al-Qadr (97:1-5)",
    arabic: "إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ﴿١﴾ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ﴿٢﴾ لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ ﴿٣﴾ تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ ﴿٤﴾ سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ ﴿٥﴾",
    translation: "Sesungguhnya Kami telah menurunkannya (Al-Qur'an) pada malam kemuliaan. Dan tahukah kamu apakah malam kemuliaan itu? Malam kemuliaan itu lebih baik dari seribu bulan. Pada malam itu turun malaikat-malaikat dan malaikat Jibril dengan izin Tuhannya untuk mengatur segala urusan. Malam itu (penuh) kesejahteraan sampai terbit fajar."
  },
  hadits: {
    arabic: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ",
    translation: "Carilah Lailatul Qadar pada malam-malam ganjil di sepuluh hari terakhir bulan Ramadhan.",
    source: "HR. Bukhari"
  }
};

const LailatulQadarPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Lailatul Qadar</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm rounded-3xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden border border-white/10">
          {/* Stars decoration */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 text-center">
            <RiMoonClearFill className="w-16 h-16 mx-auto mb-4 text-amber-300" />
            <h1 className="text-3xl font-bold mb-2">{lailatulQadarData.overview.title}</h1>
            <p className="text-purple-200 text-lg mb-4">{lailatulQadarData.overview.subtitle}</p>
            <p className="text-purple-100/80 text-sm max-w-lg mx-auto">
              {lailatulQadarData.overview.description}
            </p>
          </div>
        </div>

        {/* Surat Al-Qadr */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
          <h3 className="text-amber-300 font-bold mb-4 text-center">
            {lailatulQadarData.dalilQuran.surah}
          </h3>
          <p className="font-arabic text-right text-2xl leading-loose text-white mb-4">
            {lailatulQadarData.dalilQuran.arabic}
          </p>
          <p className="text-purple-200 text-sm italic text-center leading-relaxed">
            "{lailatulQadarData.dalilQuran.translation}"
          </p>
        </div>

        {/* Keutamaan */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BsStarFill className="w-5 h-5 text-amber-300" />
            Keutamaan Lailatul Qadar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lailatulQadarData.keutamaan.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                    <p className="text-purple-200 text-xs">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Malam Ganjil */}
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-amber-500/20">
          <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            <BsSearch className="w-5 h-5" />
            Malam-Malam Ganjil (10 Hari Terakhir)
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {lailatulQadarData.malamGanjil.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 text-center text-white"
              >
                <p className="text-2xl font-bold">{item.malam}</p>
                <p className="text-xs opacity-90">Ramadhan</p>
              </div>
            ))}
          </div>
          <p className="text-amber-200/70 text-xs mt-3 text-center">
            * Tanggal masehi adalah perkiraan untuk Ramadhan 1447H/2026
          </p>
        </div>

        {/* Hadits */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10">
          <h3 className="text-emerald-300 font-bold mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Hadits
          </h3>
          <p className="font-arabic text-right text-xl leading-loose text-white mb-3">
            {lailatulQadarData.hadits.arabic}
          </p>
          <p className="text-purple-200 text-sm italic mb-2">
            "{lailatulQadarData.hadits.translation}"
          </p>
          <p className="text-emerald-300 text-xs font-semibold">
            {lailatulQadarData.hadits.source}
          </p>
        </div>

        {/* Doa Lailatul Qadar */}
        <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
            <FaPrayingHands className="w-5 h-5" />
            Doa Lailatul Qadar
          </h2>
          <div className="bg-white/10 rounded-xl p-5 text-center">
            <p className="font-arabic text-3xl leading-loose text-white mb-4">
              {lailatulQadarData.doaLailatulQadar.arabic}
            </p>
            <p className="text-purple-200 italic mb-3">
              {lailatulQadarData.doaLailatulQadar.latin}
            </p>
            <p className="text-white text-sm mb-3">
              "{lailatulQadarData.doaLailatulQadar.arti}"
            </p>
            <p className="text-purple-300 text-xs">
              {lailatulQadarData.doaLailatulQadar.source}
            </p>
          </div>
        </div>

        {/* Amalan */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-emerald-300" />
            Amalan di Malam Lailatul Qadar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lailatulQadarData.amalan.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-teal-500/30 to-emerald-500/30 backdrop-blur-sm rounded-xl p-4 text-center border border-teal-500/20"
              >
                <span className="text-3xl mb-2 block">{item.icon}</span>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-emerald-200 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tanda-tanda */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <GiCrystalBall className="w-5 h-5 text-purple-300" />
            Tanda-Tanda Lailatul Qadar
          </h2>
          <ul className="space-y-3">
            {lailatulQadarData.tandaTanda.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-amber-400">✦</span>
                <span className="text-purple-200 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 mb-6">
          <p className="text-purple-200 text-sm mb-3">
            Semoga kita semua diberikan kesempatan untuk bertemu dengan malam Lailatul Qadar
          </p>
          <p className="text-amber-300 font-semibold text-lg font-arabic">
            اللَّهُمَّ بَلِّغْنَا لَيْلَةَ الْقَدْرِ
          </p>
          <p className="text-purple-300 text-xs mt-2 italic">
            "Ya Allah, sampaikan kami pada malam Lailatul Qadar"
          </p>
        </div>
      </div>
    </div>
  );
};

export default LailatulQadarPage;
