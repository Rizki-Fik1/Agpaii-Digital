import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { HiOutlineBookOpen, HiOutlineClock, HiOutlineAcademicCap } from "react-icons/hi";
import { BsStarFill, BsBookHalf } from "react-icons/bs";
import { MdMosque, MdCelebration } from "react-icons/md";
import { RiHandHeartLine } from "react-icons/ri";
import { FaMoneyBillWave } from "react-icons/fa";

const KajianPage = () => {
  const topik = [
    {
      title: "Fiqih Puasa",
      materi: ["Rukun & Syarat Puasa", "Pembatal Puasa", "Sunnah Puasa", "Rukhsah Puasa"],
      icon: "📖"
    },
    {
      title: "Keutamaan Ramadhan",
      materi: ["Bulan Al-Qur'an", "Pintu Surga Dibuka", "Lailatul Qadar", "Pahala Berlipat"],
      icon: "⭐"
    },
    {
      title: "Tazkiyatun Nafs",
      materi: ["Penyucian Jiwa", "Muhasabah Diri", "Taubat Nasuha", "Akhlak Mahmudah"],
      icon: "💝"
    },
    {
      title: "Ibadah Ramadhan",
      materi: ["Sholat Tarawih", "Qiyamul Lail", "I'tikaf", "Tadarus Al-Qur'an"],
      icon: "🕌"
    },
    {
      title: "Zakat & Sedekah",
      materi: ["Zakat Fitrah", "Zakat Mal", "Keutamaan Sedekah", "Adab Bersedekah"],
      icon: "💰"
    },
    {
      title: "Persiapan Idul Fitri",
      materi: ["Takbir Hari Raya", "Sholat Ied", "Silaturahmi", "Puasa Syawal"],
      icon: "🎉"
    },
  ];

  const jadwalHarian = [
    { waktu: "Setelah Subuh", kegiatan: "Tadarus & Dzikir Pagi" },
    { waktu: "Pagi", kegiatan: "Kajian Online/Podcast" },
    { waktu: "Setelah Dzuhur", kegiatan: "Membaca Buku Islami" },
    { waktu: "Setelah Ashar", kegiatan: "Dzikir Petang" },
    { waktu: "Sebelum Maghrib", kegiatan: "Doa & Persiapan Buka" },
    { waktu: "Setelah Tarawih", kegiatan: "Mengulang Hafalan" },
  ];

  const referensi = [
    { judul: "Fiqih Sunnah - Sayyid Sabiq", kategori: "Fiqih" },
    { judul: "Riyadhus Shalihin - Imam Nawawi", kategori: "Hadits" },
    { judul: "Tafsir Ibnu Katsir", kategori: "Tafsir" },
    { judul: "Talbis Iblis - Ibnul Jauzi", kategori: "Akhlak" },
  ];

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Kajian Ramadhan</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineAcademicCap className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Kajian Ramadhan</h1>
          </div>
          <p className="text-emerald-50 text-sm">
            Tingkatkan ilmu agama di bulan penuh berkah
          </p>
        </div>

        {/* Topik Kajian */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><HiOutlineBookOpen className="w-5 h-5 text-teal-600" /> Topik-Topik Kajian</h2>
          <div className="grid grid-cols-2 gap-3">
            {topik.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                </div>
                <ul className="space-y-1">
                  {item.materi.map((m, j) => (
                    <li key={j} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-teal-500">•</span>{m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Harian */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><HiOutlineClock className="w-5 h-5 text-teal-600" /> Jadwal Ibadah Harian</h2>
          <div className="space-y-2">
            {jadwalHarian.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-800 text-sm">{item.waktu}</span>
                <span className="text-sm text-teal-600">{item.kegiatan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referensi */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 mb-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><BsBookHalf className="w-5 h-5" /> Referensi Bacaan</h3>
          <div className="grid grid-cols-2 gap-2">
            {referensi.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-3">
                <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                <p className="text-xs text-amber-600">{item.kategori}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">Tingkatkan ilmu, tingkatkan amal</p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">وَقُلْ رَبِّ زِدْنِي عِلْمًا</p>
          <p className="text-gray-500 text-xs mt-1 italic">"Dan katakanlah: Ya Tuhanku, tambahkanlah kepadaku ilmu" (QS. Ta Ha: 114)</p>
        </div>
      </div>
    </div>
  );
};

export default KajianPage;
