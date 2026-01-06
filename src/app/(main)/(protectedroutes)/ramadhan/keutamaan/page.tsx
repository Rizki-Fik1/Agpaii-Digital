import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { BsStarFill } from "react-icons/bs";
import { HiOutlineSparkles, HiOutlineLightBulb } from "react-icons/hi";

const keutamaanRamadhanData = {
  ayatQuran: [
    {
      surah: "QS. Al-Baqarah: 183",
      arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
      translation: "Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa."
    },
    {
      surah: "QS. Al-Baqarah: 185",
      arabic: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ",
      translation: "Bulan Ramadhan adalah (bulan) yang di dalamnya diturunkan Al-Qur'an sebagai petunjuk bagi manusia dan penjelasan-penjelasan mengenai petunjuk itu dan pembeda (antara yang benar dan yang batil)."
    },
  ],
  keutamaan: [
    {
      title: "Pintu Surga Dibuka, Pintu Neraka Ditutup",
      hadits: "Apabila bulan Ramadhan datang, maka pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan setan-setan dibelenggu.",
      source: "HR. Bukhari & Muslim",
      icon: "🚪"
    },
    {
      title: "Pengampunan Dosa",
      hadits: "Barangsiapa yang berpuasa Ramadhan dengan iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
      source: "HR. Bukhari & Muslim",
      icon: "💝"
    },
    {
      title: "Pahala Berlipat Ganda",
      hadits: "Setiap amal anak Adam akan dilipatgandakan, satu kebaikan menjadi sepuluh hingga tujuh ratus kali lipat.",
      source: "HR. Muslim",
      icon: "✨"
    },
    {
      title: "Malam Lailatul Qadar",
      hadits: "Barangsiapa yang mendirikan (shalat) Lailatul Qadar dengan iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
      source: "HR. Bukhari & Muslim",
      icon: "🌙"
    },
    {
      title: "Pintu Ar-Rayyan",
      hadits: "Sesungguhnya di surga ada pintu yang disebut Ar-Rayyan, yang masuk dari pintu itu hanyalah orang-orang yang berpuasa.",
      source: "HR. Bukhari & Muslim",
      icon: "🚪"
    },
    {
      title: "Doa Orang Puasa Mustajab",
      hadits: "Ada tiga orang yang tidak ditolak doanya: orang yang berpuasa hingga berbuka...",
      source: "HR. Tirmidzi",
      icon: "🤲"
    },
    {
      title: "Puasa Adalah Perisai",
      hadits: "Puasa adalah perisai, maka janganlah berkata kotor dan janganlah bertindak bodoh.",
      source: "HR. Bukhari",
      icon: "🛡️"
    },
    {
      title: "Dua Kegembiraan Orang Puasa",
      hadits: "Bagi orang yang berpuasa ada dua kegembiraan: kegembiraan saat berbuka dan kegembiraan saat bertemu Tuhannya.",
      source: "HR. Bukhari & Muslim",
      icon: "😊"
    },
  ],
  amalanUtama: [
    {
      amalan: "Puasa Ramadhan",
      keterangan: "Rukun Islam keempat, wajib bagi setiap muslim",
      icon: "🌙"
    },
    {
      amalan: "Sholat Tarawih",
      keterangan: "Sholat sunnah di malam Ramadhan",
      icon: "🕌"
    },
    {
      amalan: "Tadarus Al-Qur'an",
      keterangan: "Membaca dan mempelajari Al-Qur'an",
      icon: "📖"
    },
    {
      amalan: "Sedekah",
      keterangan: "Memperbanyak berbagi kepada sesama",
      icon: "💰"
    },
    {
      amalan: "I'tikaf",
      keterangan: "Berdiam di masjid untuk beribadah",
      icon: "🏠"
    },
    {
      amalan: "Mencari Lailatul Qadar",
      keterangan: "Di 10 malam terakhir Ramadhan",
      icon: "⭐"
    },
    {
      amalan: "Umrah",
      keterangan: "Umrah di Ramadhan setara pahala haji",
      icon: "🕋"
    },
    {
      amalan: "Memberi Makan Berbuka",
      keterangan: "Mendapat pahala seperti orang yang berpuasa",
      icon: "🍽️"
    },
  ],
  hikmahPuasa: [
    "Melatih kesabaran dan pengendalian diri",
    "Mensucikan jiwa dan membersihkan hati",
    "Menumbuhkan rasa empati kepada fakir miskin",
    "Meninggikan ketakwaan kepada Allah SWT",
    "Menyehatkan jasmani dan rohani",
    "Mempererat tali silaturahmi",
    "Melatih kedisiplinan dan manajemen waktu",
    "Meningkatkan kualitas ibadah"
  ],
  pembagianRamadhan: [
    {
      bagian: "10 Hari Pertama",
      tema: "Rahmat (Kasih Sayang Allah)",
      icon: "❤️"
    },
    {
      bagian: "10 Hari Kedua",
      tema: "Maghfirah (Pengampunan)",
      icon: "💝"
    },
    {
      bagian: "10 Hari Terakhir",
      tema: "Pembebasan dari Api Neraka",
      icon: "🔥"
    },
  ]
};

const KeutamaanPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Keutamaan Ramadhan</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg text-center">
          <BsStarFill className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-2">Keutamaan Ramadhan</h1>
          <p className="text-emerald-50 text-sm">
            Bulan penuh rahmat, ampunan, dan keberkahan
          </p>
        </div>

        {/* Ayat Al-Qur'an */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></span>
            Ayat Al-Qur'an tentang Ramadhan
          </h2>
          {keutamaanRamadhanData.ayatQuran.map((ayat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md p-5 mb-4 border border-gray-100">
              <p className="text-teal-600 text-sm font-semibold mb-2">{ayat.surah}</p>
              <p className="font-arabic text-right text-xl leading-[2] text-gray-800 mb-3">
                {ayat.arabic}
              </p>
              <p className="text-gray-700 text-sm italic">
                "{ayat.translation}"
              </p>
            </div>
          ))}
        </div>

        {/* Pembagian Ramadhan */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 mb-6 text-white">
          <h2 className="text-lg font-bold mb-4 text-center">Pembagian Bulan Ramadhan</h2>
          <div className="grid grid-cols-3 gap-3">
            {keutamaanRamadhanData.pembagianRamadhan.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <span className="text-2xl block mb-1">{item.icon}</span>
                <p className="text-sm font-semibold mb-1">{item.bagian}</p>
                <p className="text-xs opacity-90">{item.tema}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Keutamaan dari Hadits */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
            Keutamaan Ramadhan dalam Hadits
          </h2>
          <div className="space-y-3">
            {keutamaanRamadhanData.keutamaan.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-700 italic mb-2">"{item.hadits}"</p>
                    <p className="text-xs text-teal-600 font-semibold">{item.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amalan Utama */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5" />
              Amalan Utama di Bulan Ramadhan
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {keutamaanRamadhanData.amalanUtama.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 text-center border border-teal-100">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <h4 className="font-bold text-teal-800 text-sm mb-1">{item.amalan}</h4>
                <p className="text-xs text-gray-600">{item.keterangan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hikmah Puasa */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 mb-6">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Hikmah Berpuasa
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {keutamaanRamadhanData.hikmahPuasa.map((hikmah, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">{hikmah}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga kita dapat meraih keberkahan Ramadhan
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            اللَّهُمَّ بَلِّغْنَا رَمَضَانَ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Ya Allah, sampaikan kami pada bulan Ramadhan"
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeutamaanPage;
