import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { MdMosque } from "react-icons/md";
import { HiOutlineBookOpen, HiOutlineSparkles, HiOutlineClipboardList, HiOutlineLightBulb, HiOutlineCheckCircle } from "react-icons/hi";
import { BsStarFill, BsBarChartFill } from "react-icons/bs";
import { FaPrayingHands } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";

const itikafData = {
  overview: {
    title: "Panduan I'tikaf",
    description: "I'tikaf adalah berdiam diri di masjid dengan niat beribadah kepada Allah SWT. I'tikaf sangat dianjurkan terutama pada 10 hari terakhir Ramadhan untuk menanti malam Lailatul Qadar.",
  },
  keutamaan: [
    "Mendapatkan malam Lailatul Qadar",
    "Mendekatkan diri kepada Allah SWT",
    "Menyucikan jiwa dari hal-hal duniawi",
    "Memperbanyak ibadah di waktu paling mulia",
    "Mengikuti sunnah Rasulullah SAW",
  ],
  syarat: [
    {
      title: "Muslim",
      description: "I'tikaf hanya sah dilakukan oleh orang Islam"
    },
    {
      title: "Berakal",
      description: "Memiliki akal sehat dan sadar"
    },
    {
      title: "Niat",
      description: "Berniat i'tikaf dengan ikhlas karena Allah"
    },
    {
      title: "Di Masjid",
      description: "Dilakukan di dalam masjid, tidak di rumah"
    },
    {
      title: "Suci dari Hadats Besar",
      description: "Bagi wanita, harus suci dari haid dan nifas"
    },
  ],
  niat: {
    arabic: "نَوَيْتُ الْاِعْتِكَافَ فِي هَذَا الْمَسْجِدِ لِلّٰهِ تَعَالَى",
    latin: "Nawaitul i'tikāfa fī hādzal masjidi lillāhi ta'ālā",
    arti: "Aku berniat i'tikaf di masjid ini karena Allah Ta'ala"
  },
  jenisItikaf: [
    {
      jenis: "I'tikaf Wajib",
      keterangan: "I'tikaf yang dinazarkan, wajib ditunaikan"
    },
    {
      jenis: "I'tikaf Sunnah Muakkad",
      keterangan: "I'tikaf 10 hari terakhir Ramadhan (mengikuti sunnah Rasulullah)"
    },
    {
      jenis: "I'tikaf Sunnah Biasa",
      keterangan: "I'tikaf di luar waktu tersebut, minimal beberapa jam"
    },
  ],
  amalanItikaf: [
    { amalan: "Sholat Sunnah", icon: "🕌", description: "Tahajud, Dhuha, Rawatib" },
    { amalan: "Membaca Al-Qur'an", icon: "📖", description: "Tadarus dan tadabbur" },
    { amalan: "Dzikir", icon: "📿", description: "Tasbih, tahmid, takbir, tahlil" },
    { amalan: "Doa", icon: "🤲", description: "Berdoa dengan khusyu" },
    { amalan: "Istighfar", icon: "💝", description: "Memohon ampunan Allah" },
    { amalan: "Kajian", icon: "📚", description: "Mempelajari ilmu agama" },
  ],
  yangMembatalkan: [
    "Keluar dari masjid tanpa uzur syar'i",
    "Berhubungan suami istri",
    "Haid atau nifas bagi wanita",
    "Gila atau pingsan berkepanjangan",
    "Murtad (keluar dari Islam)",
  ],
  yangDibolehkan: [
    "Keluar untuk kebutuhan yang tidak bisa dihindari (buang air, wudhu)",
    "Keluar untuk mengambil makanan jika tidak ada yang membawakan",
    "Makan, minum, dan tidur di dalam masjid",
    "Berbicara seperlunya",
    "Keluar untuk sholat Jumat (wajib)",
  ],
  dalil: {
    arabic: "كَانَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَعْتَكِفُ الْعَشْرَ الْأَوَاخِرَ مِنْ رَمَضَانَ",
    translation: "Nabi shallallahu 'alaihi wasallam biasa beri'tikaf pada sepuluh hari terakhir bulan Ramadhan.",
    source: "HR. Bukhari & Muslim"
  },
  tips: [
    "Siapkan perlengkapan secukupnya (pakaian, keperluan mandi)",
    "Buat jadwal ibadah harian",
    "Minimalisir penggunaan gadget",
    "Fokus pada ibadah dan muhasabah diri",
    "Jaga adab di masjid dan sesama mu'takif",
    "Manfaatkan waktu sebaik mungkin",
  ]
};

const ItikafPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Panduan I'tikaf</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[80px] opacity-20">🏠</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <MdMosque className="w-8 h-8" />
              <h1 className="text-2xl font-bold">{itikafData.overview.title}</h1>
            </div>
            <p className="text-emerald-50 text-sm leading-relaxed">
              {itikafData.overview.description}
            </p>
          </div>
        </div>

        {/* Dalil */}
        <div className="mb-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Dalil
          </h3>
          <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">
            {itikafData.dalil.arabic}
          </p>
          <p className="text-gray-700 italic text-sm mb-2">
            "{itikafData.dalil.translation}"
          </p>
          <p className="text-emerald-600 text-xs font-semibold">
            {itikafData.dalil.source}
          </p>
        </div>

        {/* Keutamaan */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsStarFill className="w-5 h-5" />
              Keutamaan I'tikaf
            </h2>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {itikafData.keutamaan.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-1 flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Niat */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPrayingHands className="w-5 h-5" />
              Niat I'tikaf
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
              <p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
                {itikafData.niat.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-2">{itikafData.niat.latin}</p>
              <p className="text-gray-700 text-sm font-medium">{itikafData.niat.arti}</p>
            </div>
          </div>
        </div>

        {/* Syarat I'tikaf */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineClipboardList className="w-5 h-5" />
              Syarat I'tikaf
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {itikafData.syarat.map((item, index) => (
              <div key={index} className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis I'tikaf */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsBarChartFill className="w-5 h-5" />
              Jenis-Jenis I'tikaf
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {itikafData.jenisItikaf.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <h4 className="font-bold text-purple-800 mb-1">{item.jenis}</h4>
                <p className="text-sm text-gray-600">{item.keterangan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Amalan Saat I'tikaf */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5" />
              Amalan Saat I'tikaf
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {itikafData.amalanItikaf.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 text-center">
                <span className="text-3xl mb-2 block">{item.icon}</span>
                <h4 className="font-bold text-teal-800 text-sm mb-1">{item.amalan}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yang Membatalkan & Dibolehkan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Yang Membatalkan */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-5 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>❌</span>
                Yang Membatalkan
              </h2>
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {itikafData.yangMembatalkan.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 flex-shrink-0">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Yang Dibolehkan */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✅</span>
                Yang Dibolehkan
              </h2>
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {itikafData.yangDibolehkan.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 flex-shrink-0">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tips I'tikaf */}
        <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Tips Sukses I'tikaf
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {itikafData.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga panduan ini bermanfaat dalam melaksanakan ibadah i'tikaf
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            (Semoga Allah menerima amal dari kami dan dari kalian)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItikafPage;
