import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { RiHandHeartLine } from "react-icons/ri";
import { HiOutlineBookOpen, HiOutlineLightBulb, HiOutlineClipboardList } from "react-icons/hi";
import { BsStarFill } from "react-icons/bs";
import { FaFire, FaWater, FaMoneyBillWave, FaShieldAlt, FaBook, FaHandsHelping, FaSmile, FaBuilding, FaLeaf } from "react-icons/fa";
import { GiSparkles, GiMedicines } from "react-icons/gi";

const SedekahPage = () => {
  const keutamaan = [
    { text: "Memadamkan murka Allah", icon: "🔥" },
    { text: "Menghapus dosa seperti air memadamkan api", icon: "💧" },
    { text: "Harta tidak akan berkurang karena sedekah", icon: "💰" },
    { text: "Pelindung dari api neraka", icon: "🛡️" },
    { text: "Mendatangkan keberkahan rezeki", icon: "✨" },
    { text: "Menyembuhkan penyakit", icon: "💊" },
  ];

  const jenisSedekah = [
    { jenis: "Sedekah Harta", contoh: "Uang, makanan, pakaian", icon: "💵" },
    { jenis: "Sedekah Ilmu", contoh: "Mengajar, berbagi ilmu", icon: "📚" },
    { jenis: "Sedekah Tenaga", contoh: "Membantu orang lain", icon: "💪" },
    { jenis: "Sedekah Senyum", contoh: "Tersenyum kepada sesama", icon: "😊" },
    { jenis: "Sedekah Jariyah", contoh: "Masjid, sumur, sekolah", icon: "🏛️" },
    { jenis: "Menyingkirkan Duri", contoh: "Membersihkan jalan", icon: "🌿" },
  ];

  const dalil = {
    arabic: "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ",
    arti: "Perumpamaan orang-orang yang menafkahkan hartanya di jalan Allah adalah seperti sebutir benih yang menumbuhkan tujuh tangkai...",
    source: "QS. Al-Baqarah: 261"
  };

  const adab = [
    "Ikhlas karena Allah, bukan karena pujian",
    "Tidak menyebut-nyebut sedekah (riya)",
    "Tidak menyakiti perasaan penerima",
    "Memberikan yang terbaik dari yang dimiliki",
    "Menyembunyikan sedekah (lebih utama)",
    "Bersedekah dari harta yang halal",
  ];

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Sedekah & Infaq</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <RiHandHeartLine className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Sedekah & Infaq</h1>
          </div>
          <p className="text-emerald-50 text-sm">
            Berbagi di bulan Ramadhan dengan pahala berlipat ganda
          </p>
        </div>

        {/* Dalil */}
        <div className="bg-purple-50 rounded-2xl p-5 mb-6 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><HiOutlineBookOpen className="w-5 h-5" /> Dalil</h3>
          <p className="font-arabic text-right text-lg leading-loose text-gray-800 mb-2">{dalil.arabic}</p>
          <p className="text-gray-700 italic text-sm">"{dalil.arti}"</p>
          <p className="text-purple-600 text-xs font-semibold mt-2">{dalil.source}</p>
        </div>

        {/* Keutamaan */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BsStarFill className="w-5 h-5 text-amber-500" /> Keutamaan Sedekah</h2>
          <div className="grid grid-cols-2 gap-3">
            {keutamaan.map((item, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-3 flex items-center gap-3 border border-amber-100">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis Sedekah */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><HiOutlineClipboardList className="w-5 h-5 text-teal-600" /> Jenis-Jenis Sedekah</h2>
          <div className="grid grid-cols-2 gap-3">
            {jenisSedekah.map((item, i) => (
              <div key={i} className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <h4 className="font-bold text-teal-800 text-sm">{item.jenis}</h4>
                <p className="text-xs text-gray-600">{item.contoh}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Adab */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mb-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><HiOutlineLightBulb className="w-5 h-5" /> Adab Bersedekah</h3>
          <ul className="space-y-2">
            {adab.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500">✓</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">Semoga sedekah kita diterima</p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">وَمَا تُنْفِقُوا مِنْ خَيْرٍ يُوَفَّ إِلَيْكُمْ</p>
          <p className="text-gray-500 text-xs mt-1 italic">"Apa saja yang kamu infakkan akan disempurnakan pahalanya" (QS. Al-Baqarah: 272)</p>
        </div>
      </div>
    </div>
  );
};

export default SedekahPage;
