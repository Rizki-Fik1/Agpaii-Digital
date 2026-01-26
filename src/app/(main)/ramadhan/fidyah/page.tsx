import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { HiOutlineClipboardList, HiOutlineBookOpen, HiOutlineLightBulb, HiOutlineCheckCircle } from "react-icons/hi";
import { FaMoneyBillWave, FaFileAlt, FaRegEdit } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const fidyahData = {
  pengertian: {
    title: "Pengertian Fidyah",
    description: "Fidyah adalah memberi makan kepada fakir miskin sebagai pengganti puasa yang tidak dapat diqadha. Fidyah diperuntukkan bagi orang yang tidak mampu berpuasa dan tidak akan pernah mampu mengqadha puasanya."
  },
  yangWajibFidyah: [
    {
      kategori: "Orang Tua Renta",
      description: "Lansia yang sudah tidak kuat berpuasa",
      icon: "👴"
    },
    {
      kategori: "Sakit Menahun",
      description: "Penyakit kronis yang tidak ada harapan sembuh",
      icon: "🏥"
    },
    {
      kategori: "Wanita Hamil/Menyusui",
      description: "Yang khawatir terhadap anaknya (menurut sebagian ulama)",
      icon: "🤰"
    },
  ],
  yangTidakWajibFidyah: [
    {
      kategori: "Orang Sakit yang Bisa Sembuh",
      description: "Wajib qadha setelah sembuh, tidak perlu fidyah",
      icon: "💊"
    },
    {
      kategori: "Musafir",
      description: "Wajib qadha setelah sampai tujuan, tidak perlu fidyah",
      icon: "✈️"
    },
    {
      kategori: "Wanita Haid/Nifas",
      description: "Wajib qadha, tidak perlu fidyah",
      icon: "🩸"
    },
  ],
  besaranFidyah: {
    title: "Besaran Fidyah",
    jumlah: "1 mud = ±750 gram beras atau ±3/4 liter beras",
    perHari: "1 mud untuk setiap hari puasa yang ditinggalkan",
    contoh: "Jika meninggalkan 30 hari puasa = 30 mud = ±22.5 kg beras",
    uang: "Bisa dikonversi ke uang senilai makanan tersebut"
  },
  caraBayar: [
    {
      cara: "Memberikan Makanan Langsung",
      description: "Memberikan makanan matang atau bahan makanan kepada fakir miskin"
    },
    {
      cara: "Melalui Lembaga Zakat",
      description: "Membayar ke lembaga amil zakat yang terpercaya"
    },
    {
      cara: "Uang Tunai Senilai Makanan",
      description: "Dikonversi ke uang senilai 1 mud makanan pokok"
    },
  ],
  dalil: {
    arabic: "وَعَلَى الَّذِينَ يُطِيقُونَهُ فِدْيَةٌ طَعَامُ مِسْكِينٍ",
    translation: "Dan bagi orang yang berat menjalankannya, wajib membayar fidyah, yaitu memberi makan seorang miskin.",
    source: "QS. Al-Baqarah: 184"
  },
  perhitungan: {
    hargaBerasPerKg: 15000,
    mudDalamKg: 0.75,
  },
  catatan: [
    "Fidyah berbeda dengan kaffarah. Fidyah untuk yang tidak mampu berpuasa, kaffarah untuk yang sengaja membatalkan",
    "Fidyah boleh dibayarkan sekaligus di awal atau akhir Ramadhan",
    "Fidyah diberikan kepada fakir miskin, boleh satu orang menerima untuk banyak hari",
    "Besaran fidyah mengikuti makanan pokok yang biasa dikonsumsi"
  ]
};

const FidyahPage = () => {
  const hitungFidyah = (hari: number) => {
    return hari * fidyahData.perhitungan.mudDalamKg * fidyahData.perhitungan.hargaBerasPerKg;
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Panduan Fidyah</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineClipboardList className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Panduan Fidyah</h1>
              <p className="text-emerald-50 text-sm">Pengganti puasa bagi yang tidak mampu</p>
            </div>
          </div>
        </div>

        {/* Pengertian */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5 text-teal-600" />
            {fidyahData.pengertian.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {fidyahData.pengertian.description}
          </p>
        </div>

        {/* Dalil */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-6 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <FaFileAlt className="w-5 h-5" />
            Dalil Fidyah
          </h3>
          <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">
            {fidyahData.dalil.arabic}
          </p>
          <p className="text-gray-700 italic text-sm mb-2">
            "{fidyahData.dalil.translation}"
          </p>
          <p className="text-purple-600 text-xs font-semibold">
            {fidyahData.dalil.source}
          </p>
        </div>

        {/* Yang Wajib Fidyah */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HiOutlineCheckCircle className="w-5 h-5" />
              Yang Wajib Membayar Fidyah
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {fidyahData.yangWajibFidyah.map((item, index) => (
              <div key={index} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-amber-800">{item.kategori}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yang Tidak Wajib Fidyah */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MdCancel className="w-5 h-5" />
              Yang Tidak Wajib Fidyah (Cukup Qadha)
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {fidyahData.yangTidakWajibFidyah.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.kategori}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Besaran Fidyah */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="w-6 h-6" />
            {fidyahData.besaranFidyah.title}
          </h3>
          
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="font-bold text-lg">{fidyahData.besaranFidyah.jumlah}</p>
              <p className="text-emerald-100 text-sm">{fidyahData.besaranFidyah.perHari}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm">{fidyahData.besaranFidyah.contoh}</p>
            </div>

            {/* Tabel Perhitungan */}
            <div className="bg-white rounded-xl p-4 text-gray-800">
              <h4 className="font-bold text-teal-700 mb-3">Estimasi Biaya Fidyah:</h4>
              <div className="space-y-2">
                {[1, 5, 10, 30].map((hari) => (
                  <div key={hari} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm">{hari} hari puasa</span>
                    <span className="font-bold text-teal-700">{formatRupiah(hitungFidyah(hari))}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * Berdasarkan harga beras {formatRupiah(fidyahData.perhitungan.hargaBerasPerKg)}/kg
              </p>
            </div>
          </div>
        </div>

        {/* Cara Membayar */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaRegEdit className="w-5 h-5" />
              Cara Membayar Fidyah
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {fidyahData.caraBayar.map((item, index) => (
              <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800">{item.cara}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan Penting */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 mb-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Catatan Penting
          </h3>
          <ul className="space-y-2">
            {fidyahData.catatan.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga panduan ini bermanfaat
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            فَمَن تَطَوَّعَ خَيْرًا فَهُوَ خَيْرٌ لَّهُ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Dan barangsiapa mengerjakan kebaikan dengan sukarela, maka itu lebih baik baginya" (QS. Al-Baqarah: 184)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FidyahPage;
