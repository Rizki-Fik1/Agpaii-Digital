"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";

// React Icons
import { 
  BsMoonStarsFill, 
  BsSunsetFill, 
  BsCalendarCheck,
  BsBookHalf,
  BsListCheck,
  BsStarFill,
} from "react-icons/bs";
import { 
  FaCalendarAlt, 
  FaPrayingHands, 
  FaMoneyBillWave,
  FaQuran,
  FaGem,
  FaMosque,
  FaBolt,
} from "react-icons/fa";
import { 
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineHeart,
} from "react-icons/hi";
import {
  MdMosque,
  MdOutlineRestaurant,
  MdWaterDrop,
} from "react-icons/md";
import {
  RiMoonClearFill,
  RiBookOpenLine,
  RiHandHeartLine,
} from "react-icons/ri";
import {
  GiStarFormation,
  GiMeal,
  GiPrayer,
} from "react-icons/gi";

moment.locale("id");

interface PrayerTimes {
  imsak: string;
  subuh: string;
  maghrib: string;
  isya: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface CategoryMenu {
  title: string;
  items: MenuItem[];
}

// Data hadits dan quotes Ramadhan
const ramadhanQuotes = [
  {
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    translation: "Barangsiapa yang berpuasa Ramadhan dengan iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "إِذَا جَاءَ رَمَضَانُ فُتِحَتْ أَبْوَابُ الْجَنَّةِ",
    translation: "Apabila bulan Ramadhan datang, maka pintu-pintu surga dibuka.",
    source: "HR. Bukhari"
  },
  {
    arabic: "الصَّوْمُ جُنَّةٌ",
    translation: "Puasa adalah perisai.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ، وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ",
    translation: "Bagi orang yang berpuasa ada dua kegembiraan: kegembiraan saat berbuka dan kegembiraan saat bertemu Tuhannya.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    translation: "Barangsiapa yang mendirikan (shalat) Ramadhan dengan iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ يَدْخُلُ مِنْهُ الصَّائِمُونَ",
    translation: "Sesungguhnya di surga ada pintu yang disebut Ar-Rayyan, yang masuk dari pintu itu hanyalah orang-orang yang berpuasa.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ",
    translation: "Carilah Lailatul Qadar di sepuluh hari terakhir bulan Ramadhan.",
    source: "HR. Bukhari"
  },
];

const RamadhanDashboard = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [cityName, setCityName] = useState<string>("Jakarta");
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(ramadhanQuotes[0]);
  
  // Ramadhan 1447H configuration (estimated: Feb 28 - Mar 29, 2026)
  const ramadhanStartDate = new Date("2026-02-28");
  const ramadhanEndDate = new Date("2026-03-29");
  
  const isRamadhan = currentTime >= ramadhanStartDate && currentTime <= ramadhanEndDate;
  const daysUntilRamadhan = Math.ceil((ramadhanStartDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
  const currentRamadhanDay = isRamadhan 
    ? Math.ceil((currentTime.getTime() - ramadhanStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  // Quick actions menu
  const quickActions: QuickAction[] = [
    {
      id: "jadwal",
      title: "Jadwal Imsakiyah",
      icon: <FaCalendarAlt className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
      path: "/ramadhan/jadwal-imsakiyah"
    },
    {
      id: "tarawih",
      title: "Sholat Tarawih",
      icon: <BsMoonStarsFill className="w-6 h-6" />,
      color: "from-teal-500 to-emerald-500",
      path: "/ramadhan/tarawih"
    },
    {
      id: "doa",
      title: "Doa Ramadhan",
      icon: <FaPrayingHands className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      path: "/ramadhan/doa"
    },
    {
      id: "zakat",
      title: "Kalkulator Zakat",
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      color: "from-green-500 to-teal-500",
      path: "/ramadhan/zakat"
    },
  ];

  // Category menus with react-icons
  const categoryMenus: CategoryMenu[] = [
    {
      title: "Jadwal & Waktu Sholat",
      items: [
        { name: "Jadwal Imsakiyah", path: "/ramadhan/jadwal-imsakiyah", icon: <FaCalendarAlt className="w-5 h-5 text-amber-500" /> },
        { name: "Waktu Sholat", path: "/waktu-sholat", icon: <MdMosque className="w-5 h-5 text-teal-500" /> },
        { name: "Kalender Ramadhan", path: "/ramadhan/kalender", icon: <HiOutlineCalendar className="w-5 h-5 text-blue-500" /> },
      ]
    },
    {
      title: "Ibadah Ramadhan",
      items: [
        { name: "Sholat Tarawih", path: "/ramadhan/tarawih", icon: <BsMoonStarsFill className="w-5 h-5 text-indigo-500" /> },
        { name: "Sholat Witir", path: "/ramadhan/witir", icon: <GiStarFormation className="w-5 h-5 text-purple-500" /> },
        { name: "Sholat Idul Fitri", path: "/ramadhan/idul-fitri", icon: <HiOutlineSparkles className="w-5 h-5 text-amber-500" /> },
        { name: "Panduan I'tikaf", path: "/ramadhan/itikaf", icon: <HiOutlineHome className="w-5 h-5 text-teal-500" /> },
        { name: "Lailatul Qadar", path: "/ramadhan/lailatul-qadar", icon: <RiMoonClearFill className="w-5 h-5 text-indigo-600" /> },
        { name: "Niat Puasa", path: "/ramadhan/niat-puasa", icon: <GiPrayer className="w-5 h-5 text-emerald-500" /> },
      ]
    },
    {
      title: "Doa & Dzikir",
      items: [
        { name: "Doa Harian Ramadhan", path: "/ramadhan/doa", icon: <FaPrayingHands className="w-5 h-5 text-purple-500" /> },
        { name: "Doa Berbuka Puasa", path: "/ramadhan/doa-berbuka", icon: <BsSunsetFill className="w-5 h-5 text-orange-500" /> },
        { name: "Doa Sahur", path: "/ramadhan/doa-sahur", icon: <GiMeal className="w-5 h-5 text-indigo-500" /> },
        { name: "Dzikir Pagi & Petang", path: "/ramadhan/dzikir", icon: <RiBookOpenLine className="w-5 h-5 text-teal-500" /> },
        { name: "Asmaul Husna", path: "/ramadhan/asmaul-husna", icon: <BsStarFill className="w-5 h-5 text-amber-500" /> },
        { name: "Ayat Kursi", path: "/ramadhan/ayat-kursi", icon: <FaQuran className="w-5 h-5 text-emerald-600" /> },
      ]
    },
    {
      title: "Al-Qur'an & Tadarus",
      items: [
        { name: "Tadarus 30 Hari", path: "/ramadhan/tadarus", icon: <BsListCheck className="w-5 h-5 text-teal-500" /> },
        { name: "Murottal", path: "/murrotal", icon: <BsBookHalf className="w-5 h-5 text-emerald-500" /> },
      ]
    },
    {
      title: "Kajian & Edukasi",
      items: [
        { name: "Fiqih Puasa", path: "/ramadhan/fiqih-puasa", icon: <HiOutlineBookOpen className="w-5 h-5 text-blue-500" /> },
        { name: "Keutamaan Ramadhan", path: "/ramadhan/keutamaan", icon: <BsStarFill className="w-5 h-5 text-amber-500" /> },
        { name: "Kajian Ramadhan", path: "/ramadhan/kajian", icon: <HiOutlineAcademicCap className="w-5 h-5 text-indigo-500" /> },
      ]
    },
    {
      title: "Zakat & Sedekah",
      items: [
        { name: "Zakat Fitrah", path: "/ramadhan/zakat", icon: <FaMoneyBillWave className="w-5 h-5 text-green-500" /> },
        { name: "Zakat Mal", path: "/ramadhan/zakat-mal", icon: <FaGem className="w-5 h-5 text-purple-500" /> },
        { name: "Panduan Fidyah", path: "/ramadhan/fidyah", icon: <HiOutlineClipboardList className="w-5 h-5 text-blue-500" /> },
        { name: "Sedekah & Infaq", path: "/ramadhan/sedekah", icon: <RiHandHeartLine className="w-5 h-5 text-pink-500" /> },
      ]
    },
  ];

  useEffect(() => {
    setMounted(true);
    
    // Set random daily quote based on date
    const dayOfYear = Math.floor((currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setDailyQuote(ramadhanQuotes[dayOfYear % ramadhanQuotes.length]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Get default city from user profile or use Jakarta
        const cityResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/kota/semua`
        );
        const cities = cityResponse.data.data;
        
        const userCity = cities.find((city: any) => 
          city.lokasi === user?.profile?.city?.name
        );
        const defaultCity = userCity || cities.find((city: any) => city.lokasi === "KOTA JAKARTA");
        
        if (defaultCity) {
          setCityName(defaultCity.lokasi);
          
          const scheduleResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/jadwal/${defaultCity.id}/${moment().format("YYYY-MM-DD")}`
          );
          
          const jadwal = scheduleResponse.data.data.jadwal;
          setPrayerTimes({
            imsak: jadwal.imsak,
            subuh: jadwal.subuh,
            maghrib: jadwal.maghrib,
            isya: jadwal.isya,
          });
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [user]);

  const formatTimeRemaining = (targetTime: string): string => {
    if (!targetTime) return "--:--:--";
    
    const [hours, minutes] = targetTime.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 pt-[4.2rem] pb-6">
      <TopBar withBackButton>Ramadhan 1447H</TopBar>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Hero Section - Countdown/Day Counter */}
        <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 right-4 opacity-20">
            <RiMoonClearFill className="w-16 h-16" />
          </div>
          
          <div className="relative z-10">
            {/* Current Time */}
            <div className="text-center mb-4">
              <p className="text-sm opacity-80 mb-1">
                {mounted ? moment(currentTime).format("dddd, D MMMM YYYY") : "Loading..."}
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {mounted ? moment(currentTime).format("HH:mm:ss") : "--:--:--"}
              </p>
            </div>

            {/* Ramadhan Status */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              {isRamadhan ? (
                <>
                  <p className="text-emerald-100 text-sm mb-1">Hari ke-</p>
                  <p className="text-5xl font-bold mb-1">{currentRamadhanDay}</p>
                  <p className="text-emerald-100 text-sm">Ramadhan 1447H</p>
                </>
              ) : daysUntilRamadhan > 0 ? (
                <>
                  <p className="text-emerald-100 text-sm mb-1">Menuju Ramadhan 1447H</p>
                  <p className="text-5xl font-bold mb-1">{daysUntilRamadhan}</p>
                  <p className="text-emerald-100 text-sm">Hari Lagi</p>
                </>
              ) : (
                <>
                  <p className="text-emerald-100 text-sm mb-1">Ramadhan 1447H</p>
                  <p className="text-2xl font-bold">Telah Berlalu</p>
                  <p className="text-emerald-100 text-sm mt-1">Semoga berjumpa kembali</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Waktu Imsak & Berbuka */}
        <div className="grid grid-cols-2 gap-3">
          {/* Imsak Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <BsMoonStarsFill className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Imsak</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {loading ? "--:--" : prayerTimes?.imsak || "--:--"}
            </p>
            <p className="text-xs opacity-75">{cityName}</p>
            {mounted && prayerTimes?.imsak && (
              <p className="text-xs mt-2 opacity-90">
                {formatTimeRemaining(prayerTimes.imsak)} lagi
              </p>
            )}
          </div>

          {/* Berbuka Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <BsSunsetFill className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Berbuka</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {loading ? "--:--" : prayerTimes?.maghrib || "--:--"}
            </p>
            <p className="text-xs opacity-75">{cityName}</p>
            {mounted && prayerTimes?.maghrib && (
              <p className="text-xs mt-2 opacity-90">
                {formatTimeRemaining(prayerTimes.maghrib)} lagi
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FaBolt className="w-4 h-4 text-amber-500" />
            Akses Cepat
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => router.push(action.path)}
                className={`flex flex-col items-center p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95`}
              >
                {action.icon}
                <span className="text-xs mt-2 text-center font-medium leading-tight">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hadits/Quote Harian */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineBookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-800">Hadits Hari Ini</h2>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-3">
              {dailyQuote.arabic}
            </p>
            <p className="text-gray-700 text-sm italic mb-2">
              "{dailyQuote.translation}"
            </p>
            <p className="text-emerald-600 text-xs font-semibold">
              {dailyQuote.source}
            </p>
          </div>
        </div>

        {/* Category Menus */}
        {categoryMenus.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></span>
              {category.title}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => router.push(item.path)}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 rounded-xl transition-all text-left group"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Banner Ramadhan */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 shadow-lg text-white text-center">
          <h3 className="text-xl font-bold mb-2">رمضان كريم</h3>
          <p className="text-emerald-100 text-sm mb-3">
            Semoga Ramadhan tahun ini membawa keberkahan dan ampunan
          </p>
          <p className="text-xs opacity-75">
            "Bulan yang di dalamnya diturunkan Al-Qur'an sebagai petunjuk bagi manusia"
            <br />
            (QS. Al-Baqarah: 185)
          </p>
        </div>
      </div>
    </div>
  );
};

export default RamadhanDashboard;
