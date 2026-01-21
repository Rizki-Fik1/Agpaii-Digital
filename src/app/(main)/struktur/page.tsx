"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import TopBar from "@/components/nav/topbar";
import { getImage } from "@/utils/function/function";
import Link from "next/link";

// Interface Data API
interface Period {
	id: number;
	name: string;
	year_start: number;
	year_end: number;
}

interface Province {
	id: number;
	name: string;
}

interface City {
	id: number;
	name: string;
}

interface District {
	id: number;
	name: string;
}

interface User {
	id: number;
	name: string;
	avatar: string | null;
}

interface Structure {
	id: number;
	period: Period | null;
	user: User | null;
	province?: Province | null;
	city?: City | null;
	district?: District | null;
	position_name: string;
	order_position: number;
}

const StrukturPage: React.FC = () => {
	const BASE_URL = process.env.NEXT_PUBLIC_MITRA_URL as string;

	// State untuk data master
	const [periods, setPeriods] = useState<Period[]>([]);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [totalData, setTotalData] = useState<number>(0);

	// State filter (dari modal filter)
	const [selectedPeriod, setSelectedPeriod] = useState<string>("");
	const [selectedProvince, setSelectedProvince] = useState<string>("");
	const [selectedCity, setSelectedCity] = useState<string>("");
	const [selectedDistrict, setSelectedDistrict] = useState<string>("");

	// State struktur dan loading
	const [structures, setStructures] = useState<Structure[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	// State Modal Filter (popup)
	const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

	// State untuk search dari data struktur (client-side filter)
	const [searchText, setSearchText] = useState<string>("");

	// --- Fetch Data Master (Period & Province) ---
	useEffect(() => {
		// Fetch periods
		fetch(`${BASE_URL}/api/periods`)
			.then((res) => res.json())
			.then((json) => {
				if (json.success) {
					setPeriods(json.data);
				}
			})
			.catch((err) => console.error("Error fetching periods:", err));

		// Fetch provinces
		fetch(`${BASE_URL}/api/provinces`)
			.then((res) => res.json())
			.then((json) => {
				if (json.success) {
					setProvinces(json.data);
				}
			})
			.catch((err) => console.error("Error fetching provinces:", err));
	}, [BASE_URL]);

	// --- Set default period (periode terbaru) setelah periods dimuat ---
	useEffect(() => {
		if (periods.length > 0 && !selectedPeriod) {
			// Ambil periode pertama (terbaru) karena diurutkan descending oleh API
			setSelectedPeriod(String(periods[0].id));
		}
	}, [periods, selectedPeriod]);

	// --- Fetch Kota saat Provinsi berubah ---
	useEffect(() => {
		if (!selectedProvince) {
			setCities([]);
			setSelectedCity("");
			setDistricts([]);
			setSelectedDistrict("");
			return;
		}
		fetch(`${BASE_URL}/api/provinces/${selectedProvince}/cities`)
			.then((res) => res.json())
			.then((json) => {
				if (json.success) {
					setCities(json.data);
					setSelectedCity("");
					setDistricts([]);
					setSelectedDistrict("");
				}
			})
			.catch((err) => console.error("Error fetching cities:", err));
	}, [selectedProvince, BASE_URL]);

	// --- Fetch Kecamatan saat Kota berubah ---
	useEffect(() => {
		if (!selectedCity) {
			setDistricts([]);
			setSelectedDistrict("");
			return;
		}
		fetch(`${BASE_URL}/api/cities/${selectedCity}/districts`)
			.then((res) => res.json())
			.then((json) => {
				if (json.success) {
					setDistricts(json.data);
					setSelectedDistrict("");
				}
			})
			.catch((err) => console.error("Error fetching districts:", err));
	}, [selectedCity, BASE_URL]);

	// --- Fungsi untuk Reset Filter ---
	const handleResetFilter = () => {
		setSelectedPeriod("");
		setSelectedProvince("");
		setSelectedCity("");
		setSelectedDistrict("");
	};

	// --- Fungsi untuk Apply Filter dan fetch struktur dari API ---
	const handleApplyFilter = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedProvince) params.append("province_id", selectedProvince);
			if (selectedCity) params.append("city_id", selectedCity);
			if (selectedDistrict) params.append("district_id", selectedDistrict);
			if (selectedPeriod) params.append("period_id", selectedPeriod);

			const url = `${BASE_URL}/api/structures?${params.toString()}`;
			const res = await fetch(url);
			const json = await res.json();
			if (json.success) {
				setStructures(json.data);
				setTotalData(json.data_count || json.data.length);
			}
		} catch (error) {
			console.error("Error fetching structures:", error);
		}
		setLoading(false);
		setShowFilterModal(false);
	};

	// --- Load data struktur default saat mount ---
	useEffect(() => {
		handleApplyFilter();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// --- Filter data struktur berdasarkan searchText (client-side) ---
	const filteredStructures = structures.filter((str) => {
		const search = searchText.toLowerCase();
		return (
			str.position_name.toLowerCase().includes(search) ||
			(str.user && str.user.name.toLowerCase().includes(search))
		);
	});

	// Ambil data periode terpilih untuk judul
	const selectedPeriodData = periods.find(
		(prd) => String(prd.id) === selectedPeriod,
	);

	// --- Menghitung label "Pengurus" ---
	// Jika tidak ada filter provinsi: "Pengurus DPP"
	// Jika ada filter, gunakan urutan: kecamatan > kota > provinsi
	let pengurusLabel = "Pengurus DPP";
	if (selectedProvince) {
		if (selectedCity) {
			if (selectedDistrict) {
				const foundDistrict = districts.find(
					(dst) => String(dst.id) === selectedDistrict,
				);
				pengurusLabel = foundDistrict
					? `Pengurus ${foundDistrict.name}`
					: "Pengurus";
			} else {
				const foundCity = cities.find((ct) => String(ct.id) === selectedCity);
				pengurusLabel = foundCity ? `Pengurus ${foundCity.name}` : "Pengurus";
			}
		} else {
			const foundProvince = provinces.find(
				(prov) => String(prov.id) === selectedProvince,
			);
			pengurusLabel = foundProvince
				? `Pengurus ${foundProvince.name}`
				: "Pengurus";
		}
	}

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Struktur Organisasi</TopBar>

			{/* Header Info */}
			<div className="mx-6 my-8 bg-[#009788] rounded-lg h-[12rem] relative overflow-hidden">
				<img
					src="/svg/indonesian.svg"
					alt="Background"
					className="w-full h-full object-cover"
				/>
				<div className="absolute bottom-4 right-4 p-1 text-center bg-[#FFD600] text-[#009788] rounded-md flex flex-col px-3 py-2">
					<p className="w-full text-xl font-bold italic">{totalData}</p>
					<span className="text-xs font-medium">{pengurusLabel}</span>
				</div>
			</div>

			{/* Judul Filter & Tombol Buka Modal Filter */}
			<div className="flex gap-2 flex-row items-center justify-between mx-6">
				<h2 className="font-semibold text-xl">
					Struktur Organisasi{" "}
					{selectedPeriodData
						? `(${selectedPeriodData.name} (${selectedPeriodData.year_start}-${selectedPeriodData.year_end}))`
						: ""}
				</h2>
				<button
					onClick={() => setShowFilterModal(true)}
					className="px-4 py-2 bg-green-600 text-white rounded">
					Filter
				</button>
			</div>

			{/* Field Search (untuk filter client-side) */}
			<div className="mx-6 mt-4">
				<input
					type="text"
					placeholder="Cari anggota..."
					className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
					value={searchText}
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setSearchText(e.target.value)
					}
				/>
			</div>

			{/* Modal Filter (Popup) */}
			{showFilterModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg w-full max-w-md p-4">
						<h2 className="text-lg font-semibold mb-4">Filter Struktur</h2>
						<div className="mb-3">
							<label className="block mb-1">Periode</label>
							<select
								className="w-full border p-2"
								value={selectedPeriod}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setSelectedPeriod(e.target.value)
								}>
								<option value="">-- Semua Periode --</option>
								{periods.map((prd) => (
									<option
										key={prd.id}
										value={prd.id}>
										{prd.name} ({prd.year_start}-{prd.year_end})
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="block mb-1">Provinsi</label>
							<select
								className="w-full border p-2"
								value={selectedProvince}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setSelectedProvince(e.target.value)
								}>
								<option value="">Nasional</option>
								{provinces.map((prov) => (
									<option
										key={prov.id}
										value={prov.id}>
										{prov.name}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="block mb-1">Kota</label>
							<select
								className="w-full border p-2"
								value={selectedCity}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setSelectedCity(e.target.value)
								}>
								<option value="">-- Kosong --</option>
								{cities.map((ct) => (
									<option
										key={ct.id}
										value={ct.id}>
										{ct.name}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="block mb-1">Kecamatan</label>
							<select
								className="w-full border p-2"
								value={selectedDistrict}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setSelectedDistrict(e.target.value)
								}>
								<option value="">-- Kosong --</option>
								{districts.map((dst) => (
									<option
										key={dst.id}
										value={dst.id}>
										{dst.name}
									</option>
								))}
							</select>
						</div>
						{/* Tombol Reset Filter */}
						<div className="mb-3">
							<button
								onClick={handleResetFilter}
								className="w-full px-3 py-1 bg-red-600 text-white rounded">
								Reset Filter
							</button>
						</div>
						<div className="flex justify-end gap-2 mt-4">
							<button
								onClick={() => setShowFilterModal(false)}
								className="w-full px-3 py-1 border rounded">
								Batal
							</button>
							<button
								onClick={handleApplyFilter}
								className="w-full px-3 py-1 bg-blue-600 text-white rounded"
								disabled={loading}>
								{loading ? "Memuat..." : "Terapkan Filter"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Grid Data Struktur */}
			<div className="px-4 mt-4">
				<h2 className="text-lg font-semibold mb-3">Daftar Struktur</h2>
				{loading ? (
					<p>Memuat data...</p>
				) : filteredStructures.length === 0 ? (
					<p className="text-gray-500">Belum ada data</p>
				) : (
					<div className="grid grid-cols-2 gap-4">
						{filteredStructures.map((str) => {
							const avatarSrc =
								(str.user?.avatar && getImage(str.user.avatar)) ||
								"/img/profileplacholder.png";
							return (
								<div
									key={str.id}
									className="border rounded shadow-sm p-4 flex flex-col items-center space-y-2">
									<img
										src={avatarSrc}
										alt="Avatar"
										className="w-24 h-24 object-cover rounded-full border"
									/>
									<p className="text-sm text-gray-700">
										{str.user ? str.user.name : "-"}
									</p>
									<p className="font-semibold">{str.position_name}</p>
									<p className="text-xs text-gray-500">
										Urutan: {str.order_position || 0}
									</p>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default StrukturPage;
