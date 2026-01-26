import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons  
import { FiSunrise } from "react-icons/fi";
import { FaPrayingHands, FaUtensils, FaGem } from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineClock } from "react-icons/hi";
import { BsStarFill } from "react-icons/bs";

const doaSahurData = {
  doaNiatSahur: {
    title: "Doa Niat Sahur",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هٰذِهِ السَّنَةِ لِلّٰهِ تَعَالَى",
    latin: "Nawaitu shauma ghadin 'an adā'i fardhi syahri ramadhāna hādzihis sanati lillāhi ta'ālā",
    arti: "Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala."
  },
  doaSebelumMakan: {
    title: "Doa Sebelum Makan",
    arabic: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ",
    latin: "Bismillāhi wa 'alā barakatillāh",
    arti: "Dengan nama Allah dan dengan berkah Allah."
  },
  doaSetelahMakan: {
    title: "Doa Setelah Makan",
    arabic: "الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ",
    latin: "Alḥamdulillāhil ladzī ath'amanā wa saqānā wa ja'alanā minal muslimīn",
    arti: "Segala puji bagi Allah yang telah memberi kami makan dan minum dan menjadikan kami orang-orang Islam."
  },
  keutamaanSahur: [
    {
      title: "Berkah Sahur",
      description: "Sahur mengandung keberkahan yang besar",
      dalil: "Bersahurlah kalian, karena dalam sahur itu ada keberkahan. (HR. Bukhari & Muslim)",
      icon: "✨"
    },
    {
      title: "Pembeda dengan Ahli Kitab",
      description: "Sahur menjadi pembeda puasa kita dengan Ahli Kitab",
      dalil: "Pemisah antara puasa kita dan puasa Ahli Kitab adalah sahur. (HR. Muslim)",
      icon: "🌟"
    },
    {
      title: "Allah dan Malaikat Bershalawat",
      description: "Allah dan para malaikat bershalawat kepada orang yang sahur",
      dalil: "Sesungguhnya Allah dan para malaikat-Nya bershalawat kepada orang-orang yang sahur. (HR. Ahmad)",
      icon: "👼"
    },
    {
      title: "Menguatkan untuk Berpuasa",
      description: "Sahur memberikan kekuatan untuk menjalani puasa",
      dalil: "Bantulah dirimu untuk (puasa) siang hari dengan makanan sahur. (HR. Ibnu Majah)",
      icon: "💪"
    },
  ],
  sunnahSahur: [
    {
      title: "Mengakhirkan Sahur",
      description: "Sahur di akhir waktu sebelum imsak lebih utama",
      icon: "⏰"
    },
    {
      title: "Sahur Walau Seteguk Air",
      description: "Jika tidak sempat makan, sahur walau hanya dengan air",
      icon: "💧"
    },
    {
      title: "Makan dengan Tenang",
      description: "Tidak terburu-buru saat makan sahur",
      icon: "🍽️"
    },
    {
      title: "Berhenti Sebelum Adzan Subuh",
      description: "Menghentikan makan sebelum waktu imsak/adzan Subuh",
      icon: "🛑"
    },
    {
      title: "Memperbanyak Doa",
      description: "Waktu sepertiga malam terakhir adalah waktu mustajab",
      icon: "🤲"
    },
    {
      title: "Sholat Tahajud",
      description: "Jika mampu, bangun lebih awal untuk tahajud",
      icon: "🕌"
    },
  ],
  makananSahur: [
    { nama: "Kurma", manfaat: "Energi cepat, mengenyangkan", icon: "🌴" },
    { nama: "Nasi/Karbohidrat", manfaat: "Sumber energi tahan lama", icon: "🍚" },
    { nama: "Telur", manfaat: "Protein tinggi, mengenyangkan", icon: "🥚" },
    { nama: "Buah-buahan", manfaat: "Vitamin dan serat", icon: "🍌" },
    { nama: "Air Putih", manfaat: "Mencegah dehidrasi", icon: "💧" },
    { nama: "Sayuran", manfaat: "Serat dan nutrisi", icon: "🥬" },
  ],
  doaTahajudSahur: {
    title: "Doa Sayyidul Istighfar (Dibaca Saat Sahur)",
    arabic: "اَللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    latin: "Allāhumma anta rabbī lā ilāha illā anta khalaqtanī wa ana 'abduka wa ana 'alā 'ahdika wa wa'dika mastatha'tu a'ūdzubika min syarri mā shana'tu abū'u laka bini'matika 'alayya wa abū'u bidzanbī faghfirlī fa innahu lā yaghfirudz dzunūba illā anta",
    arti: "Ya Allah, Engkau adalah Tuhanku, tidak ada tuhan yang berhak disembah kecuali Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku, sesungguhnya tidak ada yang dapat mengampuni dosa kecuali Engkau.",
    source: "HR. Bukhari"
  },
  waktuSahur: {
    title: "Waktu Sahur",
    description: "Sahur dilakukan setelah tengah malam hingga sebelum adzan Subuh (waktu imsak). Waktu paling utama adalah di sepertiga malam terakhir.",
    tips: [
      "Pasang alarm untuk bangun sahur",
      "Persiapkan makanan sahur sebelum tidur",
      "Jangan langsung tidur setelah sahur, lanjutkan dengan sholat Subuh",
      "Manfaatkan waktu sepertiga malam terakhir untuk tahajud dan istighfar"
    ]
  }
};

const DoaSahurPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Doa Sahur</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[80px] opacity-20">🌙</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <FiSunrise className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Doa & Panduan Sahur</h1>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Kumpulan doa saat sahur dan sunnah-sunnah yang dianjurkan
            </p>
          </div>
        </div>

        {/* Doa Niat Sahur/Puasa */}
        <div className="mb-5 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-indigo-200">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPrayingHands className="w-5 h-5" />
              {doaSahurData.doaNiatSahur.title}
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5">
              <p className="font-arabic text-right text-2xl mb-4 leading-loose text-gray-800">
                {doaSahurData.doaNiatSahur.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-3">
                {doaSahurData.doaNiatSahur.latin}
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-700">
                  <span className="font-bold">Artinya:</span> {doaSahurData.doaNiatSahur.arti}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Doa Makan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Doa Sebelum Makan */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3">
              <h3 className="text-lg font-bold text-white">{doaSahurData.doaSebelumMakan.title}</h3>
            </div>
            <div className="p-4">
              <p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
                {doaSahurData.doaSebelumMakan.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-2">{doaSahurData.doaSebelumMakan.latin}</p>
              <p className="text-gray-700 text-sm">{doaSahurData.doaSebelumMakan.arti}</p>
            </div>
          </div>

          {/* Doa Setelah Makan */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
              <h3 className="text-lg font-bold text-white">{doaSahurData.doaSetelahMakan.title}</h3>
            </div>
            <div className="p-4">
              <p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
                {doaSahurData.doaSetelahMakan.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-2">{doaSahurData.doaSetelahMakan.latin}</p>
              <p className="text-gray-700 text-sm">{doaSahurData.doaSetelahMakan.arti}</p>
            </div>
          </div>
        </div>

        {/* Keutamaan Sahur */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsStarFill className="w-5 h-5" />
              Keutamaan Sahur
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {doaSahurData.keutamaanSahur.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-800 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                    <p className="text-xs text-gray-600 italic bg-white p-2 rounded-lg">
                      "{item.dalil}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sunnah Sahur */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5" />
              Sunnah Saat Sahur
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {doaSahurData.sunnahSahur.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 text-center">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <h4 className="font-bold text-teal-800 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Makanan Sahur */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUtensils className="w-5 h-5" />
              Rekomendasi Makanan Sahur
            </h2>
          </div>
          <div className="p-5 grid grid-cols-3 md:grid-cols-6 gap-3">
            {doaSahurData.makananSahur.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                <span className="text-2xl block mb-1">{item.icon}</span>
                <h4 className="font-bold text-green-800 text-xs">{item.nama}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Doa Sayyidul Istighfar */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaGem className="w-5 h-5" />
              {doaSahurData.doaTahajudSahur.title}
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="font-arabic text-right text-xl mb-3 leading-loose text-gray-800">
                {doaSahurData.doaTahajudSahur.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-3">
                {doaSahurData.doaTahajudSahur.latin}
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold">Artinya:</span> {doaSahurData.doaTahajudSahur.arti}
                </p>
              </div>
            </div>
            <p className="text-purple-600 text-xs font-semibold mt-3 text-center">
              📖 {doaSahurData.doaTahajudSahur.source}
            </p>
          </div>
        </div>

        {/* Tips Waktu Sahur */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5" />
            {doaSahurData.waktuSahur.title}
          </h3>
          <p className="text-sm text-gray-700 mb-4">{doaSahurData.waktuSahur.description}</p>
          <div className="space-y-2">
            {doaSahurData.waktuSahur.tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                <span className="text-blue-500">💡</span>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga sahur kita diberkahi oleh Allah SWT
          </p>
          <p className="text-indigo-600 font-semibold mt-2 font-arabic text-lg">
            بَارَكَ اللهُ لَنَا فِي سُحُورِنَا
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            (Semoga Allah memberkahi sahur kita)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoaSahurPage;
