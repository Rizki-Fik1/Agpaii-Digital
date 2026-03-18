"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";

moment.locale("id");

interface CityType {
  label: string;
  value: string;
}

interface ScheduleType {
  name: string;
  time: string;
}

const WaktuSholatPage: React.FC = () => {
  const { auth: user } = useAuth();
  const [cities, setCities] = useState<CityType[]>([]);
  const [city, setCity] = useState<any>(null);
  const [cityName, setCityName] = useState<string>("KOTA JAKARTA");
  const [schedule, setSchedule] = useState<ScheduleType[] | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [date, setDate] = useState<moment.Moment>(moment());
  const [selectedMonth, setSelectedMonth] = useState<number>(moment().month());
  const [selectedYear, setSelectedYear] = useState<number>(moment().year());

  useEffect(() => {
    async function fetchCitiesAndDefaultSchedule() {
      try {
        // Fetch cities
        const cityResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/kota/semua`
        );
        const data = cityResponse.data.data.map(
          (item: { lokasi: string; id: string }) => ({
            label: item.lokasi,
            value: item.id,
          })
        );
        setCities(data);

        // Determine default city
        const defaultCityId =
          data.find((city: any) => city.label == user.profile.city.name)
            ?.value ??
          data.find((city: any) => city.label == "KOTA JAKARTA")?.value;

        setCity(defaultCityId);
        setCityName(
          data.find((city: any) => city.value == defaultCityId)?.label ||
            "KOTA JAKARTA"
        );

        // Fetch schedule for the default city
        await fetchScheduleByCity(defaultCityId);

        // Fetch Hijri date
        await fetchHijriDate(date);
      } catch (error) {
        console.error("Error fetching cities or schedule:", error);
      }
    }

    fetchCitiesAndDefaultSchedule();
  }, [user, cities.length, date]);

  const fetchScheduleByCity = async (cityId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/jadwal/${cityId}/${date.format("YYYY-MM-DD")}`
      );
      const schedules = response.data.data.jadwal;
      setSchedule(
        Object.keys(schedules).map((key) => ({
          name: key,
          time: schedules[key].split(":").slice(0, 2).join(":"),
        }))
      );
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const fetchHijriDate = async (newDate: moment.Moment) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DOA_API_URL}/cal/hijr/${newDate.format("YYYY-MM-DD")}/-1`
      );
      const res = response.data.data;
      setHijriDate(`${res.date[0]} ${res.date[1]}`);
    } catch (error) {
      console.error("Error fetching Hijri date:", error);
    }
  };

  const handleCityChange = (cityId: string) => {
    setCity(cityId);
    const selectedCity = cities.find((c) => c.value === cityId);
    setCityName(selectedCity?.label || "");
    fetchScheduleByCity(cityId);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const newDate = moment()
      .year(selectedYear)
      .month(month)
      .date(date.date());
    setDate(newDate);
    if (city) {
      fetchScheduleByCity(city);
      fetchHijriDate(newDate);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newDate = moment()
      .year(year)
      .month(selectedMonth)
      .date(date.date());
    setDate(newDate);
    if (city) {
      fetchScheduleByCity(city);
      fetchHijriDate(newDate);
    }
  };

  const handleDateSelect = (day: number) => {
    const newDate = moment().year(selectedYear).month(selectedMonth).date(day);
    setDate(newDate);
    if (city) {
      fetchScheduleByCity(city);
      fetchHijriDate(newDate);
    }
  };

  const generateCalendar = () => {
    const startOfMonth = moment()
      .year(selectedYear)
      .month(selectedMonth)
      .startOf("month");
    const endOfMonth = moment()
      .year(selectedYear)
      .month(selectedMonth)
      .endOf("month");
    const startDate = startOfMonth.clone().startOf("week");
    const endDate = endOfMonth.clone().endOf("week");

    const calendar = [];
    const day = startDate.clone();

    while (day.isBefore(endDate, "day")) {
      calendar.push({
        date: day.date(),
        month: day.month(),
        isCurrentMonth: day.month() === selectedMonth,
        isToday: day.isSame(moment(), "day"),
        isSelected: day.isSame(date, "day"),
      });
      day.add(1, "day");
    }

    return calendar;
  };

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const years = Array.from({ length: 10 }, (_, i) => moment().year() - 5 + i);

  const prayerNames: { [key: string]: string } = {
    imsak: "Shalat Imsak",
    subuh: "Shalat Subuh",
    terbit: "Shalat Terbit",
    dhuha: "Shalat Dhuha",
    dzuhur: "Shalat Dhuhur",
    ashar: "Shalat Ashar",
    maghrib: "Shalat Magrib",
    isya: "Shalat Isya'",
  };

  return (
    <div className="pt-[4.2rem] bg-gray-50 min-h-screen">
      <TopBar withBackButton href="/">Waktu Sholat</TopBar>
      <div className="p-4">
        {/* Date Selection Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">Pilih tanggal</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tentukan agar shalat jadi tepat waktu
          </p>

          {/* Month and Year Dropdowns */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <select
            value={city || ""}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-700 mb-4"
          >
            <option value="" disabled>
              Pilih Kota
            </option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Calendar */}
          <div className="mt-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {generateCalendar().map((day, index) => (
                <button
                  key={index}
                  onClick={() =>
                    day.isCurrentMonth && handleDateSelect(day.date)
                  }
                  disabled={!day.isCurrentMonth}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm ${
                    day.isSelected
                      ? "bg-teal-700 text-white font-bold"
                      : day.isCurrentMonth
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300"
                  } ${
                    day.isToday && !day.isSelected
                      ? "border-2 border-teal-700"
                      : ""
                  } transition-colors`}
                >
                  {day.date}
                </button>
              ))}
            </div>
          </div>

          {/* Hijri Date Display */}
          {hijriDate && (
            <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tanggal Hijriah:</p>
              <p className="text-base font-semibold text-teal-800">
                {hijriDate}
              </p>
            </div>
          )}
        </div>

        {/* Prayer Times Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Waktu Sholat</h2>
          <p className="text-sm text-gray-600 mb-4">
            Berikut adalah hasil pencocokan waktu.
          </p>
          {schedule ? (
            <div className="grid grid-cols-2 gap-3">
              {schedule.map((s) => (
                <div
                  key={s.name}
                  className="bg-teal-700 text-white p-4 rounded-lg"
                >
                  <div className="text-2xl font-bold mb-1">{s.time}</div>
                  <div className="text-sm">
                    {prayerNames[s.name.toLowerCase()] || s.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Loading schedule...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaktuSholatPage;
