import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { HiOutlineSparkles } from "react-icons/hi";
import { MdMosque, MdCelebration } from "react-icons/md";
import { BsMegaphone } from "react-icons/bs";
import { FaShower, FaTshirt, FaUtensils, FaMoneyBillWave, FaHandshake } from "react-icons/fa";

const IdulFitriPage = () => {
  const takbir = {
    arabic: "اَللهُ أَكْبَرُ اَللهُ أَكْبَرُ اَللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ، اَللهُ أَكْبَرُ اَللهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ",
    latin: "Allāhu akbar Allāhu akbar Allāhu akbar, lā ilāha illallāh, Allāhu akbar Allāhu akbar wa lillāhil ḥamd",
    arti: "Allah Maha Besar (3x). Tiada tuhan selain Allah. Allah Maha Besar (2x). Segala puji bagi Allah."
  };

  const niat = {
    arabic: "أُصَلِّي سُنَّةَ الْعِيدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
    latin: "Ushallī sunnatil 'īdi rak'ataini lillāhi ta'ālā",
    arti: "Aku niat sholat sunnah Idul Fitri dua rakaat karena Allah Ta'ala."
  };

  const tataCara = [
    "Niat sholat Id dalam hati",
    "Takbiratul ihram",
    "Takbir 7 kali pada rakaat pertama",
    "Membaca Al-Fatihah dan surat Al-A'la",
    "Rukuk, i'tidal, sujud seperti biasa",
    "Takbir 5 kali pada rakaat kedua",
    "Membaca Al-Fatihah dan surat Al-Ghasyiyah",
    "Tasyahud akhir dan salam",
    "Mendengarkan khutbah"
  ];

  const sunnah = [
    { text: "Mandi sebelum berangkat", icon: <FaShower className="w-5 h-5 text-teal-600" /> },
    { text: "Memakai pakaian terbaik", icon: <FaTshirt className="w-5 h-5 text-blue-600" /> },
    { text: "Makan sebelum sholat", icon: <FaUtensils className="w-5 h-5 text-orange-600" /> },
    { text: "Membayar zakat fitrah", icon: <FaMoneyBillWave className="w-5 h-5 text-green-600" /> },
    { text: "Bertakbir sepanjang jalan", icon: <BsMegaphone className="w-5 h-5 text-amber-600" /> },
    { text: "Bersilaturahmi", icon: <FaHandshake className="w-5 h-5 text-pink-600" /> },
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Panduan Idul Fitri</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white shadow-lg text-center">
          <MdCelebration className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-2">Panduan Idul Fitri</h1>
          <p className="text-amber-50 text-sm">Hari Kemenangan Umat Islam</p>
        </div>

        {/* Takbir */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border-2 border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BsMegaphone className="w-5 h-5" /> Takbir Idul Fitri
          </h2>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">{takbir.arabic}</p>
            <p className="text-gray-600 italic text-sm mb-2">{takbir.latin}</p>
            <p className="text-gray-700 text-sm">{takbir.arti}</p>
          </div>
        </div>

        {/* Sunnah */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><HiOutlineSparkles className="w-5 h-5 text-amber-500" /> Sunnah Hari Raya</h2>
          <div className="grid grid-cols-2 gap-3">
            {sunnah.map((item, i) => (
              <div key={i} className="bg-teal-50 rounded-xl p-3 flex items-center gap-3">
                {item.icon}
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Niat & Tata Cara */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><MdMosque className="w-5 h-5 text-teal-600" /> Sholat Idul Fitri</h2>
          
          <div className="bg-emerald-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-emerald-800 mb-2">Niat</h4>
            <p className="font-arabic text-right text-lg text-gray-800 mb-2">{niat.arabic}</p>
            <p className="text-gray-600 italic text-sm">{niat.latin}</p>
            <p className="text-gray-700 text-sm mt-1">{niat.arti}</p>
          </div>

          <h4 className="font-semibold text-gray-800 mb-2">Tata Cara</h4>
          <ol className="space-y-2">
            {tataCara.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{i+1}</span>
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Ucapan */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center mb-6">
          <p className="font-arabic text-3xl mb-2">تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ</p>
          <p className="text-sm opacity-90">Semoga Allah menerima amal dari kami dan kalian</p>
          <p className="text-lg font-bold mt-3">Selamat Hari Raya Idul Fitri</p>
          <p className="text-sm">Mohon Maaf Lahir dan Batin</p>
        </div>
      </div>
    </div>
  );
};

export default IdulFitriPage;
