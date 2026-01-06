"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState } from "react";

// React Icons
import { BsSunriseFill, BsSunsetFill, BsStarFill } from "react-icons/bs";
import { HiOutlineLightBulb, HiOutlineClock } from "react-icons/hi";
import { RiMoonClearFill } from "react-icons/ri";
import { GiPrayer } from "react-icons/gi";
import { FaChevronDown } from "react-icons/fa";

const dzikirData = {
  dzikirPagi: [
    {
      title: "Membaca Ayat Kursi",
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      count: "1x",
      keutamaan: "Dijaga oleh Allah hingga pagi/sore"
    },
    {
      title: "Membaca Surat Al-Ikhlas, Al-Falaq, An-Nas",
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ... (Al-Ikhlas)\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (Al-Falaq)\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ... (An-Nas)",
      count: "3x masing-masing",
      keutamaan: "Mencukupi dari segala sesuatu"
    },
    {
      title: "Doa Perlindungan Pagi",
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      latin: "Ashbahnā wa ashbahal mulku lillāh, walḥamdulillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syay'in qadīr",
      translation: "Kami memasuki waktu pagi dan kerajaan hanya milik Allah. Segala puji bagi Allah. Tidak ada tuhan yang berhak disembah kecuali Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian. Dia Maha Kuasa atas segala sesuatu.",
      count: "1x"
    },
    {
      title: "Doa Sayyidul Istighfar",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      latin: "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa ana 'abduk, wa ana 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūdzu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u bidzanbī faghfirlī fa innahu lā yaghfirudz dzunūba illā anta",
      translation: "Ya Allah, Engkau Tuhanku, tidak ada tuhan yang berhak disembah kecuali Engkau, Engkau menciptakanku dan aku adalah hamba-Mu...",
      count: "1x",
      keutamaan: "Jika meninggal hari itu masuk surga"
    },
    {
      title: "Tasbih, Tahmid, Tahlil, Takbir",
      arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
      latin: "Subḥānallāhi wa biḥamdih",
      translation: "Maha Suci Allah dan segala puji bagi-Nya",
      count: "100x",
      keutamaan: "Dihapus dosa walau sebanyak buih lautan"
    },
    {
      title: "Tahlil",
      arabic: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      latin: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syay'in qadīr",
      translation: "Tidak ada tuhan yang berhak disembah kecuali Allah semata, tidak ada sekutu bagi-Nya...",
      count: "10x atau 100x",
      keutamaan: "Seperti memerdekakan 4 budak dari keturunan Ismail"
    },
    {
      title: "Memohon Perlindungan",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
      latin: "Allāhumma innī as'alukal 'afwa wal 'āfiyata fid dunyā wal ākhirah",
      translation: "Ya Allah, aku memohon ampunan dan keselamatan di dunia dan akhirat",
      count: "1x"
    },
    {
      title: "Doa Mohon Kebaikan Hari Ini",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ",
      latin: "Allāhumma innī as'aluka khaira hādzal yaum fatḥahu wa naṣrahu wa nūrahu wa barakatahu wa hudāh",
      translation: "Ya Allah, aku memohon kebaikan hari ini, kemenangan, pertolongan, cahaya, keberkahan dan petunjuk-Nya",
      count: "1x"
    },
  ],
  dzikirPetang: [
    {
      title: "Membaca Ayat Kursi",
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
      count: "1x",
      keutamaan: "Dijaga oleh Allah hingga pagi"
    },
    {
      title: "Membaca Surat Al-Ikhlas, Al-Falaq, An-Nas",
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ..., قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..., قُلْ أَعُوذُ بِرَبِّ النَّاسِ...",
      count: "3x masing-masing",
      keutamaan: "Mencukupi dari segala sesuatu"
    },
    {
      title: "Doa Perlindungan Petang",
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      latin: "Amsaynā wa amsal mulku lillāh, walḥamdulillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syay'in qadīr",
      translation: "Kami memasuki waktu petang dan kerajaan hanya milik Allah...",
      count: "1x"
    },
    {
      title: "Memohon Perlindungan dari Kejahatan",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      latin: "A'ūdzu bikalimātillāhit tāmmāti min syarri mā khalaq",
      translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang Dia ciptakan",
      count: "3x",
      keutamaan: "Tidak ada sesuatu yang dapat membahayakannya malam itu"
    },
    {
      title: "Ridha Allah sebagai Tuhan",
      arabic: "رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا",
      latin: "Raḍītu billāhi rabban, wa bil islāmi dīnan, wa bimuḥammadin nabiyyan",
      translation: "Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad sebagai Nabi",
      count: "3x",
      keutamaan: "Allah pasti akan meridhainya"
    },
    {
      title: "Tasbih Petang",
      arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
      latin: "Subḥānallāhi wa biḥamdih",
      count: "100x"
    },
  ]
};

const DzikirPage = () => {
  const [activeTab, setActiveTab] = useState<"pagi" | "petang">("pagi");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const currentDzikir = activeTab === "pagi" ? dzikirData.dzikirPagi : dzikirData.dzikirPetang;

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Dzikir Pagi & Petang</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <GiPrayer className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Dzikir Pagi & Petang</h1>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            Dzikir pagi dibaca setelah sholat Subuh hingga terbit matahari. Dzikir petang dibaca setelah Ashar hingga Maghrib.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("pagi")}
              className={`py-4 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                activeTab === "pagi"
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BsSunriseFill className="w-5 h-5" />
              Dzikir Pagi
            </button>
            <button
              onClick={() => setActiveTab("petang")}
              className={`py-4 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                activeTab === "petang"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BsSunsetFill className="w-5 h-5" />
              Dzikir Petang
            </button>
          </div>
        </div>

        {/* Waktu Info */}
        <div className={`rounded-xl p-4 mb-4 ${
          activeTab === "pagi" 
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
            : "bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200"
        }`}>
          <div className="flex items-center gap-2">
            {activeTab === "pagi" ? <HiOutlineClock className="w-5 h-5 text-amber-600" /> : <RiMoonClearFill className="w-5 h-5 text-purple-600" />}
            <div>
              <h4 className={`font-bold text-sm ${activeTab === "pagi" ? "text-amber-800" : "text-purple-800"}`}>
                Waktu {activeTab === "pagi" ? "Pagi" : "Petang"}
              </h4>
              <p className="text-xs text-gray-600">
                {activeTab === "pagi" 
                  ? "Setelah sholat Subuh hingga terbit matahari" 
                  : "Setelah sholat Ashar hingga Maghrib"}
              </p>
            </div>
          </div>
        </div>

        {/* Dzikir List */}
        <div className="space-y-3">
          {currentDzikir.map((dzikir, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
            >
              {/* Header - Always visible */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-white ${
                    activeTab === "pagi" 
                      ? "bg-gradient-to-br from-amber-400 to-orange-500" 
                      : "bg-gradient-to-br from-purple-500 to-indigo-600"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">{dzikir.title}</h3>
                    <p className="text-xs text-gray-500">{dzikir.count}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Content - Expandable */}
              {expandedIndex === index && (
                <div className="px-5 pb-5 space-y-3">
                  {/* Arabic */}
                  <div className={`rounded-xl p-4 ${
                    activeTab === "pagi" 
                      ? "bg-gradient-to-br from-amber-50 to-orange-50" 
                      : "bg-gradient-to-br from-purple-50 to-indigo-50"
                  }`}>
                    <p className="font-arabic text-right text-xl leading-loose text-gray-800">
                      {dzikir.arabic}
                    </p>
                  </div>

                  {/* Latin */}
                  {dzikir.latin && (
                    <p className="text-gray-600 italic text-sm">
                      {dzikir.latin}
                    </p>
                  )}

                  {/* Translation */}
                  {dzikir.translation && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Artinya: </span>
                        {dzikir.translation}
                      </p>
                    </div>
                  )}

                  {/* Keutamaan */}
                  {dzikir.keutamaan && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      activeTab === "pagi" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      <BsStarFill className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm font-medium">{dzikir.keutamaan}</p>
                    </div>
                  )}

                  {/* Count Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      activeTab === "pagi" 
                        ? "bg-amber-500 text-white" 
                        : "bg-purple-500 text-white"
                    }`}>
                      Dibaca {dzikir.count}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Tips Istiqomah Dzikir
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-emerald-500">✓</span>
              Baca dengan tartil dan tadabbur (merenungkan maknanya)
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-emerald-500">✓</span>
              Konsisten setiap hari walau sedikit
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-emerald-500">✓</span>
              Gunakan tasbih atau counter untuk memudahkan
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-emerald-500">✓</span>
              Ajarkan kepada keluarga untuk diamalkan bersama
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga dzikir kita diterima oleh Allah SWT
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Ingatlah, hanya dengan mengingat Allah hati menjadi tentram" (QS. Ar-Ra'd: 28)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DzikirPage;
