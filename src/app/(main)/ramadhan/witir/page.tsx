import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { HiOutlineSparkles, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineLightBulb, HiOutlineClock } from "react-icons/hi";
import { BsStarFill } from "react-icons/bs";
import { FaPrayingHands } from "react-icons/fa";
import { RiMoonClearFill } from "react-icons/ri";

const witirData = {
  overview: {
    title: "Sholat Witir",
    description: "Sholat witir adalah sholat sunnah muakkad yang dikerjakan setelah sholat Isya' hingga sebelum waktu Subuh. Kata 'witir' berarti ganjil, karena jumlah rakaatnya selalu ganjil (1, 3, 5, 7, 9, atau 11 rakaat).",
    keutamaan: [
      "Sholat yang sangat dicintai Allah SWT",
      "Penutup rangkaian ibadah malam",
      "Doa dalam qunut witir mustajab",
      "Penyempurna ibadah tarawih di bulan Ramadhan",
    ]
  },
  niat: [
    {
      type: "1 Rakaat",
      arabic: "أُصَلِّي سُنَّةَ الْوِتْرِ رَكْعَةً وَاحِدَةً لِلّٰهِ تَعَالَى",
      latin: "Ushalli sunnatal witri rak'atan wāhidatan lillāhi ta'ālā",
      arti: "Aku niat sholat sunnah witir satu rakaat karena Allah Ta'ala."
    },
    {
      type: "3 Rakaat",
      arabic: "أُصَلِّي سُنَّةَ الْوِتْرِ ثَلَاثَ رَكَعَاتٍ لِلّٰهِ تَعَالَى",
      latin: "Ushalli sunnatal witri tsalātsa raka'ātin lillāhi ta'ālā",
      arti: "Aku niat sholat sunnah witir tiga rakaat karena Allah Ta'ala."
    },
  ],
  tataCaraRingkas: [
    "Berdiri menghadap kiblat dan niat sholat witir",
    "Takbiratul ihram sambil mengangkat tangan",
    "Membaca doa iftitah (sunnah)",
    "Membaca surat Al-Fatihah",
    "Membaca surat Al-A'la (rakaat pertama) atau surat lainnya",
    "Rukuk dengan membaca tasbih",
    "I'tidal",
    "Sujud dua kali",
    "Pada rakaat terakhir, setelah membaca surat, membaca doa qunut (sunnah)",
    "Tasyahud akhir dan salam",
  ],
  qunut: {
    title: "Doa Qunut Witir",
    arabic: "اَللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
    latin: "Allāhummahdīnī fīman hadayta, wa 'āfinī fīman 'āfayta, wa tawallānī fīman tawallayta, wa bārik lī fīmā a'țayta, wa qinī syarra mā qaḍayta, fa innaka taqḍī wa lā yuqḍā 'alayka, wa innahū lā yadzillu man wālayta, wa lā ya'izzu man 'ādayta, tabārakta rabbanā wa ta'ālayta.",
    arti: "Ya Allah, berilah aku petunjuk di antara orang-orang yang telah Engkau beri petunjuk. Berilah aku kesehatan di antara orang-orang yang telah Engkau beri kesehatan. Peliharalah aku di antara orang-orang yang telah Engkau pelihara. Berkahilah bagiku apa yang telah Engkau berikan kepadaku. Lindungilah aku dari keburukan apa yang telah Engkau tetapkan. Sesungguhnya Engkau yang menetapkan dan tidak ada yang menetapkan atas-Mu. Sesungguhnya tidak akan hina orang yang Engkau pimpin. Dan tidak akan mulia orang yang Engkau musuhi. Maha Suci Engkau, wahai Tuhan kami, dan Maha Tinggi Engkau.",
    note: "Qunut dibaca setelah rukuk pada rakaat terakhir, atau sebelum rukuk menurut sebagian ulama."
  },
  waktuPelaksanaan: [
    { waktu: "Sepertiga malam pertama", keutamaan: "Boleh, tapi kurang afdhal" },
    { waktu: "Sepertiga malam terakhir", keutamaan: "Paling utama" },
    { waktu: "Sebelum tidur", keutamaan: "Untuk yang khawatir tidak bangun" },
    { waktu: "Setelah tarawih", keutamaan: "Umum dilakukan di bulan Ramadhan" },
  ],
  dalil: {
    arabic: "اجْعَلُوا آخِرَ صَلَاتِكُمْ بِاللَّيْلِ وِتْرًا",
    translation: "Jadikanlah akhir sholat malam kalian dengan witir.",
    source: "HR. Bukhari & Muslim"
  }
};

const WitirPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Sholat Witir</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineSparkles className="w-8 h-8" />
            <h1 className="text-2xl font-bold">{witirData.overview.title}</h1>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            {witirData.overview.description}
          </p>
        </div>

        {/* Keutamaan */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BsStarFill className="w-5 h-5" />
              Keutamaan Sholat Witir
            </h2>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {witirData.overview.keutamaan.map((item, index) => (
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

        {/* Dalil */}
        <div className="mb-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Dalil
          </h3>
          <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">
            {witirData.dalil.arabic}
          </p>
          <p className="text-gray-700 italic text-sm mb-2">
            "{witirData.dalil.translation}"
          </p>
          <p className="text-emerald-600 text-xs font-semibold">
            {witirData.dalil.source}
          </p>
        </div>

        {/* Niat */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPrayingHands className="w-5 h-5" />
              Niat Sholat Witir
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {witirData.niat.map((niat, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {niat.type}
                  </span>
                </div>
                <p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
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
              Tata Cara Ringkas
            </h2>
          </div>
          <div className="p-5">
            <ol className="space-y-3">
              {witirData.tataCaraRingkas.map((step, index) => (
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

        {/* Doa Qunut */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiMoonClearFill className="w-5 h-5" />
              {witirData.qunut.title}
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="font-arabic text-right text-2xl mb-4 leading-loose text-gray-800">
                {witirData.qunut.arabic}
              </p>
              <p className="text-gray-600 italic text-sm mb-3 leading-relaxed">
                {witirData.qunut.latin}
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold">Artinya:</span> {witirData.qunut.arti}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-2">
                <HiOutlineLightBulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">{witirData.qunut.note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Waktu Pelaksanaan */}
        <div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5" />
              Waktu Pelaksanaan
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {witirData.waktuPelaksanaan.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-800">{item.waktu}</span>
                  <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {item.keutamaan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga panduan ini bermanfaat dalam melaksanakan ibadah sholat witir
          </p>
          <p className="text-[#009788] font-semibold mt-2">
            وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Dan pada sebagian malam, lakukanlah shalat tahajud sebagai tambahan bagimu"
            (QS. Al-Isra: 79)
          </p>
        </div>
      </div>
    </div>
  );
};

export default WitirPage;
