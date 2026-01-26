"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";

// React Icons
import { BsCalendarEvent, BsListUl, BsGrid } from "react-icons/bs";
import { HiOutlineInformationCircle } from "react-icons/hi";

moment.locale("id");

interface CityType {
  label: string;
  value: string;
}

interface ScheduleDay {
  date: string;
  hijriDate?: string;
  day: number;
  imsak: string;
  subuh: string;
  maghrib: string;
  isya: string;
  isToday: boolean;
}

const KalenderRamadhanPage = () => {
  const { auth: user } = useAuth();
  const [cities, setCities] = useState<CityType[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Ramadhan 1447H dates (estimated: Feb 28 - Mar 29, 2026)
  const ramadhanStartDate = moment("2026-02-28");
  const today = moment();

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

        // Set default city
        const defaultCity = data.find(
          (city: CityType) => city.label === user?.profile?.city?.name
        ) || data.find((city: CityType) => city.label === "KOTA JAKARTA");

        if (defaultCity) {
          setSelectedCity(defaultCity.value);
          setSelectedCityName(defaultCity.label);
          fetchSchedule(defaultCity.value);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setLoading(false);
      }
    };
    fetchCities();
  }, [user]);

  const fetchSchedule = async (cityId: string) => {
    if (!cityId) return;

    try {
      setLoading(true);
      const schedules: ScheduleDay[] = [];
      
      for (let i = 0; i < 30; i++) {
        const date = ramadhanStartDate.clone().add(i, "days");
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/jadwal/${cityId}/${date.format("YYYY-MM-DD")}`
          );
          const jadwal = response.data.data.jadwal;
          
          schedules.push({
            date: date.format("YYYY-MM-DD"),
            day: i + 1,
            imsak: jadwal.imsak,
            subuh: jadwal.subuh,
            maghrib: jadwal.maghrib,
            isya: jadwal.isya,
            isToday: date.isSame(today, "day"),
          });
        } catch (e) {
          // Skip if date schedule not available
        }
      }
      
      setSchedule(schedules);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = cities.find((c) => c.value === cityId);
    if (city) {
      setSelectedCity(city.value);
      setSelectedCityName(city.label);
      fetchSchedule(city.value);
    }
  };

  const getCurrentRamadhanDay = () => {
    const diffDays = today.diff(ramadhanStartDate, "days") + 1;
    if (diffDays >= 1 && diffDays <= 30) return diffDays;
    return null;
  };

  const currentDay = getCurrentRamadhanDay();

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Kalender Ramadhan</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BsCalendarEvent className="w-8 h-8" />
                <h1 className="text-2xl font-bold">Kalender Ramadhan 1447H</h1>
              </div>
              <p className="text-emerald-50 text-sm">
                Jadwal lengkap 30 hari puasa Ramadhan
              </p>
            </div>
            {currentDay && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <p className="text-xs opacity-90">Hari ke</p>
                <p className="text-3xl font-bold">{currentDay}</p>
              </div>
            )}
          </div>
        </div>

        {/* City Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Lokasi
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">-- Pilih Kota --</option>
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-xl p-1 shadow-sm inline-flex">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BsListUl className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BsGrid className="w-4 h-4" /> Grid
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat jadwal...</p>
          </div>
        ) : schedule.length > 0 ? (
          <>
            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3">
                {schedule.map((day) => (
                  <div
                    key={day.date}
                    className={`bg-white rounded-2xl p-4 shadow-md border-2 transition-all ${
                      day.isToday
                        ? "border-teal-500 bg-teal-50"
                        : "border-transparent hover:border-teal-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-xl p-3 min-w-[60px] text-center ${
                          day.isToday
                            ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
                            : "bg-gray-100"
                        }`}>
                          <p className={`text-xl font-bold ${day.isToday ? "text-white" : "text-gray-800"}`}>
                            {day.day}
                          </p>
                          <p className={`text-xs ${day.isToday ? "text-emerald-100" : "text-gray-500"}`}>Hari</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {moment(day.date).format("dddd")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {moment(day.date).format("D MMMM YYYY")}
                          </p>
                          {day.isToday && (
                            <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                              Hari Ini
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Imsak</p>
                          <p className="font-bold text-indigo-600">{day.imsak}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Subuh</p>
                          <p className="font-bold text-blue-600">{day.subuh}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Maghrib</p>
                          <p className="font-bold text-orange-600">{day.maghrib}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Isya</p>
                          <p className="font-bold text-purple-600">{day.isya}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-5 gap-3">
                {schedule.map((day) => (
                  <div
                    key={day.date}
                    className={`bg-white rounded-xl p-3 shadow-md text-center border-2 ${
                      day.isToday
                        ? "border-teal-500 bg-teal-50"
                        : "border-transparent"
                    }`}
                  >
                    <div className={`rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center font-bold ${
                      day.isToday
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {day.day}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {moment(day.date).format("D MMM")}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p><span className="text-gray-400">I:</span> <span className="font-semibold">{day.imsak}</span></p>
                      <p><span className="text-gray-400">M:</span> <span className="font-semibold">{day.maghrib}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <span className="text-4xl block mb-3">📅</span>
            <p className="text-gray-600">Pilih kota untuk melihat jadwal</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mt-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <HiOutlineInformationCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm mb-1">Catatan</h4>
              <p className="text-xs text-gray-700">
                Jadwal Ramadhan 1447H diperkirakan jatuh pada 28 Februari - 29 Maret 2026. 
                Kepastian akan ditentukan berdasarkan rukyatul hilal atau sidang isbat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Lokasi: {selectedCityName || "Belum dipilih"}
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            رَمَضَانَ كَرِيم
          </p>
        </div>
      </div>
    </div>
  );
};

export default KalenderRamadhanPage;
