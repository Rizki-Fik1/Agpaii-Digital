"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import TopBar from "@/components/nav/topbar";
import { getImage } from "@/utils/function/function";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FiSearch, FiFilter, FiX, FiCheck, FiChevronDown, FiMapPin } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";

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
	const BASE_URL = "https://mitra.agpaiidigital.org";

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
	const [loading, setLoading] = useState<boolean>(true); // Default loading true

	// State Modal Filter (popup)
	const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

	// State untuk search dari data struktur (client-side filter)
	const [searchText, setSearchText] = useState<string>("");

	// --- Helper Safe Fetch ---
	const safeFetch = async (url: string) => {
		try {
			console.log(`Fetching: ${url}`);
			const res = await fetch(url);
			const text = await res.text();
			
			try {
				const json = JSON.parse(text);
				return { ok: res.ok, data: json, status: res.status };
			} catch (e) {
				console.error(`JSON Parse Error for ${url}. Response starts with: ${text.slice(0, 50)}`);
				return { ok: false, data: null, status: res.status, error: "Invalid JSON" };
			}
		} catch (error) {
			console.error(`Network Error for ${url}:`, error);
			return { ok: false, data: null, status: 0, error: "Network Error" };
		}
	};

	// --- Fetch Data Master (Period & Province) ---
	useEffect(() => {
		const fetchDataMaster = async () => {
			if (!BASE_URL) {
				console.error("BASE_URL is not defined!");
				return;
			}

			const [periodsRes, provincesRes] = await Promise.all([
				safeFetch(`${BASE_URL}/api/periods`),
				safeFetch(`${BASE_URL}/api/provinces`),
			]);

			if (periodsRes.ok && periodsRes.data?.success) {
				setPeriods(periodsRes.data.data);
			}
			if (provincesRes.ok && provincesRes.data?.success) {
				setProvinces(provincesRes.data.data);
			}
		};
		fetchDataMaster();
	}, [BASE_URL]);

	// --- Set default period (periode terbaru) setelah periods dimuat ---
	useEffect(() => {
		if (periods.length > 0 && !selectedPeriod) {
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
		const fetchCities = async () => {
			const res = await safeFetch(`${BASE_URL}/api/provinces/${selectedProvince}/cities`);
			if (res.ok && res.data?.success) {
				setCities(res.data.data);
				setSelectedCity("");
				setDistricts([]);
				setSelectedDistrict("");
			}
		};
		fetchCities();
	}, [selectedProvince, BASE_URL]);

	// --- Fetch Kecamatan saat Kota berubah ---
	useEffect(() => {
		if (!selectedCity) {
			setDistricts([]);
			setSelectedDistrict("");
			return;
		}
		const fetchDistricts = async () => {
			const res = await safeFetch(`${BASE_URL}/api/cities/${selectedCity}/districts`);
			if (res.ok && res.data?.success) {
				setDistricts(res.data.data);
				setSelectedDistrict("");
			}
		};
		fetchDistricts();
	}, [selectedCity, BASE_URL]);

	// --- Fungsi untuk Reset Filter ---
	const handleResetFilter = () => {
		setSelectedPeriod(periods.length > 0 ? String(periods[0].id) : "");
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
			
			// We can reuse the safeFetch logic here or just do it manually if safeFetch isn't moved to outer scope
			// Since safeFetch is defined inside the component, we can use it.
			console.log(`Fetching structures: ${url}`);
			const res = await fetch(url);
			const text = await res.text();
			
			try {
				const json = JSON.parse(text);
				if (json.success) {
					setStructures(json.data);
					setTotalData(json.data_count || json.data.length);
				} else {
					console.warn("API returned success: false", json);
					setStructures([]);
					setTotalData(0);
				}
			} catch (e) {
				console.error(`JSON Parse Error for ${url}. Response starts with: ${text.slice(0, 50)}`);
				setStructures([]);
			}
		} catch (error) {
			console.error("Error fetching structures:", error);
			setStructures([]);
		}
		setLoading(false);
		setShowFilterModal(false);
	};

	// --- Load data struktur default saat mount & saat default filter siap ---
	useEffect(() => {
		// Tunggu sampai default periode terset
		if (selectedPeriod) {
			handleApplyFilter();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPeriod]);

	// --- Filter data struktur berdasarkan searchText DAN selected filters (client-side fallback) ---
	// API seharusnya memfilter, tapi kita lakukan double-check di client untuk memastikan
	const filteredStructures = structures.filter((str) => {
		const search = searchText.toLowerCase();
		const matchesSearch = 
			str.position_name.toLowerCase().includes(search) ||
			(str.user && str.user.name.toLowerCase().includes(search));

		// Fallback filter client-side jika API mengembalikan semua data
		const matchesPeriod = selectedPeriod ? String(str.period?.id) === selectedPeriod : true;
		const matchesProvince = selectedProvince ? String(str.province?.id) === selectedProvince : true;
		const matchesCity = selectedCity ? String(str.city?.id) === selectedCity : true;
		const matchesDistrict = selectedDistrict ? String(str.district?.id) === selectedDistrict : true;
		
		return matchesSearch && matchesPeriod && matchesProvince && matchesCity && matchesDistrict;
	});

	// Ambil data periode terpilih untuk judul
	const selectedPeriodData = periods.find(
		(prd) => String(prd.id) === selectedPeriod,
	);

	// --- Menghitung label "Pengurus" ---
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
		<div className="bg-gray-50 min-h-screen pb-20">
			<TopBar withBackButton>Struktur Organisasi</TopBar>

			{/* Main Content Container */}
			<div className="pt-[4.5rem] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				
				{/* Hero Header Section */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative w-full h-48 sm:h-56 bg-gradient-to-r from-[#009788] to-[#00796b] rounded-2xl overflow-hidden shadow-lg mb-6"
				>
					{/* Decorative Patterns */}
					<div className="absolute top-0 right-0 p-8 opacity-10">
						<img src="/svg/indonesian.svg" alt="Pattern" className="w-64 h-64 object-cover" />
					</div>
					<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>

					<div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 text-white">
						<h1 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-md">
							{pengurusLabel}
						</h1>
						<p className="text-white/90 text-sm sm:text-base max-w-2xl">
							Membangun sinergi dan kolaborasi untuk kemajuan pendidikan agama Islam di Indonesia.
						</p>
						
						<div className="mt-4 flex flex-wrap gap-2">
							<div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-white/10">
								<FaUserTie className="text-yellow-300" />
								<span>{loading ? "..." : filteredStructures.length} Anggota</span>
							</div>
							{selectedPeriodData && (
								<div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-white/10">
									<span>Periode {selectedPeriodData.year_start} - {selectedPeriodData.year_end}</span>
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* Controls Section: Search & Filter */}
				<div className="sticky top-[4.5rem] z-30 bg-gray-50/90 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
						{/* Search Input */}
						<div className="relative flex-grow max-w-lg">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Cari nama atau jabatan..."
								className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009788] focus:border-transparent transition-all shadow-sm"
								value={searchText}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
							/>
						</div>

						{/* Filter Button */}
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => setShowFilterModal(true)}
							className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#009788] border border-[#009788]/20 font-semibold rounded-xl hover:bg-[#009788]/5 transition-colors shadow-sm"
						>
							<FiFilter />
							<span>Filter Wilayah</span>
						</motion.button>
					</div>
				</div>

				{/* Content List (Vertical) */}
				<div className="min-h-[400px] mb-10 max-w-4xl mx-auto">
					{loading ? (
						<div className="flex flex-col gap-4">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="flex bg-white p-4 border border-gray-100 rounded-2xl items-center gap-4">
									<Skeleton circle width={64} height={64} />
									<div className="flex-1 space-y-2">
										<Skeleton width="40%" height={20} />
										<Skeleton width="25%" height={16} />
									</div>
								</div>
							))}
						</div>
					) : filteredStructures.length === 0 ? (
						<div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
							<div className="bg-gray-50 p-6 rounded-full mb-4">
								<FaUserTie className="w-12 h-12 text-gray-300" />
							</div>
							<h3 className="text-lg font-medium text-gray-900">Data Tidak Ditemukan</h3>
							<p className="text-gray-500 mt-1 max-w-xs mx-auto">
								Tidak ada data pengurus yang sesuai dengan filter pencarian Anda.
							</p>
							<button 
								onClick={handleResetFilter}
								className="mt-6 px-6 py-2 bg-[#009788] text-white rounded-lg hover:bg-[#00796b] transition-colors"
							>
								Reset Filter
							</button>
						</div>
					) : (
						<motion.div 
							layout
							className="flex flex-col gap-4"
						>
							<AnimatePresence>
								{filteredStructures.map((str, index) => {
									const avatarSrc = (str.user?.avatar && getImage(str.user.avatar)) || "/img/profileplacholder.png";
									return (
										<motion.div
											layout
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.98 }}
											transition={{ duration: 0.2, delay: index * 0.05 }}
											key={str.id}
											className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex items-center gap-5 hover:border-[#009788]/30 hover:shadow-md transition-all duration-300"
										>
											{/* Avatar */}
											<div className="relative flex-shrink-0">
												<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#009788] to-emerald-300">
													<img
														src={avatarSrc}
														alt={str.user?.name || "User"}
														className="w-full h-full object-cover rounded-full border-2 border-white bg-white"
													/>
												</div>
												<div className="absolute -bottom-1 -right-1 bg-[#009788] text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-white">
													{str.order_position || "-"}
												</div>
											</div>

											{/* Info */}
											<div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
												<div>
													<h3 className="text-gray-900 font-bold text-lg mb-1" title={str.user?.name}>
														{str.user ? str.user.name : "Belum diisi"}
													</h3>
													<p className="text-[#009788] text-xs font-bold uppercase tracking-wider bg-[#009788]/5 inline-block px-2 py-1 rounded-md mb-1">
														{str.position_name}
													</p>
												</div>

												{/* Location Detail - Right Aligned on Desktop */}
												<div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-right">
													<FiMapPin size={12} className="shrink-0 text-gray-400" />
													<span className="truncate max-w-[200px] sm:max-w-xs">
														{str.district?.name ? str.district.name + ", " : ""}
														{str.city?.name || str.province?.name || "Nasional"}
													</span>
												</div>
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</motion.div>
					)}
				</div>
			</div>

			{/* Filter Modal */}
			<AnimatePresence>
				{showFilterModal && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setShowFilterModal(false)}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="fixed inset-0 sm:inset-auto sm:top-20 sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:w-[500px] h-full sm:h-auto bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
						>
							<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
								<h2 className="text-lg font-bold text-gray-800">Filter Struktur</h2>
								<button 
									onClick={() => setShowFilterModal(false)}
									className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
								>
									<FiX size={20} />
								</button>
							</div>

							<div className="p-6 overflow-y-auto flex-1 sm:max-h-[70vh] space-y-5">
								{/* Periode */}
								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-700">Periode Kepengurusan</label>
									<div className="relative">
										<select
											className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788]"
											value={selectedPeriod}
											onChange={(e) => setSelectedPeriod(e.target.value)}
										>
											<option value="">-- Semua Periode --</option>
											{periods.map((prd) => (
												<option key={prd.id} value={prd.id}>
													{prd.name} ({prd.year_start}-{prd.year_end})
												</option>
											))}
										</select>
										<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
											<FiChevronDown />
										</div>
									</div>
								</div>

								<div className="h-px bg-gray-100"></div>

								{/* Wilayah */}
								<div className="space-y-4">
									<p className="text-sm font-semibold text-gray-700">Wilayah</p>
									
									<div className="space-y-2">
										<label className="text-xs text-gray-500 font-medium uppercase">Provinsi</label>
										<div className="relative">
											<select
												className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788]"
												value={selectedProvince}
												onChange={(e) => setSelectedProvince(e.target.value)}
											>
												<option value="">Nasional (DPP)</option>
												{provinces.map((prov) => (
													<option key={prov.id} value={prov.id}>{prov.name}</option>
												))}
											</select>
											<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
												<FiChevronDown />
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-xs text-gray-500 font-medium uppercase">Kota / Kabupaten</label>
										<div className="relative">
											<select
												className={`w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788] ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
												value={selectedCity}
												onChange={(e) => setSelectedCity(e.target.value)}
												disabled={!selectedProvince}
											>
												<option value="">-- Semua Kota --</option>
												{cities.map((ct) => (
													<option key={ct.id} value={ct.id}>{ct.name}</option>
												))}
											</select>
											<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
												<FiChevronDown />
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-xs text-gray-500 font-medium uppercase">Kecamatan</label>
										<div className="relative">
											<select
												className={`w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788] ${!selectedCity ? 'opacity-50 cursor-not-allowed' : ''}`}
												value={selectedDistrict}
												onChange={(e) => setSelectedDistrict(e.target.value)}
												disabled={!selectedCity}
											>
												<option value="">-- Semua Kecamatan --</option>
												{districts.map((dst) => (
													<option key={dst.id} value={dst.id}>{dst.name}</option>
												))}
											</select>
											<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
												<FiChevronDown />
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
								<button
									onClick={handleResetFilter}
									className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
								>
									Reset
								</button>
								<button
									onClick={handleApplyFilter}
									disabled={loading}
									className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-[#009788] text-white font-semibold rounded-xl hover:bg-[#00796b] transition-all shadow-md active:scale-95 disabled:opacity-70"
								>
									{loading ? <span className="animate-spin text-white">⏳</span> : <FiCheck />}
									Terapkan Filter
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default StrukturPage;
