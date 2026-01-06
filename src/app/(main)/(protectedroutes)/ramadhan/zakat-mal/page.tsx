"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState } from "react";

// React Icons
import { FaGem, FaBriefcase, FaStore } from "react-icons/fa";
import { BsBank, BsCoin } from "react-icons/bs";
import { HiOutlineBookOpen, HiOutlineLightBulb } from "react-icons/hi";

const ZakatMalPage = () => {
  const [activeTab, setActiveTab] = useState<"emas" | "penghasilan" | "tabungan" | "perdagangan">("emas");
  
  // State untuk Zakat Emas
  const [beratEmas, setBeratEmas] = useState<number>(100);
  const [hargaEmas, setHargaEmas] = useState<number>(1000000);
  
  // State untuk Zakat Penghasilan
  const [penghasilanBulanan, setPenghasilanBulanan] = useState<number>(10000000);
  
  // State untuk Zakat Tabungan
  const [totalTabungan, setTotalTabungan] = useState<number>(100000000);
  
  // State untuk Zakat Perdagangan
  const [modalDagang, setModalDagang] = useState<number>(50000000);
  const [keuntungan, setKeuntungan] = useState<number>(10000000);
  const [hutangDagang, setHutangDagang] = useState<number>(5000000);
  
  // Nisab Emas = 85 gram
  const nisabEmas = 85;
  const nisabPerak = 595; // gram
  
  // Perhitungan
  const zakatEmas = beratEmas >= nisabEmas ? (beratEmas * hargaEmas * 2.5) / 100 : 0;
  const nisabPenghasilan = nisabEmas * hargaEmas; // Per tahun
  const penghasilanTahunan = penghasilanBulanan * 12;
  const zakatPenghasilan = penghasilanTahunan >= nisabPenghasilan ? (penghasilanBulanan * 2.5) / 100 : 0;
  const zakatTabungan = totalTabungan >= (nisabEmas * hargaEmas) ? (totalTabungan * 2.5) / 100 : 0;
  const asetBersihDagang = modalDagang + keuntungan - hutangDagang;
  const zakatPerdagangan = asetBersihDagang >= (nisabEmas * hargaEmas) ? (asetBersihDagang * 2.5) / 100 : 0;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Kalkulator Zakat Mal</TopBar>
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <FaGem className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Kalkulator Zakat Mal</h1>
              <p className="text-amber-50 text-sm">Hitung zakat harta Anda dengan mudah</p>
            </div>
          </div>
        </div>

        {/* Info Zakat Mal */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="w-5 h-5" />
            Tentang Zakat Mal
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Zakat Mal</strong> adalah zakat yang dikenakan atas harta yang dimiliki 
              oleh seorang muslim jika telah mencapai nisab dan haul.
            </p>
            <p>
              <strong>Nisab:</strong> Setara dengan 85 gram emas murni
            </p>
            <p>
              <strong>Haul:</strong> Kepemilikan harta selama 1 tahun hijriyah
            </p>
            <p>
              <strong>Kadar:</strong> 2.5% dari total harta
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: "emas", label: "Emas/Perak", icon: "🥇" },
              { id: "penghasilan", label: "Penghasilan", icon: "💼" },
              { id: "tabungan", label: "Tabungan", icon: "🏦" },
              { id: "perdagangan", label: "Perdagangan", icon: "🏪" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zakat Emas */}
        {activeTab === "emas" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🥇</span>
                Zakat Emas & Perak
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Emas (gram)
                  </label>
                  <input
                    type="number"
                    value={beratEmas}
                    onChange={(e) => setBeratEmas(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nisab emas: {nisabEmas} gram
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Emas per Gram (Rp)
                  </label>
                  <input
                    type="number"
                    value={hargaEmas}
                    onChange={(e) => setHargaEmas(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>

            {/* Hasil */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              beratEmas >= nisabEmas 
                ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}>
              <h3 className="text-lg font-bold mb-4 text-center">
                {beratEmas >= nisabEmas ? "Zakat yang Harus Dibayar" : "Belum Wajib Zakat"}
              </h3>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <p className="text-3xl font-bold mb-2">{formatRupiah(zakatEmas)}</p>
                {beratEmas >= nisabEmas && (
                  <p className="text-sm opacity-90">
                    2.5% × {beratEmas}g × {formatRupiah(hargaEmas)}
                  </p>
                )}
              </div>
              
              {beratEmas < nisabEmas && (
                <p className="text-center text-sm mt-3 opacity-90">
                  Emas Anda belum mencapai nisab ({nisabEmas} gram)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Zakat Penghasilan */}
        {activeTab === "penghasilan" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💼</span>
                Zakat Penghasilan (Profesi)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penghasilan Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    value={penghasilanBulanan}
                    onChange={(e) => setPenghasilanBulanan(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="10000000"
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Nisab Zakat Penghasilan:</strong><br/>
                    {formatRupiah(nisabPenghasilan)} / tahun<br/>
                    ({formatRupiah(nisabPenghasilan / 12)} / bulan)
                  </p>
                </div>
              </div>
            </div>

            {/* Hasil */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              penghasilanTahunan >= nisabPenghasilan 
                ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}>
              <h3 className="text-lg font-bold mb-4 text-center">
                {penghasilanTahunan >= nisabPenghasilan ? "Zakat Bulanan yang Harus Dibayar" : "Belum Wajib Zakat"}
              </h3>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <p className="text-3xl font-bold mb-2">{formatRupiah(zakatPenghasilan)}</p>
                <p className="text-sm opacity-90">per bulan</p>
              </div>
              
              {penghasilanTahunan >= nisabPenghasilan && (
                <div className="bg-white/10 rounded-lg p-3 mt-3 text-center text-sm">
                  Zakat Tahunan: {formatRupiah(zakatPenghasilan * 12)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Zakat Tabungan */}
        {activeTab === "tabungan" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏦</span>
                Zakat Tabungan
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tabungan (Rp)
                  </label>
                  <input
                    type="number"
                    value={totalTabungan}
                    onChange={(e) => setTotalTabungan(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="100000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total saldo yang sudah dimiliki selama 1 tahun (haul)
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Nisab:</strong> {formatRupiah(nisabEmas * hargaEmas)}<br/>
                    <span className="text-xs">(Setara 85 gram emas)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hasil */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              totalTabungan >= (nisabEmas * hargaEmas) 
                ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}>
              <h3 className="text-lg font-bold mb-4 text-center">
                {totalTabungan >= (nisabEmas * hargaEmas) ? "Zakat yang Harus Dibayar" : "Belum Wajib Zakat"}
              </h3>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <p className="text-3xl font-bold mb-2">{formatRupiah(zakatTabungan)}</p>
                {totalTabungan >= (nisabEmas * hargaEmas) && (
                  <p className="text-sm opacity-90">
                    2.5% × {formatRupiah(totalTabungan)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Zakat Perdagangan */}
        {activeTab === "perdagangan" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏪</span>
                Zakat Perdagangan
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modal + Stok Barang (Rp)
                  </label>
                  <input
                    type="number"
                    value={modalDagang}
                    onChange={(e) => setModalDagang(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keuntungan (Rp)
                  </label>
                  <input
                    type="number"
                    value={keuntungan}
                    onChange={(e) => setKeuntungan(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hutang Dagang (Rp)
                  </label>
                  <input
                    type="number"
                    value={hutangDagang}
                    onChange={(e) => setHutangDagang(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Aset Bersih:</strong> {formatRupiah(asetBersihDagang)}<br/>
                    <span className="text-xs">(Modal + Keuntungan - Hutang)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hasil */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              asetBersihDagang >= (nisabEmas * hargaEmas) 
                ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}>
              <h3 className="text-lg font-bold mb-4 text-center">
                {asetBersihDagang >= (nisabEmas * hargaEmas) ? "Zakat yang Harus Dibayar" : "Belum Wajib Zakat"}
              </h3>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <p className="text-3xl font-bold mb-2">{formatRupiah(zakatPerdagangan)}</p>
                {asetBersihDagang >= (nisabEmas * hargaEmas) && (
                  <p className="text-sm opacity-90">
                    2.5% × {formatRupiah(asetBersihDagang)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mt-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Catatan Penting
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Zakat mal wajib jika harta sudah mencapai nisab dan haul (1 tahun)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Kadar zakat mal adalah 2.5% dari total harta
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Perhitungan nisab menggunakan harga emas terkini
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Konsultasikan dengan amil zakat untuk perhitungan yang lebih akurat
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga zakat harta kita menjadi pembersih dan keberkahan
          </p>
          <p className="text-amber-600 font-semibold mt-2 font-arabic text-lg">
            وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Dan dirikanlah sholat, tunaikanlah zakat" (QS. Al-Baqarah: 43)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZakatMalPage;
