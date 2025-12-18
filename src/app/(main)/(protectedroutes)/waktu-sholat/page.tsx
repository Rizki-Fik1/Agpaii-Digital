"use client";

import React, { useState, useEffect, useRef } from "react";
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
	const hasFetchedCities = useRef(false);
	const scheduleCache = useRef<Map<string, ScheduleType[]>>(new Map());

	useEffect(() => {
		async function fetchCitiesAndDefaultSchedule() {
			// Skip if already fetched
			if (hasFetchedCities.current && cities.length > 0) {
				return;
			}

			try {
				// Fetch cities
				const cityResponse = await axios.get(
					`${process.env.NEXT_PUBLIC_DOA_API_URL}/sholat/kota/semua`,
				);
				const data = cityResponse.data.data.map(
					(item: { lokasi: string; id: string }) => ({
						label: item.lokasi,
						value: item.id,
					}),
				);
				setCities(data);
				hasFetchedCities.current = true;

				// Determine default city
				const defaultCityId =
					data.find((city: any) => city.label == user.profile.city.name)
						?.value ??
					data.find((city: any) => city.label == "KOTA JAKARTA")?.value;

				setCity(defaultCityId);
				setCityName(
					data.find((city: any) => city.value == defaultCityId)?.label ||
						"KOTA JAKARTA",
				);

				// Fetch schedule for the default city
				await fetchScheduleByCity(defaultCityId);
			} catch (error) {
				console.error("Error fetching cities or schedule:", error);
			}
		}

		fetchCitiesAndDefaultSchedule();
	}, [user, date]);

	const fetchScheduleByCity = async (cityId: string) => {
		const cacheKey = `${cityId}-${date.format("YYYY-MM-DD")}`;
		
		// Check cache first
		if (scheduleCache.current.has(cacheKey)) {
			setSchedule(scheduleCache.current.get(cacheKey)!);
			return;
		}

		try {
			const response = await axios.get(
				`${
					process.env.NEXT_PUBLIC_DOA_API_URL
				}/sholat/jadwal/${cityId}/${date.format("YYYY-MM-DD")}`,
			);
			const schedules = response.data.data.jadwal;
			const scheduleData = Object.keys(schedules).map((key) => ({
				name: key,
				time: schedules[key].split(":").slice(0, 2).join(":"),
			}));
			
			// Cache the result
			scheduleCache.current.set(cacheKey, scheduleData);
			setSchedule(scheduleData);
		} catch (error) {
			console.error("Error fetching schedule:", error);
		}
	};

	const handleCityChange = (cityId: string) => {
		setCity(cityId);
		const selectedCity = cities.find((c) => c.value === cityId);
		setCityName(selectedCity?.label || "");
		fetchScheduleByCity(cityId);
	};

	const changeDate = (direction: number) => {
		const newDate = date.clone().add(direction, "days");
		setDate(newDate);
		if (city) {
			fetchScheduleByCity(city);
			fetchHijriDate(newDate);
		}
	};

	const fetchHijriDate = async (newDate: moment.Moment) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_DOA_API_URL}/cal/hijr/${newDate.format(
					"YYYY-MM-DD",
				)}/-1`,
			);
			const res = response.data.data;
			setHijriDate(`${res.date[0]}, ${res.date[1]}`);
		} catch (error) {
			console.error("Error fetching Hijri date:", error);
		}
	};

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Waktu Sholat</TopBar>
			<div className="p-4">
				<div className="flex justify-between items-center bg-white p-4 rounded shadow">
					<button onClick={() => changeDate(-1)}>&lt;</button>
					<div className="text-center">
						<p>{date.format("dddd, D MMMM YYYY")}</p>
						<p>{hijriDate}</p>
					</div>
					<button onClick={() => changeDate(1)}>&gt;</button>
				</div>

				<div className="mt-4">
					<select
						value={city || ""}
						onChange={(e) => handleCityChange(e.target.value)}
						className="w-full p-2 border rounded">
						<option
							value=""
							disabled>
							Pilih Kota
						</option>
						{cities.map((c) => (
							<option
								key={c.value}
								value={c.value}>
								{c.label}
							</option>
						))}
					</select>
				</div>

				<div className="mt-4 bg-white p-4 rounded shadow">
					{schedule ? (
						<ul>
							{schedule.map((s) => (
								<li
									key={s.name}
									className="flex justify-between">
									<span>{s.name}</span>
									<span>{s.time}</span>
								</li>
							))}
						</ul>
					) : (
						<p>Loading schedule...</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default WaktuSholatPage;
