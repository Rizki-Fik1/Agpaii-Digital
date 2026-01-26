import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { FiSunset } from "react-icons/fi";
import { FaPrayingHands, FaUtensils, FaHome } from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineClipboardList } from "react-icons/hi";

const doaBerbukaData = {
  doaUtama: {
    title: "Doa Berbuka Puasa",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللهُ",
    latin: "Dzahabazh zhama'u wabtallatil 'urūqu wa tsabatal ajru insyā Allāh",
    arti: "Telah hilang dahaga, urat-urat telah basah, dan pahala telah ditetapkan insya Allah.",
    source: "HR. Abu Dawud"
  },
  doaLain: [
    {
      title: "Doa Berbuka Puasa (Riwayat Lain)",
      arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
      latin: "Allāhumma laka shumtu wa 'alā rizqika afthartu",
      arti: "Ya Allah, karena-Mu aku berpuasa dan dengan rezeki-Mu aku berbuka.",
      source: "HR. Abu Dawud"
    },
    {
      title: "Doa Meminta Keberkahan",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي",
      latin: "Allāhumma innī as'aluka biraḥmatikal latī wasi'at kulla syay'in an taghfira lī",
      arti: "Ya Allah, aku memohon kepada-Mu dengan rahmat-Mu yang meliputi segala sesuatu, agar Engkau mengampuniku.",
      source: "HR. Ibnu Majah"
    },
  ],
  sunnahBerbuka: [
    {
      title: "Menyegerakan Berbuka",
      description: "Berbuka segera setelah adzan Maghrib berkumandang",
      dalil: "Tidak henti-hentinya manusia dalam kebaikan selama mereka menyegerakan berbuka. (HR. Bukhari & Muslim)",
      icon: "⏰"
    },
    {
      title: "Berbuka dengan Kurma atau Air",
      description: "Dianjurkan berbuka dengan kurma, jika tidak ada dengan air",
      dalil: "Jika salah seorang di antara kalian berbuka, hendaklah ia berbuka dengan kurma. Jika tidak mendapatinya, hendaklah berbuka dengan air karena air itu suci. (HR. Abu Dawud & Tirmidzi)",
      icon: "🌴"
    },
    {
      title: "Berbuka dengan Jumlah Ganjil",
      description: "Rasulullah berbuka dengan kurma dalam jumlah ganjil",
      dalil: "Rasulullah SAW berbuka dengan ruthab (kurma basah) sebelum sholat. Jika tidak ada ruthab, beliau berbuka dengan tamr (kurma kering). Jika tidak ada tamr, beliau meneguk air beberapa teguk. (HR. Abu Dawud & Tirmidzi)",
      icon: "3️⃣"
    },
    {
      title: "Berdoa Saat Berbuka",
      description: "Waktu berbuka adalah waktu mustajab untuk berdoa",
      dalil: "Ada tiga orang yang tidak ditolak doanya: orang yang berpuasa hingga berbuka, imam yang adil, dan doa orang teraniaya. (HR. Tirmidzi)",
      icon: "🤲"
    },
  ],
  adabBerbuka: [
    "Membaca bismillah sebelum makan",
    "Makan dengan tangan kanan",
    "Makan dari yang terdekat di piring",
    "Tidak berlebihan dalam makan",
    "Bersyukur atas nikmat berbuka",
    "Mendoakan tuan rumah jika berbuka di rumah orang lain",
  ],
  makananSunnah: [
    { nama: "Kurma", manfaat: "Sumber energi cepat, mengandung gula alami", icon: "🌴" },
    { nama: "Air Putih", manfaat: "Menghilangkan dehidrasi, menyegarkan tubuh", icon: "💧" },
    { nama: "Madu", manfaat: "Sumber energi, banyak manfaat kesehatan", icon: "🍯" },
    { nama: "Susu", manfaat: "Kalsium dan protein untuk tubuh", icon: "🥛" },
  ],
  doaForOthers: {
    title: "Doa untuk yang Mengundang Berbuka",
    arabic: "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ",
    latin: "Afthara 'indakumush shā'imūna wa akala tha'āmakumul abrāru wa shallat 'alaikumul malā'ikah",
    arti: "Semoga orang-orang yang berpuasa berbuka di sisi kalian, dan orang-orang yang baik memakan makanan kalian, dan para malaikat mendoakan kalian.",
    source: "HR. Abu Dawud"
  }
};

const DoaBerbukaPage = () => {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Doa Berbuka Puasa</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[80px] opacity-20">🌅</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <FiSunset className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Doa Berbuka Puasa</h1>
            </div>
            <p className="text-amber-100 text-sm leading-relaxed">
              Kumpulan doa dan sunnah berbuka puasa sesuai tuntunan Rasulullah SAW
            </p>
          </div>
        </div>

        {/* Doa Utama */}
        <div className="mb-5 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-amber-200">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPrayingHands className="w-5 h-5" />
              {doaBerbukaData.doaUtama.title}
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5">
              <p className="font-arabic text-right text-3xl mb-4 leading-loose text-gray-800">
                {doaBerbukaData.doaUtama.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-3">
                {doaBerbukaData.doaUtama.latin}
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-700">
                  <span className="font-bold">Artinya:</span> {doaBerbukaData.doaUtama.arti}
                </p>
              </div>
            </div>
            <p className="text-amber-600 text-xs font-semibold text-center">
              📖 {doaBerbukaData.doaUtama.source}
            </p>
          </div>
        </div>

        {/* Doa Lainnya */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
          Doa Berbuka Lainnya
        </h2>

        {doaBerbukaData.doaLain.map((doa, index) => (
          <div key={index} className="mb-4 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-3">
              <h3 className="text-lg font-bold text-white">{doa.title}</h3>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
                  {doa.arabic}
                </p>
                <p className="text-gray-600 italic text-sm mb-2">{doa.latin}</p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Artinya:</span> {doa.arti}
                </p>
              </div>
              <p className="text-amber-600 text-xs font-semibold mt-3 text-center">
                📖 {doa.source}
              </p>
            </div>
          </div>
        ))}

        {/* Sunnah Berbuka */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5" />
              Sunnah Saat Berbuka
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {doaBerbukaData.sunnahBerbuka.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-teal-800 mb-1">{item.title}</h4>
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

        {/* Makanan Sunnah */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUtensils className="w-5 h-5" />
              Makanan Sunnah untuk Berbuka
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {doaBerbukaData.makananSunnah.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <span className="text-3xl block mb-2">{item.icon}</span>
                <h4 className="font-bold text-green-800 text-sm mb-1">{item.nama}</h4>
                <p className="text-xs text-gray-600">{item.manfaat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Adab Berbuka */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <HiOutlineClipboardList className="w-5 h-5" />
            Adab Berbuka Puasa
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {doaBerbukaData.adabBerbuka.map((adab, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">{adab}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doa untuk Tuan Rumah */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaHome className="w-5 h-5" />
              {doaBerbukaData.doaForOthers.title}
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
                {doaBerbukaData.doaForOthers.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-2">
                {doaBerbukaData.doaForOthers.latin}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Artinya:</span> {doaBerbukaData.doaForOthers.arti}
              </p>
            </div>
            <p className="text-purple-600 text-xs font-semibold mt-3 text-center">
              📖 {doaBerbukaData.doaForOthers.source}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga berbuka puasa kita diberkahi oleh Allah SWT
          </p>
          <p className="text-amber-600 font-semibold mt-2 font-arabic text-lg">
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

export default DoaBerbukaPage;
