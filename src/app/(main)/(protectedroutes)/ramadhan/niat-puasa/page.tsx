import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { GiPrayerBeads } from "react-icons/gi";
import { BsStarFill, BsMoonStarsFill } from "react-icons/bs";
import { HiOutlineClipboardList, HiOutlineInformationCircle } from "react-icons/hi";

const niatPuasaData = {
  niatRamadhan: {
    title: "Niat Puasa Ramadhan",
    waktu: "Dibaca pada malam hari sebelum fajar (sebelum tidur atau saat sahur)",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هٰذِهِ السَّنَةِ لِلّٰهِ تَعَالَى",
    latin: "Nawaitu shauma ghadin 'an adā'i fardhi syahri ramadhāna hādzihis sanati lillāhi ta'ālā",
    arti: "Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala.",
    catatan: "Niat puasa Ramadhan harus dilakukan pada malam hari sebelum fajar. Jika tidak berniat sebelum fajar, maka puasanya tidak sah."
  },
  niatQadha: {
    title: "Niat Puasa Qadha (Ganti)",
    waktu: "Dibaca pada malam hari sebelum fajar",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ قَضَاءِ فَرْضِ شَهْرِ رَمَضَانَ لِلّٰهِ تَعَالَى",
    latin: "Nawaitu shauma ghadin 'an qadhā'i fardhi syahri ramadhāna lillāhi ta'ālā",
    arti: "Aku berniat puasa esok hari untuk mengganti kewajiban puasa bulan Ramadhan karena Allah Ta'ala.",
    catatan: "Puasa qadha wajib dilakukan bagi yang meninggalkan puasa Ramadhan dengan uzur syar'i seperti sakit, bepergian, haid, atau nifas."
  },
  niatNadzar: {
    title: "Niat Puasa Nadzar",
    waktu: "Dibaca pada malam hari sebelum fajar",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ وَفَاءً بِالنَّذْرِ لِلّٰهِ تَعَالَى",
    latin: "Nawaitu shauma ghadin wafā'an binnadzri lillāhi ta'ālā",
    arti: "Aku berniat puasa esok hari untuk memenuhi nadzar karena Allah Ta'ala.",
    catatan: "Puasa nadzar wajib dipenuhi bagi yang telah bernadzar untuk berpuasa."
  },
  niatKaffarah: {
    title: "Niat Puasa Kaffarah",
    waktu: "Dibaca pada malam hari sebelum fajar",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ كَفَّارَةِ الْيَمِينِ لِلّٰهِ تَعَالَى",
    latin: "Nawaitu shauma ghadin 'an kaffāratil yamīni lillāhi ta'ālā",
    arti: "Aku berniat puasa esok hari sebagai kaffarah karena Allah Ta'ala.",
    catatan: "Puasa kaffarah dilakukan sebagai pengganti atas pelanggaran sumpah atau dosa tertentu yang memerlukan kaffarah."
  },
  puasaSunnah: [
    {
      nama: "Puasa Senin Kamis",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةَ يَوْمِ الْإِثْنَيْنِ / الْخَمِيسِ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnata yaumil itsnayni/al-khamīsi lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah hari Senin/Kamis esok hari karena Allah Ta'ala.",
      keutamaan: "Amalan-amalan diangkat pada hari ini"
    },
    {
      nama: "Puasa Arafah (9 Dzulhijjah)",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةَ يَوْمِ عَرَفَةَ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnata yaumi 'arafata lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah hari Arafah esok hari karena Allah Ta'ala.",
      keutamaan: "Menghapus dosa setahun sebelum dan sesudahnya"
    },
    {
      nama: "Puasa Asyura (10 Muharram)",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةَ يَوْمِ عَاشُورَاءَ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnata yaumi 'āsyūrā'a lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah hari Asyura esok hari karena Allah Ta'ala.",
      keutamaan: "Menghapus dosa setahun yang lalu"
    },
    {
      nama: "Puasa Ayyamul Bidh (13, 14, 15 Hijriyah)",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةَ أَيَّامِ الْبِيضِ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnata ayyāmil bīdhi lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah Ayyamul Bidh esok hari karena Allah Ta'ala.",
      keutamaan: "Seperti berpuasa sepanjang masa"
    },
    {
      nama: "Puasa 6 Hari di Bulan Syawal",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةً سِتَّةَ أَيَّامٍ مِنْ شَوَّالٍ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnatan sittata ayyāmin min syawwālin lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah 6 hari dari bulan Syawal esok hari karena Allah Ta'ala.",
      keutamaan: "Seperti berpuasa setahun penuh"
    },
    {
      nama: "Puasa Daud",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ سُنَّةَ صَوْمِ دَاوُدَ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin sunnata shaumi dāwuda lillāhi ta'ālā",
      arti: "Aku berniat puasa sunnah Daud esok hari karena Allah Ta'ala.",
      keutamaan: "Puasa sehari dan berbuka sehari (puasa paling utama)"
    },
  ],
  ketentuan: [
    {
      title: "Waktu Niat",
      description: "Niat puasa wajib dilakukan pada malam hari (sebelum fajar). Sedangkan puasa sunnah boleh diniatkan di siang hari selama belum makan/minum."
    },
    {
      title: "Tempat Niat",
      description: "Niat cukup dalam hati saja. Melafalkan niat dengan lisan adalah sunnah menurut sebagian ulama."
    },
    {
      title: "Hukum Lupa Niat",
      description: "Jika lupa niat untuk puasa wajib, maka puasanya tidak sah dan wajib diqadha. Untuk puasa sunnah, masih bisa diniatkan di siang hari."
    },
  ]
};

const NiatPuasaPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Niat Puasa</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <GiPrayerBeads className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Niat-Niat Puasa</h1>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            Kumpulan niat puasa wajib dan sunnah lengkap dengan teks Arab, latin, dan artinya
          </p>
        </div>

        {/* Niat Puasa Ramadhan (Utama) */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border-2 border-teal-200">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsMoonStarsFill className="w-5 h-5" />
              {niatPuasaData.niatRamadhan.title}
            </h2>
            <p className="text-amber-100 text-xs mt-1">{niatPuasaData.niatRamadhan.waktu}</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
              <p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
                {niatPuasaData.niatRamadhan.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-2">
                {niatPuasaData.niatRamadhan.latin}
              </p>
              <p className="text-gray-700 text-sm font-medium">
                <span className="font-bold">Artinya:</span> {niatPuasaData.niatRamadhan.arti}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-2">
                <HiOutlineInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">{niatPuasaData.niatRamadhan.catatan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Niat Puasa Wajib Lainnya */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></span>
          Niat Puasa Wajib Lainnya
        </h2>

        {[niatPuasaData.niatQadha, niatPuasaData.niatNadzar, niatPuasaData.niatKaffarah].map((niat, index) => (
          <div key={index} className="mb-4 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-3">
              <h3 className="text-lg font-bold text-white">{niat.title}</h3>
              <p className="text-emerald-100 text-xs">{niat.waktu}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
                  {niat.arabic}
                </p>
                <p className="text-gray-600 italic text-sm mb-2">{niat.latin}</p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Artinya:</span> {niat.arti}
                </p>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                📌 {niat.catatan}
              </p>
            </div>
          </div>
        ))}

        {/* Niat Puasa Sunnah */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 mt-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          Niat Puasa Sunnah
        </h2>

        {niatPuasaData.puasaSunnah.map((puasa, index) => (
          <div key={index} className="mb-4 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3">
              <h3 className="text-lg font-bold text-white">{puasa.nama}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
                  {puasa.arabic}
                </p>
                <p className="text-gray-600 italic text-sm mb-2">{puasa.latin}</p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Artinya:</span> {puasa.arti}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                <BsStarFill className="w-4 h-4 text-amber-500" />
                <p className="text-sm text-amber-800 font-medium">{puasa.keutamaan}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Ketentuan */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            <HiOutlineClipboardList className="w-5 h-5" />
            Ketentuan Niat Puasa
          </h2>
          <div className="space-y-3">
            {niatPuasaData.ketentuan.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-blue-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga puasa kita diterima oleh Allah SWT
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ صِيَامَنَا وَصِيَامَكُمْ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            (Semoga Allah menerima puasa kami dan puasa kalian)
          </p>
        </div>
      </div>
    </div>
  );
};

export default NiatPuasaPage;
