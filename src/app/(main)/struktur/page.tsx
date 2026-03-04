"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";

// Interface untuk API response
interface Position {
	jabatan: string;
	nama: string;
}

interface StructureLevel {
	id: number;
	period: string;
	level: string; // DPP, DPW, DPD
	members: number;
	positions: Position[];
}

interface Province {
	id: number;
	name: string;
}

interface City {
	id: number;
	name: string;
}

interface Period {
	value: string;
	label: string;
}

const StrukturPage: React.FC = () => {
	const BASE_URL = "https://admin.agpaiidigital.org";
	
	const [structureLevels, setStructureLevels] = useState<StructureLevel[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [searchText, setSearchText] = useState<string>("");
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	
	// Filter states
	const [periods, setPeriods] = useState<Period[]>([]);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [selectedPeriod, setSelectedPeriod] = useState<string>("");
	const [selectedProvince, setSelectedProvince] = useState<string>("");
	const [selectedCity, setSelectedCity] = useState<string>("");
	const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

	// Fetch periods
	useEffect(() => {
		const fetchPeriods = async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/periods`);
				const json = await res.json();
				if (Array.isArray(json)) {
					setPeriods(json);
				}
			} catch (error) {
				console.error('[STRUKTUR] Error fetching periods:', error);
			}
		};
		fetchPeriods();
	}, [BASE_URL]);

	// Fetch provinces
	useEffect(() => {
		const fetchProvinces = async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/provinces`);
				const json = await res.json();
				if (json.success && json.data) {
					setProvinces(json.data);
				}
			} catch (error) {
				console.error('[STRUKTUR] Error fetching provinces:', error);
			}
		};
		fetchProvinces();
	}, [BASE_URL]);

	// Fetch cities when province changes
	useEffect(() => {
		if (!selectedProvince) {
			setCities([]);
			setSelectedCity("");
			return;
		}
		
		const fetchCities = async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/provinces/${selectedProvince}/cities`);
				const json = await res.json();
				if (json.success && json.data) {
					setCities(json.data);
				}
			} catch (error) {
				console.error('[STRUKTUR] Error fetching cities:', error);
			}
		};
		fetchCities();
	}, [selectedProvince, BASE_URL]);

	// Fetch data dari API
	const fetchStructures = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			
			if (selectedPeriod) {
				params.append("period", selectedPeriod);
			}
			
			if (selectedProvince) {
				params.append("province_id", selectedProvince);
			}
			
			if (selectedProvince && selectedCity) {
				params.append("city_id", selectedCity);
			}
			
			const url = `${BASE_URL}/api/structures${params.toString() ? '?' + params.toString() : ''}`;
			
			const res = await fetch(url);
			const json = await res.json();
			
			if (json.data && Array.isArray(json.data)) {
				setStructureLevels(json.data);
			}
		} catch (error) {
			console.error('[STRUKTUR] Error:', error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchStructures();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleApplyFilter = () => {
		fetchStructures();
		setShowFilterModal(false);
	};

	const handleResetFilter = () => {
		setSelectedPeriod("");
		setSelectedProvince("");
		setSelectedCity("");
	};

	// Filter berdasarkan search
	const filteredLevels = structureLevels.map(level => ({
		...level,
		positions: level.positions.filter(pos => {
			if (!searchText) return true;
			const search = searchText.toLowerCase();
			return pos.nama.toLowerCase().includes(search) || 
				   pos.jabatan.toLowerCase().includes(search);
		})
	})).filter(level => level.positions.length > 0);

	// Get initials for avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Group positions by category
	const groupPositionsByCategory = (positions: Position[]) => {
		const groups: Record<string, Position[]> = {};
		
		positions.forEach(position => {
			const jabatan = position.jabatan.toUpperCase();
			let category = "LAINNYA";
			
			// Define categories based on keywords
			if (jabatan.includes("DEWAN PENDIRI")) {
				category = "DEWAN PENDIRI";
			} else if (jabatan.includes("DEWAN PENASIHAT")) {
				category = "DEWAN PENASIHAT";
			} else if (jabatan.includes("MAJELIS KEHORMATAN")) {
				category = "MAJELIS KEHORMATAN";
			} else if (jabatan.includes("DEWAN PAKAR")) {
				category = "DEWAN PAKAR";
			} else if (jabatan.includes("DEWAN PEMBINA")) {
				category = "DEWAN PEMBINA";
			} else if (jabatan.includes("DEWAN PENGURUS HARIAN") || jabatan.includes("KETUA UMUM") || jabatan.includes("SEKRETARIS JENDERAL") || jabatan.includes("BENDAHARA UMUM")) {
				category = "DEWAN PENGURUS HARIAN";
			} else if (jabatan.includes("KOORDINATOR WILAYAH")) {
				category = "KOORDINATOR WILAYAH";
			} else if (jabatan.includes("KETATALAKSANAAN SEKRETARIAT")) {
				category = "KETATALAKSANAAN SEKRETARIAT";
			} else if (jabatan.includes("DEPARTEMEN ORGANISASI DAN KELEMBAGAAN")) {
				category = "DEPARTEMEN ORGANISASI DAN KELEMBAGAAN";
			} else if (jabatan.includes("DEPARTEMEN SENI DAN BUDAYA")) {
				category = "DEPARTEMEN SENI DAN BUDAYA";
			} else if (jabatan.includes("KESEJAHTERAAN DAN SOSIAL")) {
				category = "DEPARTEMEN KESEJAHTERAAN DAN SOSIAL";
			} else if (jabatan.includes("HUKUM, HAM DAN ADVOKASI")) {
				category = "DEPARTEMEN HUKUM, HAM DAN ADVOKASI";
			} else if (jabatan.includes("KERJASAMA DALAM DAN LUAR NEGERI")) {
				category = "DEPARTEMEN KERJASAMA DALAM DAN LUAR NEGERI";
			} else if (jabatan.includes("TEKNOLOGI, INFORMASI DAN KOMUNIKASI")) {
				category = "DEPARTEMEN TEKNOLOGI, INFORMASI DAN KOMUNIKASI";
			} else if (jabatan.includes("PENELITIAN DAN PENGEMBANGAN")) {
				category = "DEPARTEMEN PENELITIAN DAN PENGEMBANGAN";
			} else if (jabatan.includes("LEMBAGA PENGEMBANGAN EKONOMI SYARIAH") || jabatan.includes("LPES")) {
				category = "LEMBAGA PENGEMBANGAN EKONOMI SYARIAH (LPES)";
			} else if (jabatan.includes("LEMBAGA KAJIAN AL QUR'AN")) {
				category = "LEMBAGA KAJIAN AL QUR'AN";
			} else if (jabatan.includes("LEMBAGA AMIL ZAKAT") || jabatan.includes("LAZISWA")) {
				category = "LEMBAGA AMIL ZAKAT, INFAQ, SHADAQAH DAN WAKAF (LAZISWA)";
			} else if (jabatan.includes("LEMBAGA DIKLAT DAN PENGEMBANGAN PROFESI") || jabatan.includes("LDPP")) {
				category = "LEMBAGA DIKLAT DAN PENGEMBANGAN PROFESI (LDPP)";
			} else if (jabatan.includes("LEMBAGA PENDIDIKAN DAN PENGEMBANGAN PRESTASI")) {
				category = "LEMBAGA PENDIDIKAN DAN PENGEMBANGAN PRESTASI";
			}
			
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(position);
		});
		
		return groups;
	};

	const toggleSection = (levelId: number, category: string) => {
		const key = `${levelId}-${category}`;
		setExpandedSections(prev => ({
			...prev,
			[key]: !prev[key]
		}));
	};

	return (
		<>
			{/* =========== MOBILE VIEW - TAMPILAN LAMA =========== */}
			<div className="md:hidden bg-gray-50 min-h-screen pb-20">
				<TopBar withBackButton>Struktur Organisasi</TopBar>

				<div className="pt-[4.5rem] px-4 sm:px-6">
					
					{/* Hero Header */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative w-full min-h-[220px] bg-gradient-to-r from-[#009788] to-[#00796b] rounded-2xl overflow-hidden shadow-lg mb-6"
					>
						<div className="absolute top-0 right-0 p-8 opacity-10">
							<img src="/svg/indonesian.svg" alt="Pattern" className="w-64 h-64 object-cover" />
						</div>

						<div className="relative z-10 h-full flex flex-col justify-center px-6 py-8 text-white">
							<h1 className="text-xl sm:text-2xl font-bold mb-3 drop-shadow-md">
								Pengurus Nasional (DPP)
							</h1>
							<p className="text-white/90 text-sm max-w-2xl mb-6">
								Membangun sinergi dan kolaborasi untuk kemajuan pendidikan agama Islam di Indonesia.
							</p>
							
							<div className="flex flex-wrap gap-2">
								<div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium border border-white/10">
									<FaUserTie className="text-yellow-300 w-3 h-3" />
									<span>{loading ? "..." : structureLevels.length} Struktur</span>
								</div>
								{structureLevels.length > 0 && structureLevels[0].period && (
									<div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium border border-white/10">
										<span>Periode {structureLevels[0].period}</span>
									</div>
								)}
							</div>
						</div>
					</motion.div>

					{/* Search & Filter */}
					<div className="sticky top-[4.5rem] z-30 bg-gray-50/90 backdrop-blur-sm py-2 mb-6">
						<div className="flex gap-2 items-center">
							{/* Search Input */}
							<div className="relative flex-grow">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiSearch className="text-gray-400" />
								</div>
								<input
									type="text"
									placeholder="Cari nama atau jabatan..."
									className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009788] focus:border-transparent shadow-sm text-sm"
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</div>

							{/* Filter Button */}
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowFilterModal(true)}
								className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#009788] border border-[#009788]/20 font-semibold rounded-xl hover:bg-[#009788]/5 transition-colors shadow-sm text-sm flex-shrink-0"
							>
								<FiFilter />
								{(selectedPeriod || selectedProvince || selectedCity) && (
									<span className="ml-1 px-1.5 py-0.5 bg-[#009788] text-white text-[10px] rounded-full">
										{[selectedPeriod, selectedProvince, selectedCity].filter(Boolean).length}
									</span>
								)}
							</motion.button>
						</div>
					</div>

					{/* Content */}
					<div className="min-h-[400px] mb-10 space-y-4">
						{loading ? (
							<div className="space-y-4">
								{[...Array(3)].map((_, i) => (
									<div key={`m-skel-${i}`} className="bg-white p-6 rounded-2xl border border-gray-100">
										<Skeleton width={100} height={20} className="mb-4" />
										<Skeleton count={3} height={50} className="mb-2" />
									</div>
								))}
							</div>
						) : filteredLevels.length === 0 ? (
							<div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
								<div className="bg-gray-50 p-5 rounded-full mb-4">
									<FaUserTie className="w-10 h-10 text-gray-300" />
								</div>
								<h3 className="text-base font-medium text-gray-900">Data Tidak Ditemukan</h3>
								<p className="text-sm text-gray-500 mt-1">
									Tidak ada data pengurus yang sesuai.
								</p>
							</div>
						) : (
							<AnimatePresence>
								{filteredLevels.map((level) => (
									<motion.div
										key={`m-lvl-${level.id}`}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4"
									>
										{/* Level Header */}
										<div className="bg-gradient-to-r from-[#009788] to-[#00796b] px-4 py-3 flex items-center justify-between">
											<div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
												<span className="text-white font-bold text-sm tracking-wide">{level.level}</span>
											</div>
											<div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
												<span className="text-white font-semibold text-xs">
													{level.positions.length} Pengurus
												</span>
											</div>
										</div>

										{/* Members List - Grouped by Category */}
										<div className="p-3 space-y-2">
											{Object.entries(groupPositionsByCategory(level.positions)).map(([category, positions]) => {
												const sectionKey = `m-${level.id}-${category}`;
												const isExpanded = expandedSections[sectionKey];
												
												return (
													<div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
														{/* Category Header */}
														<button
															onClick={() => toggleSection(level.id, `m-${category}`)}
															className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
														>
															<div className="flex items-center gap-3">
																<div className="w-8 h-8 rounded-lg bg-[#009788]/10 flex items-center justify-center flex-shrink-0">
																	<span className="text-[#009788] font-bold text-xs">
																		{positions.length}
																	</span>
																</div>
																<div className="text-left flex-1 min-w-0">
																	<h4 className="text-xs font-bold text-gray-900 leading-tight">
																		{category}
																	</h4>
																</div>
															</div>
															<div className="text-gray-400 pl-2">
																{expandedSections[`${level.id}-m-${category}`] ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
															</div>
														</button>

														{/* Category Members */}
														<AnimatePresence>
															{expandedSections[`${level.id}-m-${category}`] && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: "auto", opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	transition={{ duration: 0.2 }}
																	className="overflow-hidden"
																>
																	<div className="p-2 space-y-1.5 bg-white">
																		{positions.map((position, idx) => (
																			<div
																				key={`m-pos-${idx}`}
																				className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-50 bg-white"
																			>
																				{/* Avatar */}
																				<div className="relative flex-shrink-0">
																					<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#009788] to-emerald-300 flex items-center justify-center">
																						<span className="text-white font-bold text-xs">
																							{getInitials(position.nama)}
																						</span>
																					</div>
																				</div>

																				{/* Info */}
																				<div className="flex-1 min-w-0">
																					<h3 className="text-gray-900 font-semibold text-xs leading-tight mb-0.5">
																						{position.nama}
																					</h3>
																					<p className="text-[#009788] text-[10px] font-medium leading-tight line-clamp-2">
																						{position.jabatan}
																					</p>
																				</div>
																			</div>
																		))}
																	</div>
																</motion.div>
															)}
														</AnimatePresence>
													</div>
												);
											})}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						)}
					</div>
				</div>
			</div>

			{/* =========== DESKTOP VIEW - TAMPILAN BARU PREMIUM =========== */}
			<div className="hidden md:block bg-gray-50 min-h-screen pb-28">
				<TopBar withBackButton href="/">
					Struktur Organisasi
				</TopBar>

				{/* Hero Banner Area */}
				<div className="bg-gradient-to-br from-[#006557] to-[#004D40] pt-[7rem] pb-[6rem] px-8 text-white relative">
					<div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
            <div className="max-w-2xl flex-1 z-10">
              <h1 className="text-4xl font-bold mb-4">Pengurus AGPAII Nasional</h1>
              <p className="opacity-80 text-lg mb-8 leading-relaxed">
                Membangun sinergi dan kolaborasi untuk kemajuan pendidikan agama Islam di Indonesia dari tingkat Pusat hingga Daerah.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-3 border border-white/20 shadow-sm">
                  <FaUserTie className="text-emerald-300 w-5 h-5" />
                  <span className="font-semibold">{loading ? "..." : structureLevels.length} Tingkat Pengurus</span>
                </div>
                {structureLevels.length > 0 && structureLevels[0].period && (
                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-3 border border-white/20 shadow-sm">
                    <span className="font-semibold">Periode {structureLevels[0].period}</span>
                  </div>
                )}
							</div>
            </div>

            <div className="hidden lg:flex w-[400px] relative z-10 justify-end">
              <img src="/svg/indonesian.svg" alt="Peta Indonesia" className="w-[300px] opacity-25" />
            </div>
					</div>
					
					{/* Background decorations */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
            <svg className="absolute -right-[10%] -top-[20%] w-[50%] h-[150%]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-67.8,67.6,-57.6,76.5,-45.3C85.4,-33,91.5,-18.6,90.9,-4.4C90.3,9.8,83.1,23.8,74.1,36C65.1,48.2,54.4,58.7,42.1,65.8C29.8,72.9,15.9,76.6,1.4,74.2C-13.1,71.8,-26.2,63.3,-38.7,55C-51.2,46.7,-63.1,38.6,-71.4,27.5C-79.7,16.4,-84.4,2.3,-82.3,-10.8C-80.2,-23.9,-71.3,-36.1,-60.7,-45.2C-50.1,-54.3,-37.8,-60.3,-25.7,-66.6C-13.6,-72.9,-1.7,-79.5,10.6,-81.7C22.9,-83.9,35.2,-81.7,42.7,-73.4Z" transform="translate(100 100)" />
            </svg>
          </div>
				</div>

				{/* Content Section */}
				<div className="max-w-[1400px] mx-auto px-8 -mt-8 relative z-20">
					
					{/* Inline Filter Desktop */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
						<div className="relative w-full lg:max-w-md">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400 w-5 h-5" />
							</div>
							<input
								type="text"
								placeholder="Cari nama atau jabatan..."
								className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006557]/20 focus:border-[#006557] focus:bg-white transition-all"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</div>

						<div className="flex w-full lg:w-auto gap-3 items-center">
							<select
								className="flex-1 lg:w-48 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none hover:border-[#006557] focus:ring-2 focus:ring-[#006557]/20 transition-all cursor-pointer"
								value={selectedPeriod}
								onChange={(e) => {
									setSelectedPeriod(e.target.value);
									// Langsung apply karena inline filter di desktop lebih interaktif (atau biarkan button apply)
								}}
							>
								<option value="">Semua Periode</option>
								{periods.map((p) => (
									<option key={`d-per-${p.value}`} value={p.value}>{p.label}</option>
								))}
							</select>

							<select
								className="flex-1 lg:w-48 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none hover:border-[#006557] focus:ring-2 focus:ring-[#006557]/20 transition-all cursor-pointer"
								value={selectedProvince}
								onChange={(e) => setSelectedProvince(e.target.value)}
							>
								<option value="">Semua Provinsi</option>
								{provinces.map((p) => (
									<option key={`d-prov-${p.id}`} value={p.id}>{p.name}</option>
								))}
							</select>

							<button
								onClick={handleApplyFilter}
								disabled={loading}
								className="bg-[#006557] hover:bg-[#004D40] text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
							>
								{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Terapkan"}
							</button>
						</div>
					</div>

					{/* Pengurus List Desktop */}
					<div className="space-y-8">
						{loading ? (
							<div className="grid grid-cols-1 gap-6">
								{[...Array(2)].map((_, i) => (
									<div key={`d-skel-${i}`} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
										<Skeleton width={200} height={30} className="mb-6" />
										<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
											<Skeleton count={1} height={80} />
											<Skeleton count={1} height={80} />
											<Skeleton count={1} height={80} />
											<Skeleton count={1} height={80} />
										</div>
									</div>
								))}
							</div>
						) : filteredLevels.length === 0 ? (
							<div className="py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
								<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
									<FaUserTie className="w-8 h-8 text-gray-300" />
								</div>
								<h3 className="text-lg font-bold text-gray-900 mb-1">Data Pengurus Kosong</h3>
								<p className="text-gray-500">Gunakan filter atau kata pencarian lain.</p>
							</div>
						) : (
							<AnimatePresence>
								{filteredLevels.map((level) => (
									<motion.div
										key={`desk-lvl-${level.id}`}
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
									>
										{/* Level Header Besar */}
										<div className="bg-gray-50 border-b border-gray-100 px-8 py-5 flex items-center justify-between">
											<h2 className="text-xl font-bold text-[#006557] tracking-wide flex items-center gap-3">
												<div className="w-2 h-6 bg-[#006557] rounded-full"></div>
												Tingkat: {level.level}
											</h2>
											<div className="bg-white px-4 py-1.5 rounded-lg border border-gray-200">
												<span className="text-gray-600 font-semibold text-sm">
													Total: {level.positions.length} Pengurus
												</span>
											</div>
										</div>

										<div className="p-8 space-y-8">
											{Object.entries(groupPositionsByCategory(level.positions)).map(([category, positions]) => {
												const sectionKey = `d-${level.id}-${category}`;
												// Desktop secara default biarkan semua terbuka atau gunakan state (disini asumsikan semua di expand di desktop atau biarkan collapsable dengan desain premium)
												const isExpanded = expandedSections[sectionKey] !== false; // default true for desktop might be better, or follow state
												
												return (
													<div key={`d-cat-${category}`} className="bg-white">
														<button
															onClick={() => toggleSection(level.id, `d-${category}`)}
															className="w-full flex items-center justify-between pb-4 border-b border-gray-100 group"
														>
															<div className="flex items-center gap-3">
																<div className="w-10 h-10 rounded-xl bg-emerald-50 fill-emerald-100 flex items-center justify-center group-hover:bg-[#006557] transition-colors">
																	<span className="text-[#006557] group-hover:text-white font-bold text-sm transition-colors">
																		{positions.length}
																	</span>
																</div>
																<h3 className="text-lg font-bold text-gray-800 group-hover:text-[#006557] transition-colors">
																	{category}
																</h3>
															</div>
															<div className="text-gray-400 group-hover:text-[#006557] transition-colors bg-gray-50 p-2 rounded-lg">
																{isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
															</div>
														</button>

														<AnimatePresence>
															{isExpanded && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: "auto", opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	className="overflow-hidden"
																>
																	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6 pb-2">
																		{positions.map((position, idx) => (
																			<div
																				key={`d-pos-${idx}`}
																				className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#006557]/30 hover:shadow-md hover:-translate-y-0.5 transition-all group"
																			>
																				<div className="flex-shrink-0">
																					<div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#006557] to-[#00A18C] flex items-center justify-center shadow-inner">
																						<span className="text-white font-bold text-lg">
																							{getInitials(position.nama)}
																						</span>
																					</div>
																				</div>

																				<div className="flex-1 min-w-0">
																					<h4 className="text-gray-900 font-bold text-sm mb-1 truncate group-hover:text-[#006557] transition-colors" title={position.nama}>
																						{position.nama}
																					</h4>
																					<p className="text-[#00897B] text-xs font-semibold leading-snug line-clamp-2" title={position.jabatan}>
																						{position.jabatan}
																					</p>
																				</div>
																			</div>
																		))}
																	</div>
																</motion.div>
															)}
														</AnimatePresence>
													</div>
												);
											})}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						)}
					</div>
				</div>
			</div>

			{/* Filter Modal Khusus Mobile */}
			<AnimatePresence>
				{showFilterModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:hidden">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setShowFilterModal(false)}
							className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="relative z-10 w-full max-w-md top-10 max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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

							<div className="p-6 overflow-y-auto flex-1 space-y-5">
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
											{periods.map((period) => (
												<option key={period.value} value={period.value}>
													{period.label}
												</option>
											))}
										</select>
										<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
											<FiChevronDown />
										</div>
									</div>
								</div>

								<div className="h-px bg-gray-100"></div>

								{/* Wilayah Section */}
								<div className="space-y-4">
									<p className="text-sm font-semibold text-gray-700">Wilayah</p>
									
									{/* Provinsi */}
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
										<p className="text-xs text-gray-500">
											Pilih provinsi untuk melihat struktur DPW
										</p>
									</div>

									{/* Kota/Kabupaten */}
									<div className="space-y-2">
										<label className="text-xs text-gray-500 font-medium uppercase">Kota / Kabupaten</label>
										<div className="relative">
											<select
												className={`w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788] ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
												value={selectedCity}
												onChange={(e) => setSelectedCity(e.target.value)}
												disabled={!selectedProvince}
											>
												<option value="">-- Pilih Kota --</option>
												{cities.map((city) => (
													<option key={city.id} value={city.id}>{city.name}</option>
												))}
											</select>
											<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
												<FiChevronDown />
											</div>
										</div>
										<p className="text-xs text-gray-500">
											Pilih kota untuk melihat struktur DPD
										</p>
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
									{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
									Terapkan Filter
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
};

export default StrukturPage;
