"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import axios from "axios";

// React Icons
import { FaPrayingHands, FaChevronDown } from "react-icons/fa";

interface DoaType {
  id: number;
  doa: string;
  ayat: string;
  latin: string;
  artinya: string;
}

const DoaRamadhanPage = () => {
  const [doaList, setDoaList] = useState<DoaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const staticDoa: DoaType[] = [
    {
      id: 1,
      doa: "Doa Niat Puasa",
      ayat: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هٰذِهِ السَّنَةِ لِلّٰهِ تَعَالَى",
      latin: "Nawaitu shauma ghadin 'an adā'i fardhi syahri ramadhāna hādzihis sanati lillāhi ta'ālā",
      artinya: "Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala."
    },
    {
      id: 2,
      doa: "Doa Berbuka Puasa",
      ayat: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللهُ",
      latin: "Dzahabazh zhama'u wabtallatil 'urūqu wa tsabatal ajru insyā Allāh",
      artinya: "Telah hilang dahaga, urat-urat telah basah, dan pahala telah ditetapkan insya Allah."
    },
    {
      id: 3,
      doa: "Doa Malam Lailatul Qadar",
      ayat: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      latin: "Allāhumma innaka 'afuwwun tuḥibbul 'afwa fa'fu 'annī",
      artinya: "Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai pemberian maaf, maka maafkanlah aku."
    },
    {
      id: 4,
      doa: "Doa Qunut Witir",
      ayat: "اَللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
      latin: "Allāhummahdīnī fīman hadayta, wa 'āfinī fīman 'āfayta, wa tawallānī fīman tawallayta",
      artinya: "Ya Allah, berilah aku petunjuk di antara orang-orang yang telah Engkau beri petunjuk. Berilah aku kesehatan di antara orang-orang yang telah Engkau beri kesehatan."
    },
    {
      id: 5,
      doa: "Doa Sebelum Makan",
      ayat: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ",
      latin: "Bismillāhi wa 'alā barakatillāh",
      artinya: "Dengan nama Allah dan dengan berkah Allah."
    },
    {
      id: 6,
      doa: "Doa Setelah Makan",
      ayat: "الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ",
      latin: "Alḥamdulillāhil ladzī ath'amanā wa saqānā wa ja'alanā minal muslimīn",
      artinya: "Segala puji bagi Allah yang telah memberi kami makan dan minum dan menjadikan kami orang-orang Islam."
    },
  ];

  useEffect(() => {
    const fetchDoa = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_DOA_API_URL}/doa/spiitual`
        );
        if (response.data.data && response.data.data.length > 0) {
          setDoaList(response.data.data.slice(0, 10));
        } else {
          setDoaList(staticDoa);
        }
      } catch (error) {
        setDoaList(staticDoa);
      } finally {
        setLoading(false);
      }
    };
    fetchDoa();
  }, []);

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Doa Ramadhan</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <FaPrayingHands className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Doa-Doa Ramadhan</h1>
          </div>
          <p className="text-emerald-50 text-sm">
            Kumpulan doa yang dianjurkan di bulan Ramadhan
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat doa...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doaList.map((doa) => (
              <div key={doa.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <button
                  onClick={() => setExpandedId(expandedId === doa.id ? null : doa.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                      {doa.id}
                    </div>
                    <span className="font-bold text-gray-800 text-left">{doa.doa}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === doa.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedId === doa.id && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                      <p className="font-arabic text-right text-xl leading-loose text-gray-800">
                        {doa.ayat}
                      </p>
                    </div>
                    <p className="text-gray-600 italic text-sm">{doa.latin}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Artinya: </span>{doa.artinya}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">Semoga doa-doa kita dikabulkan</p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">آمِينَ يَا رَبَّ الْعَالَمِينَ</p>
        </div>
      </div>
    </div>
  );
};

export default DoaRamadhanPage;
