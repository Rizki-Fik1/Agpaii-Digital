"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState } from "react";

// React Icons
import { FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { HiOutlineBookOpen, HiOutlineCalculator, HiOutlineLightBulb } from "react-icons/hi";
import { GiWheat } from "react-icons/gi";
import { BsCashStack } from "react-icons/bs";

const ZakatPage = () => {
  const [hargaBeras, setHargaBeras] = useState<number>(15000);
  const [jumlahJiwa, setJumlahJiwa] = useState<number>(1);
  const [metodeBayar, setMetodeBayar] = useState<"beras" | "uang">("uang");

  // Zakat fitrah = 2.5 kg atau 3.5 liter beras per jiwa
  const beratPerJiwa = 2.5; // kg
  const totalBeras = beratPerJiwa * jumlahJiwa;
  const totalUang = hargaBeras * beratPerJiwa * jumlahJiwa;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Zakat Fitrah</TopBar>
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <FaMoneyBillWave className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Kalkulator Zakat Fitrah</h1>
              <p className="text-emerald-50 text-sm">Hitung zakat fitrah Anda dengan mudah</p>
            </div>
          </div>
        </div>

        {/* Info Zakat Fitrah */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Tentang Zakat Fitrah
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Zakat Fitrah</strong> adalah zakat yang wajib dikeluarkan oleh setiap muslim 
              menjelang Idul Fitri sebagai penyuci diri dari perbuatan sia-sia selama Ramadhan.
            </p>
            <p>
              <strong>Waktu:</strong> Sejak awal Ramadhan hingga sebelum sholat Idul Fitri 
              (paling utama 1-2 hari sebelum Idul Fitri).
            </p>
            <p>
              <strong>Besaran:</strong> 1 sha' atau sekitar <strong>2.5 kg</strong> makanan pokok 
              (beras) per jiwa.
            </p>
          </div>
        </div>

        {/* Kalkulator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineCalculator className="w-5 h-5 text-teal-600" />
            Hitung Zakat Fitrah
          </h3>

          <div className="space-y-4">
            {/* Jumlah Jiwa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Jiwa yang Dizakati
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setJumlahJiwa(Math.max(1, jumlahJiwa - 1))}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl text-xl font-bold transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={jumlahJiwa}
                  onChange={(e) => setJumlahJiwa(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center text-2xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={() => setJumlahJiwa(jumlahJiwa + 1)}
                  className="w-12 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xl font-bold transition"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Termasuk kepala keluarga, istri, dan anak-anak
              </p>
            </div>

            {/* Harga Beras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Beras per Kg (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={hargaBeras}
                  onChange={(e) => setHargaBeras(parseInt(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="15000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sesuaikan dengan harga beras yang biasa dikonsumsi
              </p>
            </div>

            {/* Metode Bayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMetodeBayar("uang")}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    metodeBayar === "uang"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <BsCashStack className="w-6 h-6 text-green-600" />
                  <span className={`text-sm font-medium ${
                    metodeBayar === "uang" ? "text-teal-700" : "text-gray-600"
                  }`}>
                    Uang Tunai
                  </span>
                </button>
                <button
                  onClick={() => setMetodeBayar("beras")}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    metodeBayar === "beras"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <GiWheat className="w-6 h-6 text-amber-600" />
                  <span className={`text-sm font-medium ${
                    metodeBayar === "beras" ? "text-teal-700" : "text-gray-600"
                  }`}>
                    Beras
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Perhitungan */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-center">Zakat Fitrah yang Harus Dibayar</h3>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center mb-4">
            {metodeBayar === "uang" ? (
              <>
                <p className="text-4xl font-bold mb-2">{formatRupiah(totalUang)}</p>
                <p className="text-emerald-100 text-sm">
                  ({jumlahJiwa} jiwa × {beratPerJiwa} kg × {formatRupiah(hargaBeras)})
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold mb-2">{totalBeras} kg</p>
                <p className="text-emerald-100 text-sm">
                  ({jumlahJiwa} jiwa × {beratPerJiwa} kg beras)
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{jumlahJiwa}</p>
              <p className="text-xs text-emerald-100">Jiwa</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{totalBeras} kg</p>
              <p className="text-xs text-emerald-100">Total Beras</p>
            </div>
          </div>
        </div>

        {/* Penerima Zakat */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FaUsers className="w-5 h-5 text-teal-600" />
            8 Golongan Penerima Zakat (Asnaf)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { nama: "Fakir", icon: "👤" },
              { nama: "Miskin", icon: "🏠" },
              { nama: "Amil", icon: "📝" },
              { nama: "Muallaf", icon: "🤲" },
              { nama: "Riqab", icon: "⛓️" },
              { nama: "Gharimin", icon: "💳" },
              { nama: "Fi Sabilillah", icon: "🕌" },
              { nama: "Ibnu Sabil", icon: "🧳" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span>{item.icon}</span>
                <span className="text-sm text-gray-700">{item.nama}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dalil */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200 mb-6">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Dalil Zakat Fitrah
          </h3>
          <p className="font-arabic text-right text-lg leading-loose text-gray-800 mb-2">
            فَرَضَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ زَكَاةَ الْفِطْرِ صَاعًا مِنْ تَمْرٍ أَوْ صَاعًا مِنْ شَعِيرٍ
          </p>
          <p className="text-sm text-gray-700 italic">
            "Rasulullah SAW mewajibkan zakat fitrah satu sha' kurma atau satu sha' gandum."
          </p>
          <p className="text-purple-600 text-xs font-semibold mt-2">HR. Bukhari & Muslim</p>
        </div>

        {/* Catatan */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Catatan Penting
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Zakat fitrah wajib dikeluarkan sebelum sholat Idul Fitri
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Kepala keluarga wajib mengeluarkan zakat untuk seluruh anggota keluarga
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Makanan pokok yang dikeluarkan sesuai dengan yang biasa dikonsumsi
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Jika membayar dengan uang, nilainya setara dengan 2.5 kg beras
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga zakat kita diterima dan membersihkan jiwa
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Ambillah zakat dari sebagian harta mereka, yang dengan zakat itu kamu membersihkan dan menyucikan mereka" (QS. At-Taubah: 103)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZakatPage;
