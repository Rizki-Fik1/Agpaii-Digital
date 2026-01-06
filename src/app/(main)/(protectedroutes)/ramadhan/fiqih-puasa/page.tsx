"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState } from "react";

// React Icons
import { HiOutlineBookOpen, HiOutlineClipboardList } from "react-icons/hi";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { BsStarFill, BsTicketPerforated } from "react-icons/bs";
import { FaMoneyBillWave, FaBalanceScale } from "react-icons/fa";

const fiqihPuasaData = {
  definisi: {
    title: "Pengertian Puasa",
    description: "Puasa dalam bahasa Arab disebut 'Ash-Shaum' yang berarti menahan diri. Secara istilah, puasa adalah menahan diri dari makan, minum, dan hal-hal yang membatalkan puasa dari terbit fajar hingga terbenam matahari dengan niat ibadah kepada Allah SWT."
  },
  rukunPuasa: [
    {
      title: "Niat",
      description: "Berniat di malam hari sebelum fajar untuk puasa wajib",
      detail: "Niat harus dilakukan setiap malam untuk puasa Ramadhan"
    },
    {
      title: "Menahan Diri",
      description: "Menahan dari hal-hal yang membatalkan puasa",
      detail: "Dari terbit fajar shadiq hingga terbenam matahari"
    },
  ],
  syaratWajib: [
    { syarat: "Islam", penjelasan: "Puasa tidak wajib bagi non-Muslim" },
    { syarat: "Baligh", penjelasan: "Sudah mencapai usia dewasa (mukallaf)" },
    { syarat: "Berakal", penjelasan: "Memiliki akal yang sehat" },
    { syarat: "Mampu", penjelasan: "Mampu berpuasa secara fisik dan mental" },
    { syarat: "Mukim", penjelasan: "Tidak dalam perjalanan (boleh tidak puasa bagi musafir)" },
    { syarat: "Suci dari Haid/Nifas", penjelasan: "Bagi wanita, tidak sedang haid atau nifas" },
  ],
  syaratSah: [
    { syarat: "Islam", penjelasan: "Orang yang berpuasa harus beragama Islam" },
    { syarat: "Tamyiz", penjelasan: "Mampu membedakan yang baik dan buruk" },
    { syarat: "Suci dari Haid/Nifas", penjelasan: "Wanita harus suci dari haid dan nifas" },
    { syarat: "Dalam Waktu yang Tepat", penjelasan: "Bukan pada hari yang diharamkan puasa" },
  ],
  yangMembatalkan: [
    {
      hal: "Makan dan Minum dengan Sengaja",
      hukum: "Batal dan wajib qadha",
      icon: "🍽️"
    },
    {
      hal: "Hubungan Suami Istri",
      hukum: "Batal, wajib qadha dan kaffarah",
      icon: "👫"
    },
    {
      hal: "Mengeluarkan Mani dengan Sengaja",
      hukum: "Batal dan wajib qadha",
      icon: "⚠️"
    },
    {
      hal: "Muntah dengan Sengaja",
      hukum: "Batal dan wajib qadha",
      icon: "🤢"
    },
    {
      hal: "Haid atau Nifas",
      hukum: "Batal dan wajib qadha",
      icon: "🩸"
    },
    {
      hal: "Gila/Hilang Akal",
      hukum: "Batal",
      icon: "🧠"
    },
    {
      hal: "Murtad (Keluar dari Islam)",
      hukum: "Batal",
      icon: "⛔"
    },
    {
      hal: "Berniat Membatalkan Puasa",
      hukum: "Batal menurut mayoritas ulama",
      icon: "💭"
    },
  ],
  yangTidakMembatalkan: [
    { hal: "Makan/minum karena lupa", penjelasan: "Lanjutkan puasa, tidak perlu qadha" },
    { hal: "Muntah tanpa sengaja", penjelasan: "Puasa tetap sah" },
    { hal: "Mimpi basah", penjelasan: "Puasa tetap sah, wajib mandi junub" },
    { hal: "Berbekam/donor darah", penjelasan: "Menurut jumhur ulama tidak membatalkan" },
    { hal: "Berkumur dan istinsyaq", penjelasan: "Sah selama tidak masuk ke tenggorokan" },
    { hal: "Mencicipi makanan tanpa menelan", penjelasan: "Sah jika tidak masuk ke tenggorokan" },
    { hal: "Memakai parfum", penjelasan: "Tidak membatalkan puasa" },
    { hal: "Suntikan/infus non-nutrisi", penjelasan: "Tidak membatalkan menurut banyak ulama" },
  ],
  sunnahPuasa: [
    { sunnah: "Menyegerakan berbuka", icon: "⏰" },
    { sunnah: "Mengakhirkan sahur", icon: "🌙" },
    { sunnah: "Berbuka dengan kurma atau air", icon: "🌴" },
    { sunnah: "Berdoa saat berbuka", icon: "🤲" },
    { sunnah: "Memperbanyak sedekah", icon: "💰" },
    { sunnah: "Memperbanyak membaca Al-Qur'an", icon: "📖" },
    { sunnah: "Menjaga lisan dari perkataan buruk", icon: "🤐" },
    { sunnah: "Sholat tarawih", icon: "🕌" },
  ],
  makruhPuasa: [
    "Berlebihan dalam berkumur dan memasukkan air ke hidung",
    "Mencicipi makanan tanpa keperluan",
    "Menyimpan sesuatu di mulut",
    "Berciuman yang dapat membangkitkan syahwat",
    "Berbekam (menurut sebagian ulama)",
  ],
  bolehTidakPuasa: [
    {
      kategori: "Orang Sakit",
      ketentuan: "Boleh tidak puasa, wajib qadha setelah sembuh",
      icon: "🏥"
    },
    {
      kategori: "Musafir",
      ketentuan: "Boleh tidak puasa dengan perjalanan minimal 80 km, wajib qadha",
      icon: "✈️"
    },
    {
      kategori: "Wanita Hamil/Menyusui",
      ketentuan: "Boleh tidak puasa jika khawatir, qadha atau fidyah",
      icon: "🤰"
    },
    {
      kategori: "Orang Tua Renta",
      ketentuan: "Boleh tidak puasa, wajib fidyah",
      icon: "👴"
    },
    {
      kategori: "Wanita Haid/Nifas",
      ketentuan: "Haram puasa, wajib qadha",
      icon: "🩸"
    },
  ],
  fidyah: {
    title: "Fidyah",
    description: "Fidyah adalah memberi makan satu orang miskin untuk setiap hari puasa yang ditinggalkan. Fidyah diberikan oleh mereka yang tidak mampu berpuasa dan tidak sanggup mengqadha.",
    jumlah: "1 mud makanan pokok (±750 gram beras) per hari"
  },
  kaffarah: {
    title: "Kaffarah",
    description: "Kaffarah adalah denda yang wajib dibayar karena sengaja membatalkan puasa Ramadhan dengan hubungan suami istri.",
    urutan: [
      "Memerdekakan seorang budak",
      "Jika tidak mampu, puasa 2 bulan berturut-turut",
      "Jika tidak mampu, memberi makan 60 orang miskin"
    ]
  }
};

const FiqihPuasaPage = () => {
  const [activeSection, setActiveSection] = useState<string>("pembatal");

  const sections = [
    { id: "pembatal", label: "Yang Membatalkan", icon: "❌" },
    { id: "tidak-batal", label: "Tidak Membatalkan", icon: "✅" },
    { id: "rukun", label: "Rukun & Syarat", icon: "📋" },
    { id: "sunnah", label: "Sunnah", icon: "⭐" },
    { id: "rukhsah", label: "Rukhsah", icon: "🎫" },
  ];

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Fiqih Puasa</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineBookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Fiqih Puasa</h1>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            {fiqihPuasaData.definisi.description}
          </p>
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-2 px-4 rounded-xl font-medium text-sm transition whitespace-nowrap flex items-center gap-1 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yang Membatalkan */}
        {activeSection === "pembatal" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-5 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>❌</span>
                  Hal-Hal yang Membatalkan Puasa
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {fiqihPuasaData.yangMembatalkan.map((item, index) => (
                  <div key={index} className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-red-800">{item.hal}</h4>
                        <p className="text-sm text-gray-600">{item.hukum}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kaffarah */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span>⚖️</span>
                {fiqihPuasaData.kaffarah.title}
              </h3>
              <p className="text-sm text-gray-700 mb-3">{fiqihPuasaData.kaffarah.description}</p>
              <div className="space-y-2">
                {fiqihPuasaData.kaffarah.urutan.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                    <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Yang Tidak Membatalkan */}
        {activeSection === "tidak-batal" && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MdCheckCircle className="w-5 h-5" />
                Hal-Hal yang Tidak Membatalkan Puasa
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {fiqihPuasaData.yangTidakMembatalkan.map((item, index) => (
                <div key={index} className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-bold text-green-800 mb-1">{item.hal}</h4>
                  <p className="text-sm text-gray-600">{item.penjelasan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rukun & Syarat */}
        {activeSection === "rukun" && (
          <div className="space-y-4">
            {/* Rukun */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📋</span>
                  Rukun Puasa
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {fiqihPuasaData.rukunPuasa.map((item, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800">{item.title}</h4>
                        <p className="text-sm text-gray-700">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Syarat Wajib */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
                <h2 className="text-lg font-bold text-white">Syarat Wajib Puasa</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-2">
                {fiqihPuasaData.syaratWajib.map((item, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-3">
                    <h4 className="font-bold text-purple-800 text-sm">{item.syarat}</h4>
                    <p className="text-xs text-gray-600">{item.penjelasan}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Syarat Sah */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-4">
                <h2 className="text-lg font-bold text-white">Syarat Sah Puasa</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-2">
                {fiqihPuasaData.syaratSah.map((item, index) => (
                  <div key={index} className="bg-teal-50 rounded-lg p-3">
                    <h4 className="font-bold text-teal-800 text-sm">{item.syarat}</h4>
                    <p className="text-xs text-gray-600">{item.penjelasan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sunnah */}
        {activeSection === "sunnah" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⭐</span>
                  Sunnah-Sunnah Puasa
                </h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                {fiqihPuasaData.sunnahPuasa.map((item, index) => (
                  <div key={index} className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm text-gray-700">{item.sunnah}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-5 py-4">
                <h2 className="text-lg font-bold text-white">Hal-Hal Makruh Saat Puasa</h2>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {fiqihPuasaData.makruhPuasa.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Rukhsah */}
        {activeSection === "rukhsah" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎫</span>
                  Yang Boleh Tidak Puasa (Rukhsah)
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {fiqihPuasaData.bolehTidakPuasa.map((item, index) => (
                  <div key={index} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-indigo-800">{item.kategori}</h4>
                        <p className="text-sm text-gray-600">{item.ketentuan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fidyah */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <span>💰</span>
                {fiqihPuasaData.fidyah.title}
              </h3>
              <p className="text-sm text-gray-700 mb-2">{fiqihPuasaData.fidyah.description}</p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium text-emerald-700">
                  Jumlah: {fiqihPuasaData.fidyah.jumlah}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga bermanfaat dalam memahami fiqih puasa
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa" (QS. Al-Baqarah: 183)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FiqihPuasaPage;
