import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { MdMosque } from "react-icons/md";
import { BsMoonStarsFill, BsStarFill, BsListCheck } from "react-icons/bs";
import { HiOutlineBookOpen, HiOutlineLightBulb, HiOutlineClipboardList } from "react-icons/hi";
import { FaPrayingHands, FaChartBar } from "react-icons/fa";
import { RiMoonClearFill } from "react-icons/ri";

const tarawihData = {
  overview: {
    title: "Panduan Sholat Tarawih",
    description: "Sholat Tarawih adalah sholat sunnah yang dikerjakan pada malam bulan Ramadhan setelah sholat Isya'. Tarawih berasal dari kata 'tarwihah' yang berarti istirahat.",
  },
  keutamaan: [
    "Mendapat ampunan dosa yang telah lalu",
    "Menghidupkan malam Ramadhan",
    "Mengikuti sunnah Rasulullah SAW",
    "Pahala yang berlipat ganda di bulan Ramadhan",
    "Memperkuat keimanan dan ketakwaan",
  ],
  jumlahRakaat: {
    title: "Jumlah Rakaat",
    options: [
      {
        rakaat: "8 Rakaat + 3 Witir",
        pendapat: "Berdasarkan hadits Aisyah RA",
        keterangan: "Dilakukan Rasulullah SAW"
      },
      {
        rakaat: "20 Rakaat + 3 Witir",
        pendapat: "Pendapat jumhur ulama",
        keterangan: "Dijalankan di zaman Umar bin Khattab RA"
      },
    ],
    catatan: "Kedua pendapat di atas sama-sama memiliki dasar yang kuat. Yang terpenting adalah melaksanakannya dengan khusyu dan konsisten."
  },
  niat: [
    {
      jenis: "Niat Imam",
      arabic: "أُصَلِّي سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ إِمَامًا لِلَّهِ تَعَالَى",
      latin: "Ushallī sunnata at-tarāwīḥi rak'ataini imāman lillāhi ta'ālā",
      arti: "Aku niat sholat sunnah tarawih dua rakaat sebagai imam karena Allah Ta'ala."
    },
    {
      jenis: "Niat Makmum",
      arabic: "أُصَلِّي سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مَأْمُومًا لِلَّهِ تَعَالَى",
      latin: "Ushallī sunnata at-tarāwīḥi rak'ataini ma'mūman lillāhi ta'ālā",
      arti: "Aku niat sholat sunnah tarawih dua rakaat sebagai makmum karena Allah Ta'ala."
    },
    {
      jenis: "Niat Sendiri (Munfarid)",
      arabic: "أُصَلِّي سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
      latin: "Ushallī sunnata at-tarāwīḥi rak'ataini lillāhi ta'ālā",
      arti: "Aku niat sholat sunnah tarawih dua rakaat karena Allah Ta'ala."
    },
  ],
  tataCara: [
    "Niat sholat tarawih dalam hati",
    "Takbiratul ihram sambil mengangkat tangan",
    "Membaca doa iftitah (sunnah)",
    "Membaca surat Al-Fatihah",
    "Membaca surat atau ayat Al-Qur'an",
    "Rukuk dengan thuma'ninah",
    "I'tidal dengan thuma'ninah",
    "Sujud pertama dengan thuma'ninah",
    "Duduk antara dua sujud dengan thuma'ninah",
    "Sujud kedua dengan thuma'ninah",
    "Berdiri untuk rakaat kedua",
    "Melakukan seperti rakaat pertama",
    "Tasyahud akhir",
    "Salam ke kanan dan ke kiri",
    "Istirahat sejenak, lalu melanjutkan 2 rakaat berikutnya",
  ],
  doaIstirahat: {
    title: "Doa Ketika Istirahat (antara salam)",
    arabic: "اَللَّهُمَّ اجْعَلْنَا بِالْإِيْمَانِ كَامِلِيْنَ، وَبِالْقُرْآنِ عَامِلِيْنَ، وَلِلصَّلَاةِ حَافِظِيْنَ، وَلِلزَّكَاةِ فَاعِلِيْنَ، وَلِلْخَيْرَاتِ سَابِقِيْنَ، وَمِنَ النَّارِ نَاجِيْنَ، وَفِي الْجَنَّةِ خَالِدِيْنَ",
    latin: "Allāhummaj'alnā bil īmāni kāmilīn, wa bil qur'āni 'āmilīn, wa lishshalāti ḥāfiẓīn, wa lizzakāti fā'ilīn, wa lilkhayrāti sābiqīn, wa minan nāri nājīn, wa fil jannati khālidīn",
    arti: "Ya Allah, jadikanlah kami orang yang sempurna imannya, mengamalkan Al-Qur'an, menjaga sholat, menunaikan zakat, berlomba-lomba dalam kebaikan, selamat dari api neraka, dan kekal di dalam surga."
  },
  tips: [
    "Usahakan sholat berjamaah di masjid",
    "Baca Al-Qur'an dengan tartil",
    "Jangan terburu-buru dalam gerakan sholat",
    "Berdoa setelah sholat",
    "Jaga kekhusyukan dari awal hingga akhir",
    "Jika lelah, boleh istirahat sebentar lalu lanjutkan",
  ],
  dalil: {
    arabic: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    translation: "Barangsiapa yang mendirikan shalat (tarawih) di bulan Ramadhan karena iman dan mengharap pahala, maka diampunilah dosa-dosanya yang telah lalu.",
    source: "HR. Bukhari & Muslim"
  }
};

const TarawihPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Sholat Tarawih</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <MdMosque className="w-8 h-8" />
            <h1 className="text-2xl font-bold">{tarawihData.overview.title}</h1>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            {tarawihData.overview.description}
          </p>
        </div>

        {/* Dalil */}
        <div className="mb-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Dalil
          </h3>
          <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">
            {tarawihData.dalil.arabic}
          </p>
          <p className="text-gray-700 italic text-sm mb-2">
            "{tarawihData.dalil.translation}"
          </p>
          <p className="text-purple-600 text-xs font-semibold">
            {tarawihData.dalil.source}
          </p>
        </div>

        {/* Keutamaan */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsStarFill className="w-5 h-5" />
              Keutamaan Sholat Tarawih
            </h2>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {tarawihData.keutamaan.map((item, index) => (
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

        {/* Jumlah Rakaat */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChartBar className="w-5 h-5" />
              {tarawihData.jumlahRakaat.title}
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {tarawihData.jumlahRakaat.options.map((option, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="font-bold text-blue-800 text-lg">{option.rakaat}</p>
                <p className="text-sm text-gray-700">{option.pendapat}</p>
                <p className="text-xs text-gray-500">{option.keterangan}</p>
              </div>
            ))}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-2">
                <HiOutlineLightBulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">{tarawihData.jumlahRakaat.catatan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Niat */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPrayingHands className="w-5 h-5" />
              Niat Sholat Tarawih
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {tarawihData.niat.map((niat, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {niat.jenis}
                  </span>
                </div>
                <p className="font-arabic text-right text-xl mb-3 leading-loose text-gray-800">
                  {niat.arabic}
                </p>
                <p className="text-gray-600 italic text-sm mb-2">{niat.latin}</p>
                <p className="text-gray-700 text-sm">{niat.arti}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tata Cara */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineClipboardList className="w-5 h-5" />
              Tata Cara Sholat Tarawih
            </h2>
          </div>
          <div className="p-5">
            <ol className="space-y-2">
              {tarawihData.tataCara.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Doa Istirahat */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RiMoonClearFill className="w-5 h-5" />
              {tarawihData.doaIstirahat.title}
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="font-arabic text-right text-xl mb-4 leading-loose text-gray-800">
                {tarawihData.doaIstirahat.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-3 leading-relaxed">
                {tarawihData.doaIstirahat.latin}
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold">Artinya:</span> {tarawihData.doaIstirahat.arti}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Tips Sholat Tarawih
          </h3>
          <ul className="space-y-2">
            {tarawihData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga panduan ini bermanfaat dalam melaksanakan ibadah tarawih
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

export default TarawihPage;
