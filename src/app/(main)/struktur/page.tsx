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
		} else {
			const foundProvince = provinces.find(
				(prov) => String(prov.id) === selectedProvince,
			);
			pengurusLabel = foundProvince
				? `Pengurus ${foundProvince.name}`
				: "Pengurus";
		}
	}
	
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

	const toggleCategory = (category: string) => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category]
		}));
	};

	const getCategory = (position: string) => {
		const lower = position.toLowerCase();
		if (lower.includes("dewan")) return "Dewan";
		if (lower.includes("ketua") || lower.includes("wakil ketua")) return "Pimpinan / Ketua";
		if (lower.includes("sekretaris") || lower.includes("wakil sekretaris")) return "Sekretariat";
		if (lower.includes("bendahara") || lower.includes("wakil bendahara")) return "Kebendaharaan";
		if (lower.includes("departemen")) return "Departemen";
		if (lower.includes("bidang") || lower.includes("seksi")) return "Bidang & Seksi";
		if (lower.includes("koordinator")) return "Koordinator";
		return "Pengurus Lainnya";
	};

	// --- Grouping Logic ---
	const groupedStructures = React.useMemo(() => {
		// Level 1: Group properties
		interface PositionGroup {
			positionName: string;
			members: Structure[];
			order: number;
		}
		
		interface MainCategory {
			categoryName: string;
			subGroups: PositionGroup[];
			minOrder: number;
		}

		const categoryMap: Record<string, Record<string, Structure[]>> = {};

		// 1. Group by Main Category -> Position Name
		filteredStructures.forEach((str) => {
			const pos = str.position_name || "Lainnya";
			const cat = getCategory(pos);

			if (!categoryMap[cat]) categoryMap[cat] = {};
			if (!categoryMap[cat][pos]) categoryMap[cat][pos] = [];
			categoryMap[cat][pos].push(str);
		});

		// 2. Convert to Array and Sort
		const result: MainCategory[] = Object.entries(categoryMap).map(([catName, subMap]) => {
			const subGroups: PositionGroup[] = Object.entries(subMap).map(([posName, members]) => ({
				positionName: posName,
				members,
				order: Math.min(...members.map(m => m.order_position || 9999))
			})).sort((a, b) => a.order - b.order);

			const minOrder = Math.min(...subGroups.map(sg => sg.order));

			return {
				categoryName: catName,
				subGroups,
				minOrder
			};
		});

		// Custom sort order for categories
		const categoryOrder = [
			"Dewan", 
			"Pimpinan / Ketua", 
			"Sekretariat", 
			"Kebendaharaan", 
			"Departemen", 
			"Bidang & Seksi", 
			"Koordinator",
			"Pengurus Lainnya"
		];
		
		return result.sort((a, b) => {
			const idxA = categoryOrder.indexOf(a.categoryName);
			const idxB = categoryOrder.indexOf(b.categoryName);
			// If both known, sort by index
			if (idxA !== -1 && idxB !== -1) return idxA - idxB;
			// If one known, known comes first
			if (idxA !== -1) return -1;
			if (idxB !== -1) return 1;
			// Fallback to minOrder
			return a.minOrder - b.minOrder;
		});
	}, [filteredStructures]);

	return (
		<div className="bg-gray-50 min-h-screen pb-20">
			<TopBar withBackButton>Struktur Organisasi</TopBar>

			<div className="pt-[4.5rem] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				
				{/* Hero Header */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative w-full min-h-[220px] bg-gradient-to-r from-[#009788] to-[#00796b] rounded-2xl overflow-hidden shadow-lg mb-6"
				>
					<div className="absolute top-0 right-0 p-8 opacity-10">
						<img src="/svg/indonesian.svg" alt="Pattern" className="w-64 h-64 object-cover" />
					</div>

					<div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 py-8 text-white">
						<h1 className="text-2xl sm:text-3xl font-bold mb-3 drop-shadow-md">
							Pengurus Nasional (DPP)
						</h1>
						<p className="text-white/90 text-sm sm:text-base max-w-2xl mb-6">
							Membangun sinergi dan kolaborasi untuk kemajuan pendidikan agama Islam di Indonesia.
						</p>
						
						<div className="flex flex-wrap gap-3">
							<div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium border border-white/10">
								<FaUserTie className="text-yellow-300" />
								<span>{loading ? "..." : structureLevels.length} Struktur</span>
							</div>
							{structureLevels.length > 0 && structureLevels[0].period && (
								<div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium border border-white/10">
									<span>Periode {structureLevels[0].period}</span>
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* Search & Filter */}
				<div className="sticky top-[4.5rem] z-30 bg-gray-50/90 backdrop-blur-sm py-2 mb-6">
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
						{/* Search Input */}
						<div className="relative flex-grow max-w-lg">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Cari nama atau jabatan..."
								className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009788] focus:border-transparent shadow-sm"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</div>

						{/* Filter Button */}
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => setShowFilterModal(true)}
							className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#009788] border border-[#009788]/20 font-semibold rounded-xl hover:bg-[#009788]/5 transition-colors shadow-sm"
						>
							<FiFilter />
							<span>Filter</span>
							{(selectedPeriod || selectedProvince || selectedCity) && (
								<span className="ml-1 px-2 py-0.5 bg-[#009788] text-white text-xs rounded-full">
									{[selectedPeriod, selectedProvince, selectedCity].filter(Boolean).length}
								</span>
							)}
						</motion.button>
					</div>
				</div>

				{/* Content */}
				<div className="min-h-[400px] mb-10 max-w-4xl mx-auto space-y-6">
					{loading ? (
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
									<Skeleton width={100} height={30} className="mb-4" />
									<Skeleton count={3} height={60} className="mb-2" />
								</div>
							))}
						</div>
					) : filteredLevels.length === 0 ? (
						<div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
							<div className="bg-gray-50 p-6 rounded-full mb-4">
								<FaUserTie className="w-12 h-12 text-gray-300" />
							</div>
							<h3 className="text-lg font-medium text-gray-900">Data Tidak Ditemukan</h3>
							<p className="text-gray-500 mt-1">
								Tidak ada data pengurus yang sesuai dengan pencarian Anda.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-6">
							{groupedStructures.map((category) => {
								const isExpanded = expandedCategories[category.categoryName];
								
								return (
									<div key={category.categoryName} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
										{/* Category Header (Accordion Toggle) */}
										<motion.button
											onClick={() => toggleCategory(category.categoryName)}
											className="w-full flex items-center justify-between p-5 bg-white text-left group"
										>
											<div className="flex items-center gap-4">
												<div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#009788]/10 text-[#009788]' : 'bg-gray-100 text-gray-500 group-hover:bg-[#009788]/5 group-hover:text-[#009788]'}`}>
													{isExpanded ? <FiCheck size={20} /> : <FaUserTie size={18} />} 
												</div>
												<div>
													<h3 className="text-lg font-bold text-gray-800 group-hover:text-[#009788] transition-colors">
														{category.categoryName}
													</h3>
													<p className="text-sm text-gray-500">
														{category.subGroups.reduce((acc, sub) => acc + sub.members.length, 0)} Anggota
													</p>
												</div>
											</div>
											<motion.div
												animate={{ rotate: isExpanded ? 180 : 0 }}
												transition={{ duration: 0.2 }}
											>
												<FiChevronDown className="text-gray-400 group-hover:text-[#009788]" size={24} />
											</motion.div>
										</motion.button>

										{/* Expandable Content */}
										<AnimatePresence>
											{isExpanded && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
												>
													<div className="border-t border-gray-50 p-5 pt-2 flex flex-col gap-8 bg-gray-50/30">
														{category.subGroups.map((subGroup) => (
															<div key={subGroup.positionName} className="flex flex-col gap-3">
																{/* Sub Header (Position Name) */}
																<div className="flex items-center gap-3 pl-2 border-l-4 border-[#009788]/30">
																	<h4 className="text-md font-bold text-gray-700">
																		{subGroup.positionName}
																	</h4>
																</div>

																{/* Members Grid */}
																<div className="grid grid-cols-1 gap-4">
																	{subGroup.members.map((str, index) => {
																		const avatarSrc = (str.user?.avatar && getImage(str.user.avatar)) || "/img/profileplacholder.png";
																		return (
																			<motion.div
																				layout
																				initial={{ opacity: 0, scale: 0.95 }}
																				animate={{ opacity: 1, scale: 1 }}
																				transition={{ duration: 0.2, delay: index * 0.05 }}
																				key={str.id}
																				className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-[#009788]/30 hover:shadow-sm transition-all"
																			>
																				{/* Avatar */}
																				<div className="relative flex-shrink-0">
																					<div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#009788] to-emerald-300">
																						<img
																							src={avatarSrc}
																							alt={str.user?.name || "User"}
																							className="w-full h-full object-cover rounded-full border-2 border-white bg-white"
																						/>
																					</div>
																					<div className="absolute -bottom-1 -right-1 bg-[#009788] text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm border border-white">
																						{str.order_position || "-"}
																					</div>
																				</div>
																				
																				{/* Info */}
																				<div className="flex-1 min-w-0">
																					<h5 className="text-gray-900 font-bold text-base truncate" title={str.user?.name}>
																						{str.user ? str.user.name : "Belum diisi"}
																					</h5>
																					<div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
																						<FiMapPin size={10} className="shrink-0 text-gray-400" />
																						<span className="truncate">
																							{str.district?.name ? str.district.name + ", " : ""}
																							{str.city?.name || str.province?.name || "Nasional"}
																						</span>
																					</div>
																				</div>
																			</motion.div>
																		);
																	})}
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
					)}
				</div>
			</div>

			{/* Filter Modal */}
			<AnimatePresence>
				{showFilterModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
									{loading ? <span className="animate-spin">⏳</span> : null}
									Terapkan Filter
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default StrukturPage;
