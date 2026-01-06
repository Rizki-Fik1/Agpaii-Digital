"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState } from "react";

// React Icons
import { BsStarFill, BsSearch } from "react-icons/bs";
import { GiStarFormation } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";

// 99 Names of Allah (Asmaul Husna)
const asmaulHusnaData = [
  { number: 1, arabic: "الرَّحْمٰنُ", latin: "Ar-Rahman", meaning: "Maha Pengasih" },
  { number: 2, arabic: "الرَّحِيْمُ", latin: "Ar-Rahim", meaning: "Maha Penyayang" },
  { number: 3, arabic: "الْمَلِكُ", latin: "Al-Malik", meaning: "Maha Raja" },
  { number: 4, arabic: "الْقُدُّوْسُ", latin: "Al-Quddus", meaning: "Maha Suci" },
  { number: 5, arabic: "السَّلَامُ", latin: "As-Salam", meaning: "Maha Pemberi Keselamatan" },
  { number: 6, arabic: "الْمُؤْمِنُ", latin: "Al-Mu'min", meaning: "Maha Pemberi Keamanan" },
  { number: 7, arabic: "الْمُهَيْمِنُ", latin: "Al-Muhaymin", meaning: "Maha Pemelihara" },
  { number: 8, arabic: "الْعَزِيْزُ", latin: "Al-Aziz", meaning: "Maha Perkasa" },
  { number: 9, arabic: "الْجَبَّارُ", latin: "Al-Jabbar", meaning: "Maha Pemaksa" },
  { number: 10, arabic: "الْمُتَكَبِّرُ", latin: "Al-Mutakabbir", meaning: "Maha Megah" },
  { number: 11, arabic: "الْخَالِقُ", latin: "Al-Khaliq", meaning: "Maha Pencipta" },
  { number: 12, arabic: "الْبَارِئُ", latin: "Al-Baari'", meaning: "Maha Perancang" },
  { number: 13, arabic: "الْمُصَوِّرُ", latin: "Al-Musawwir", meaning: "Maha Pembentuk Rupa" },
  { number: 14, arabic: "الْغَفَّارُ", latin: "Al-Ghaffar", meaning: "Maha Pengampun" },
  { number: 15, arabic: "الْقَهَّارُ", latin: "Al-Qahhar", meaning: "Maha Penakluk" },
  { number: 16, arabic: "الْوَهَّابُ", latin: "Al-Wahhab", meaning: "Maha Pemberi" },
  { number: 17, arabic: "الرَّزَّاقُ", latin: "Ar-Razzaq", meaning: "Maha Pemberi Rezeki" },
  { number: 18, arabic: "الْفَتَّاحُ", latin: "Al-Fattah", meaning: "Maha Pembuka" },
  { number: 19, arabic: "الْعَلِيْمُ", latin: "Al-'Alim", meaning: "Maha Mengetahui" },
  { number: 20, arabic: "الْقَابِضُ", latin: "Al-Qabidh", meaning: "Maha Penyempit" },
  { number: 21, arabic: "الْبَاسِطُ", latin: "Al-Basith", meaning: "Maha Pelapang" },
  { number: 22, arabic: "الْخَافِضُ", latin: "Al-Khafidh", meaning: "Maha Merendahkan" },
  { number: 23, arabic: "الرَّافِعُ", latin: "Ar-Rafi'", meaning: "Maha Meninggikan" },
  { number: 24, arabic: "الْمُعِزُّ", latin: "Al-Mu'izz", meaning: "Maha Memuliakan" },
  { number: 25, arabic: "الْمُذِلُّ", latin: "Al-Mudzill", meaning: "Maha Menghinakan" },
  { number: 26, arabic: "السَّمِيْعُ", latin: "As-Sami'", meaning: "Maha Mendengar" },
  { number: 27, arabic: "الْبَصِيْرُ", latin: "Al-Bashir", meaning: "Maha Melihat" },
  { number: 28, arabic: "الْحَكَمُ", latin: "Al-Hakam", meaning: "Maha Menetapkan Hukum" },
  { number: 29, arabic: "الْعَدْلُ", latin: "Al-'Adl", meaning: "Maha Adil" },
  { number: 30, arabic: "اللَّطِيْفُ", latin: "Al-Lathif", meaning: "Maha Lembut" },
  { number: 31, arabic: "الْخَبِيْرُ", latin: "Al-Khabir", meaning: "Maha Mengenal" },
  { number: 32, arabic: "الْحَلِيْمُ", latin: "Al-Halim", meaning: "Maha Penyantun" },
  { number: 33, arabic: "الْعَظِيْمُ", latin: "Al-'Azhim", meaning: "Maha Agung" },
  { number: 34, arabic: "الْغَفُوْرُ", latin: "Al-Ghafur", meaning: "Maha Pengampun" },
  { number: 35, arabic: "الشَّكُوْرُ", latin: "Asy-Syakur", meaning: "Maha Pembalas Budi" },
  { number: 36, arabic: "الْعَلِيُّ", latin: "Al-'Aliyy", meaning: "Maha Tinggi" },
  { number: 37, arabic: "الْكَبِيْرُ", latin: "Al-Kabir", meaning: "Maha Besar" },
  { number: 38, arabic: "الْحَفِيْظُ", latin: "Al-Hafizh", meaning: "Maha Memelihara" },
  { number: 39, arabic: "الْمُقِيْتُ", latin: "Al-Muqit", meaning: "Maha Pemberi Kecukupan" },
  { number: 40, arabic: "الْحَسِيْبُ", latin: "Al-Hasib", meaning: "Maha Membuat Perhitungan" },
  { number: 41, arabic: "الْجَلِيْلُ", latin: "Al-Jalil", meaning: "Maha Mulia" },
  { number: 42, arabic: "الْكَرِيْمُ", latin: "Al-Karim", meaning: "Maha Pemurah" },
  { number: 43, arabic: "الرَّقِيْبُ", latin: "Ar-Raqib", meaning: "Maha Mengawasi" },
  { number: 44, arabic: "الْمُجِيْبُ", latin: "Al-Mujib", meaning: "Maha Mengabulkan" },
  { number: 45, arabic: "الْوَاسِعُ", latin: "Al-Wasi'", meaning: "Maha Luas" },
  { number: 46, arabic: "الْحَكِيْمُ", latin: "Al-Hakim", meaning: "Maha Bijaksana" },
  { number: 47, arabic: "الْوَدُوْدُ", latin: "Al-Wadud", meaning: "Maha Pencinta" },
  { number: 48, arabic: "الْمَجِيْدُ", latin: "Al-Majid", meaning: "Maha Mulia" },
  { number: 49, arabic: "الْبَاعِثُ", latin: "Al-Ba'its", meaning: "Maha Membangkitkan" },
  { number: 50, arabic: "الشَّهِيْدُ", latin: "Asy-Syahid", meaning: "Maha Menyaksikan" },
  { number: 51, arabic: "الْحَقُّ", latin: "Al-Haqq", meaning: "Maha Benar" },
  { number: 52, arabic: "الْوَكِيْلُ", latin: "Al-Wakil", meaning: "Maha Pemelihara" },
  { number: 53, arabic: "الْقَوِيُّ", latin: "Al-Qawiyy", meaning: "Maha Kuat" },
  { number: 54, arabic: "الْمَتِيْنُ", latin: "Al-Matin", meaning: "Maha Kokoh" },
  { number: 55, arabic: "الْوَلِيُّ", latin: "Al-Waliyy", meaning: "Maha Melindungi" },
  { number: 56, arabic: "الْحَمِيْدُ", latin: "Al-Hamid", meaning: "Maha Terpuji" },
  { number: 57, arabic: "الْمُحْصِي", latin: "Al-Muhshi", meaning: "Maha Mengkalkulasi" },
  { number: 58, arabic: "الْمُبْدِئُ", latin: "Al-Mubdi'", meaning: "Maha Memulai" },
  { number: 59, arabic: "الْمُعِيْدُ", latin: "Al-Mu'id", meaning: "Maha Mengembalikan" },
  { number: 60, arabic: "الْمُحْيِي", latin: "Al-Muhyi", meaning: "Maha Menghidupkan" },
  { number: 61, arabic: "الْمُمِيْتُ", latin: "Al-Mumit", meaning: "Maha Mematikan" },
  { number: 62, arabic: "الْحَيُّ", latin: "Al-Hayy", meaning: "Maha Hidup" },
  { number: 63, arabic: "الْقَيُّوْمُ", latin: "Al-Qayyum", meaning: "Maha Mandiri" },
  { number: 64, arabic: "الْوَاجِدُ", latin: "Al-Wajid", meaning: "Maha Penemu" },
  { number: 65, arabic: "الْمَاجِدُ", latin: "Al-Majid", meaning: "Maha Mulia" },
  { number: 66, arabic: "الْوَاحِدُ", latin: "Al-Wahid", meaning: "Maha Esa" },
  { number: 67, arabic: "الْأَحَدُ", latin: "Al-Ahad", meaning: "Maha Esa" },
  { number: 68, arabic: "الصَّمَدُ", latin: "Ash-Shamad", meaning: "Maha Dibutuhkan" },
  { number: 69, arabic: "الْقَادِرُ", latin: "Al-Qadir", meaning: "Maha Menentukan" },
  { number: 70, arabic: "الْمُقْتَدِرُ", latin: "Al-Muqtadir", meaning: "Maha Berkuasa" },
  { number: 71, arabic: "الْمُقَدِّمُ", latin: "Al-Muqaddim", meaning: "Maha Mendahulukan" },
  { number: 72, arabic: "الْمُؤَخِّرُ", latin: "Al-Mu'akhkhir", meaning: "Maha Mengakhirkan" },
  { number: 73, arabic: "الْأَوَّلُ", latin: "Al-Awwal", meaning: "Maha Awal" },
  { number: 74, arabic: "الْآخِرُ", latin: "Al-Akhir", meaning: "Maha Akhir" },
  { number: 75, arabic: "الظَّاهِرُ", latin: "Azh-Zhahir", meaning: "Maha Nyata" },
  { number: 76, arabic: "الْبَاطِنُ", latin: "Al-Bathin", meaning: "Maha Tersembunyi" },
  { number: 77, arabic: "الْوَالِي", latin: "Al-Wali", meaning: "Maha Memerintah" },
  { number: 78, arabic: "الْمُتَعَالِي", latin: "Al-Muta'ali", meaning: "Maha Tinggi" },
  { number: 79, arabic: "الْبَرُّ", latin: "Al-Barr", meaning: "Maha Penderma" },
  { number: 80, arabic: "التَّوَّابُ", latin: "At-Tawwab", meaning: "Maha Penerima Taubat" },
  { number: 81, arabic: "الْمُنْتَقِمُ", latin: "Al-Muntaqim", meaning: "Maha Pemberi Balasan" },
  { number: 82, arabic: "الْعَفُوُّ", latin: "Al-'Afuww", meaning: "Maha Pemaaf" },
  { number: 83, arabic: "الرَّؤُوْفُ", latin: "Ar-Ra'uf", meaning: "Maha Pengasih" },
  { number: 84, arabic: "مَالِكُ الْمُـلْكِ", latin: "Malik-ul-Mulk", meaning: "Pemilik Kerajaan" },
  { number: 85, arabic: "ذُوالْجَلَالِ وَالْإِكْرَامِ", latin: "Dzul Jalal Wal Ikram", meaning: "Pemilik Keagungan dan Kemuliaan" },
  { number: 86, arabic: "الْمُقْسِطُ", latin: "Al-Muqsith", meaning: "Maha Pemberi Keadilan" },
  { number: 87, arabic: "الْجَامِعُ", latin: "Al-Jami'", meaning: "Maha Mengumpulkan" },
  { number: 88, arabic: "الْغَنِيُّ", latin: "Al-Ghaniyy", meaning: "Maha Kaya" },
  { number: 89, arabic: "الْمُغْنِي", latin: "Al-Mughni", meaning: "Maha Pemberi Kekayaan" },
  { number: 90, arabic: "الْمَانِعُ", latin: "Al-Mani'", meaning: "Maha Mencegah" },
  { number: 91, arabic: "الضَّارُّ", latin: "Adh-Dharr", meaning: "Maha Pemberi Derita" },
  { number: 92, arabic: "النَّافِعُ", latin: "An-Nafi'", meaning: "Maha Pemberi Manfaat" },
  { number: 93, arabic: "النُّوْرُ", latin: "An-Nur", meaning: "Maha Bercahaya" },
  { number: 94, arabic: "الْهَادِي", latin: "Al-Hadi", meaning: "Maha Pemberi Petunjuk" },
  { number: 95, arabic: "الْبَدِيْعُ", latin: "Al-Badi'", meaning: "Maha Pencipta Pertama" },
  { number: 96, arabic: "الْبَاقِي", latin: "Al-Baqi", meaning: "Maha Kekal" },
  { number: 97, arabic: "الْوَارِثُ", latin: "Al-Warits", meaning: "Maha Pewaris" },
  { number: 98, arabic: "الرَّشِيْدُ", latin: "Ar-Rasyid", meaning: "Maha Pandai" },
  { number: 99, arabic: "الصَّبُوْرُ", latin: "Ash-Shabur", meaning: "Maha Sabar" },
];

const AsmaulHusnaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredNames = asmaulHusnaData.filter(
    (name) =>
      name.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.number.toString().includes(searchQuery)
  );

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Asmaul Husna</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg text-center">
          <GiStarFormation className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-2">Asmaul Husna</h1>
          <p className="text-emerald-50 text-sm">
            99 Nama-Nama Allah Yang Maha Indah
          </p>
          <p className="font-arabic text-xl mt-3 opacity-90">
            وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
          </p>
          <p className="text-xs mt-2 opacity-75 italic">
            "Dan Allah memiliki Asmaul Husna (nama-nama yang terbaik), maka bermohonlah kepada-Nya dengan menyebut Asmaul Husna itu" (QS. Al-A'raf: 180)
          </p>
        </div>

        {/* Keutamaan */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BsStarFill className="w-5 h-5" />
            Keutamaan Menghafal Asmaul Husna
          </h3>
          <div className="bg-white rounded-xl p-4">
            <p className="font-arabic text-right text-lg leading-loose text-gray-800 mb-2">
              إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مِائَةً إِلَّا وَاحِدًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ
            </p>
            <p className="text-gray-700 text-sm italic">
              "Sesungguhnya Allah memiliki 99 nama, seratus kurang satu. Barangsiapa yang menghafalnya, maka ia akan masuk surga."
            </p>
            <p className="text-amber-600 text-xs font-semibold mt-2">HR. Bukhari & Muslim</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau arti..."
              className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredNames.length} nama ditemukan
            </p>
          )}
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNames.map((name) => (
            <div
              key={name.number}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-teal-200 group"
            >
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  {name.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-arabic text-right text-2xl text-gray-800 leading-loose">
                    {name.arabic}
                  </p>
                  <p className="font-bold text-teal-700 text-sm">{name.latin}</p>
                  <p className="text-gray-600 text-xs mt-1">{name.meaning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNames.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <FaSearch className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Tidak ada hasil untuk "{searchQuery}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga kita bisa menghafal dan mengamalkan Asmaul Husna
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ
          </p>
        </div>
      </div>
    </div>
  );
};

export default AsmaulHusnaPage;
