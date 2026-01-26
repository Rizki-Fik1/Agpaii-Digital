"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";

// React Icons
import { BsBookHalf, BsCheckCircleFill, BsListCheck } from "react-icons/bs";
import { HiOutlineLightBulb, HiOutlineInformationCircle } from "react-icons/hi";
import { FaBookOpen, FaCheckCircle, FaRegFileAlt } from "react-icons/fa";
import { MdCelebration } from "react-icons/md";
import { BiTargetLock } from "react-icons/bi";

interface TadarusProgress {
  [key: number]: boolean;
}

const tadarusData = {
  juzList: Array.from({ length: 30 }, (_, i) => ({
    juz: i + 1,
    startSurah: getStartSurah(i + 1),
    pages: `${(i * 20) + 1} - ${(i + 1) * 20}`,
  })),
  tips: [
    "Tentukan waktu tetap untuk tadarus setiap hari",
    "Mulai dengan membaca ta'awudz dan bismillah",
    "Baca dengan tartil dan tadabbur (merenungkan makna)",
    "Jika memungkinkan, dengarkan murottal untuk memperbaiki bacaan",
    "Ajak keluarga untuk tadarus bersama",
  ]
};

function getStartSurah(juz: number): string {
  const juzMapping: { [key: number]: string } = {
    1: "Al-Fatihah - Al-Baqarah",
    2: "Al-Baqarah (142-252)",
    3: "Al-Baqarah - Ali 'Imran",
    4: "Ali 'Imran - An-Nisa'",
    5: "An-Nisa' (24-147)",
    6: "An-Nisa' - Al-Ma'idah",
    7: "Al-Ma'idah - Al-An'am",
    8: "Al-An'am - Al-A'raf",
    9: "Al-A'raf - Al-Anfal",
    10: "Al-Anfal - At-Taubah",
    11: "At-Taubah - Hud",
    12: "Hud - Yusuf",
    13: "Yusuf - Ibrahim",
    14: "Al-Hijr - An-Nahl",
    15: "Al-Isra' - Al-Kahf",
    16: "Al-Kahf - Ta Ha",
    17: "Al-Anbiya' - Al-Hajj",
    18: "Al-Mu'minun - Al-Furqan",
    19: "Al-Furqan - An-Naml",
    20: "An-Naml - Al-'Ankabut",
    21: "Al-'Ankabut - Al-Ahzab",
    22: "Al-Ahzab - Ya Sin",
    23: "Ya Sin - Az-Zumar",
    24: "Az-Zumar - Fussilat",
    25: "Fussilat - Al-Jatsiyah",
    26: "Al-Ahqaf - Adz-Dzariyat",
    27: "Adz-Dzariyat - Al-Hadid",
    28: "Al-Mujadalah - At-Tahrim",
    29: "Al-Mulk - Al-Mursalat",
    30: "An-Naba' - An-Nas",
  };
  return juzMapping[juz] || "";
}

const TadarusPage = () => {
  const [progress, setProgress] = useState<TadarusProgress>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("tadarusProgress");
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const toggleJuz = (juz: number) => {
    const newProgress = { ...progress, [juz]: !progress[juz] };
    setProgress(newProgress);
    localStorage.setItem("tadarusProgress", JSON.stringify(newProgress));
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("tadarusProgress");
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  // Calculate current day of Ramadhan (estimation)
  const ramadhanStart = new Date("2026-02-28");
  const today = new Date();
  const diffTime = today.getTime() - ramadhanStart.getTime();
  const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isRamadhan = currentDay > 0 && currentDay <= 30;

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Tadarus 30 Hari</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <BsBookHalf className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Tadarus 30 Hari</h1>
              <p className="text-emerald-50 text-sm">Target Khatam Al-Qur'an Ramadhan</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-4 mt-4 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>{completedCount}/30 Juz</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <FaBookOpen className="w-8 h-8 mx-auto mb-1 text-teal-500" />
            <p className="text-2xl font-bold text-teal-600">{completedCount}</p>
            <p className="text-xs text-gray-600">Juz Selesai</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <FaRegFileAlt className="w-8 h-8 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600">{30 - completedCount}</p>
            <p className="text-xs text-gray-600">Juz Tersisa</p>
          </div>
        </div>

        {/* Recommended Juz for Today */}
        {isRamadhan && mounted && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200">
            <div className="flex items-center gap-3">
              <BiTargetLock className="w-6 h-6 text-amber-600" />
              <div>
                <h4 className="font-bold text-amber-800">Target Hari Ini (Hari ke-{currentDay})</h4>
                <p className="text-sm text-gray-700">
                  Baca Juz {currentDay} - {getStartSurah(currentDay)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Juz Checklist */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BsCheckCircleFill className="w-5 h-5" />
              Checklist Tadarus
            </h2>
            <button
              onClick={resetProgress}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
            >
              Reset
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tadarusData.juzList.map((item) => (
                <button
                  key={item.juz}
                  onClick={() => toggleJuz(item.juz)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    progress[item.juz]
                      ? "bg-gradient-to-r from-teal-100 to-emerald-100 border-2 border-teal-300"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    progress[item.juz]
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {progress[item.juz] ? "✓" : item.juz}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${
                      progress[item.juz] ? "text-teal-700" : "text-gray-800"
                    }`}>
                      Juz {item.juz}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.startSurah}</p>
                  </div>
                  {isRamadhan && item.juz === currentDay && !progress[item.juz] && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Hari ini
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {completedCount === 30 && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 mb-6 text-white text-center shadow-lg">
            <MdCelebration className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-2">Alhamdulillah!</h3>
            <p className="text-amber-50">
              Anda telah mengkhatamkan Al-Qur'an. Semoga menjadi amal ibadah yang diterima.
            </p>
            <p className="font-arabic text-xl mt-3">
              تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 mb-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5" />
            Tips Tadarus Ramadhan
          </h3>
          <ul className="space-y-2">
            {tadarusData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <HiOutlineInformationCircle className="w-5 h-5" />
            Panduan Tadarus
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1 Juz = ±20 halaman</strong><br/>
              Dengan membaca 1 juz per hari, Anda bisa khatam Al-Qur'an dalam 30 hari Ramadhan.
            </p>
            <p>
              <strong>Waktu yang disarankan:</strong><br/>
              • Setelah Subuh (paling utama)<br/>
              • Setelah Dzuhur/Ashar<br/>
              • Setelah Tarawih
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga diberi kemudahan untuk mengkhatamkan Al-Qur'an
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Bulan Ramadhan yang di dalamnya diturunkan Al-Qur'an" (QS. Al-Baqarah: 185)
          </p>
        </div>
      </div>
    </div>
  );
};

export default TadarusPage;
