"use client";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";

// React Icons
import { BsMoonStarsFill, BsSunriseFill, BsSunsetFill } from "react-icons/bs";
import { MdMosque, MdWbSunny } from "react-icons/md";
import { IoSunny, IoMoon } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FiSunrise, FiSunset } from "react-icons/fi";

moment.locale("id");

interface CityType {
  label: string;
  value: string;
}

interface ScheduleDay {
  date: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

const JadwalImsakiyahPage = () => {
  const { auth: user } = useAuth();
  const [cities, setCities] = useState<CityType[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState({
    cities: true,
    schedule: false,
  });
  const [activeTab, setActiveTab] = useState<"today" | "calendar">("today");
  const [todaySchedule, setTodaySchedule] = useState<ScheduleDay | null>(null);

  // Ramadhan 1447H dates (estimated)
  const ramadhanStartDate = moment("2026-02-28");
  const ramadhanEndDate = moment("2026-03-29");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/kota/semua`
        );
        const data = response.data.data.map(
          (item: { lokasi: string; id: string }) => ({
            label: item.lokasi,
            value: item.id,
          })
        );
        setCities(data);
        setFilteredCities(data);

        // Set default city
        const defaultCity = data.find(
          (city: CityType) => city.label === user?.profile?.city?.name
        ) || data.find((city: CityType) => city.label === "KOTA JAKARTA");

        if (defaultCity) {
          setSelectedCity(defaultCity.value);
          setSelectedCityName(defaultCity.label);
          fetchSchedule(defaultCity.value);
          fetchTodaySchedule(defaultCity.value);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, cities]);

  const handleSelectCity = (value: string, label: string) => {
    setSelectedCity(value);
    setSelectedCityName(label);
    setIsDropdownOpen(false);
    setSearchQuery("");
    fetchSchedule(value);
    fetchTodaySchedule(value);
  };

  const fetchTodaySchedule = async (cityId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/jadwal/${cityId}/${moment().format("YYYY-MM-DD")}`
      );
      const jadwal = response.data.data.jadwal;
      setTodaySchedule({
        date: moment().format("YYYY-MM-DD"),
        imsak: jadwal.imsak,
        subuh: jadwal.subuh,
        terbit: jadwal.terbit,
        dhuha: jadwal.dhuha,
        dzuhur: jadwal.dzuhur,
        ashar: jadwal.ashar,
        maghrib: jadwal.maghrib,
        isya: jadwal.isya,
      });
    } catch (error) {
      console.error("Error fetching today schedule:", error);
    }
  };

  const fetchSchedule = async (cityId: string) => {
    if (!cityId) return;

    try {
      setLoading((prev) => ({ ...prev, schedule: true }));
      
      // Fetch schedule for entire Ramadhan month
      const schedules: ScheduleDay[] = [];
      const startDate = ramadhanStartDate.clone();
      
      for (let i = 0; i < 30; i++) {
        const date = startDate.clone().add(i, "days");
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/jadwal/${cityId}/${date.format("YYYY-MM-DD")}`
          );
          const jadwal = response.data.data.jadwal;
          schedules.push({
            date: date.format("YYYY-MM-DD"),
            imsak: jadwal.imsak,
            subuh: jadwal.subuh,
            terbit: jadwal.terbit,
            dhuha: jadwal.dhuha,
            dzuhur: jadwal.dzuhur,
            ashar: jadwal.ashar,
            maghrib: jadwal.maghrib,
            isya: jadwal.isya,
          });
        } catch (e) {
          // Skip if date schedule not available
        }
      }
      
      setSchedule(schedules);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading((prev) => ({ ...prev, schedule: false }));
    }
  };

  const formatTimeRemaining = (targetTime: string): string => {
    if (!targetTime) return "";
    
    const [hours, minutes] = targetTime.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    if (target < now) {
      return "Telah berlalu";
    }
    
    const diff = target.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (h > 0) {
      return `${h} jam ${m} menit lagi`;
    }
    return `${m} menit lagi`;
  };

  const prayerTimes = [
    { key: "imsak", name: "Imsak", icon: <BsMoonStarsFill className="w-4 h-4" />, color: "from-indigo-500 to-purple-600" },
    { key: "subuh", name: "Subuh", icon: <BsSunriseFill className="w-4 h-4" />, color: "from-blue-500 to-indigo-600" },
    { key: "terbit", name: "Terbit", icon: <FiSunrise className="w-4 h-4" />, color: "from-yellow-400 to-orange-500" },
    { key: "dhuha", name: "Dhuha", icon: <IoSunny className="w-4 h-4" />, color: "from-amber-400 to-yellow-500" },
    { key: "dzuhur", name: "Dzuhur", icon: <MdWbSunny className="w-4 h-4" />, color: "from-orange-400 to-red-500" },
    { key: "ashar", name: "Ashar", icon: <FiSunset className="w-4 h-4" />, color: "from-orange-500 to-pink-500" },
    { key: "maghrib", name: "Maghrib", icon: <BsSunsetFill className="w-4 h-4" />, color: "from-pink-500 to-purple-600" },
    { key: "isya", name: "Isya", icon: <IoMoon className="w-4 h-4" />, color: "from-purple-600 to-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 pt-[4.2rem] pb-6">
      <TopBar withBackButton>Jadwal Imsakiyah</TopBar>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Clock Widget */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Waktu Sekarang</p>
              {mounted ? (
                <>
                  <p className="text-4xl font-bold tracking-tight">
                    {moment(currentTime).format("HH:mm:ss")}
                  </p>
                  <p className="text-sm opacity-90 mt-2">
                    {moment(currentTime).format("dddd, D MMMM YYYY")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold tracking-tight">--:--:--</p>
                  <p className="text-sm opacity-90 mt-2">Loading...</p>
                </>
              )}
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <MdMosque className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* City Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pilih Lokasi
          </h3>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading.cities}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-left flex items-center justify-between bg-white"
            >
              <span className={selectedCityName ? "text-gray-900" : "text-gray-500"}>
                {selectedCityName || "-- Pilih Kabupaten/Kota --"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kota..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {filteredCities.map((city) => (
                      <button
                        key={city.value}
                        type="button"
                        onClick={() => handleSelectCity(city.value, city.label)}
                        className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition ${
                          selectedCity === city.value ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-700"
                        }`}
                      >
                        {city.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setSearchQuery("");
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("today")}
              className={`py-3 px-4 rounded-xl font-medium transition ${
                activeTab === "today"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`py-3 px-4 rounded-xl font-medium transition ${
                activeTab === "calendar"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Kalender 30 Hari
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        {activeTab === "today" && todaySchedule && (
          <div className="space-y-3">
            {/* Imsak & Maghrib Highlight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BsMoonStarsFill className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Imsak</span>
                </div>
                <p className="text-3xl font-bold">{todaySchedule.imsak}</p>
                {mounted && (
                  <p className="text-xs mt-2 opacity-90">
                    {formatTimeRemaining(todaySchedule.imsak)}
                  </p>
                )}
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BsSunsetFill className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Berbuka</span>
                </div>
                <p className="text-3xl font-bold">{todaySchedule.maghrib}</p>
                {mounted && (
                  <p className="text-xs mt-2 opacity-90">
                    {formatTimeRemaining(todaySchedule.maghrib)}
                  </p>
                )}
              </div>
            </div>

            {/* All Prayer Times */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">Jadwal Sholat Lengkap</h3>
              <div className="grid grid-cols-2 gap-3">
                {prayerTimes.map((prayer) => (
                  <div
                    key={prayer.key}
                    className={`bg-gradient-to-br ${prayer.color} rounded-xl p-3 text-white`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {prayer.icon}
                      <span className="text-sm font-medium">{prayer.name}</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {todaySchedule[prayer.key as keyof ScheduleDay] || "--:--"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeTab === "calendar" && (
          <div className="space-y-3">
            {loading.schedule ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat jadwal...</p>
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((day, index) => (
                <div
                  key={day.date}
                  className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all border-l-4 border-teal-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-3 min-w-[50px] text-center text-white">
                        <p className="text-lg font-bold">{index + 1}</p>
                        <p className="text-xs opacity-90">Hari</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {moment(day.date).format("dddd")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {moment(day.date).format("D MMMM YYYY")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-indigo-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-indigo-600 font-medium">Imsak</p>
                      <p className="text-lg font-bold text-indigo-700">{day.imsak}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-blue-600 font-medium">Subuh</p>
                      <p className="text-lg font-bold text-blue-700">{day.subuh}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-orange-600 font-medium">Maghrib</p>
                      <p className="text-lg font-bold text-orange-700">{day.maghrib}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-purple-600 font-medium">Isya</p>
                      <p className="text-lg font-bold text-purple-700">{day.isya}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <p className="text-gray-600">Pilih kota untuk melihat jadwal</p>
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <HiOutlineInformationCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 mb-1">Catatan</h4>
              <p className="text-sm text-gray-700">
                Jadwal waktu sholat berdasarkan perhitungan astronomis. Untuk kepastian, 
                silakan sesuaikan dengan jadwal resmi dari Kementerian Agama setempat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalImsakiyahPage;
