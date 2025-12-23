"use client";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoAgpaii from "../../../../../public/icons/logo_agpaii.png";

interface Regency {
	code: string;
	name: string;
}

interface Jadwal {
	id: number;
	regency_code: string;
	regency_name: string;
	date: string;
	imsyak: string;
	shubuh: string;
	terbit: string;
	dhuha: string;
	dzuhur: string;
	ashr: string;
	maghrib: string;
	isya: string;
}

const ImsakRamadhan = () => {
	const [regencies, setRegencies] = useState<Regency[]>([]);
	const [filteredRegencies, setFilteredRegencies] = useState<Regency[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedRegency, setSelectedRegency] = useState<string>("");
	const [selectedRegencyName, setSelectedRegencyName] = useState<string>("");
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [schedule, setSchedule] = useState<Jadwal[]>([]);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState({
		regencies: true,
		schedule: false,
	});
	const [error, setError] = useState<{
		type: "api_unavailable" | "network" | null;
		message: string;
	}>({ type: null, message: "" });

	const API_BASE_URL = process.env.NEXT_PUBLIC_PRAYER_TIMES_API_URL;
	const API_KEY = process.env.NEXT_PUBLIC_PRAYER_TIMES_API_KEY;

	const apiHeaders = {
		'accept': 'application/json',
		'x-api-co-id': API_KEY || '',
	};

	// Set mounted state to prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Update current time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Fetch regencies on mount
	useEffect(() => {
		const fetchRegencies = async () => {
			try {
				let allRegencies: Regency[] = [];
				let currentPage = 1;
				let totalPages = 1;

				// Fetch all pages
				while (currentPage <= totalPages) {
					const response = await axios.get(
						`${API_BASE_URL}/regencies?page=${currentPage}`,
						{ headers: apiHeaders }
					);
					
					if (response.data.is_success) {
						allRegencies = [...allRegencies, ...response.data.data];
						totalPages = response.data.paging.total_page;
						currentPage++;
					} else {
						break;
					}
				}

				setRegencies(allRegencies);
				setFilteredRegencies(allRegencies);
				console.log('Total regencies loaded:', allRegencies.length);
				setError({ type: null, message: "" });
			} catch (error: any) {
				console.error("Error fetching regencies:", error);
				setError({
					type: "network",
					message:
						"Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.",
				});
			} finally {
				setLoading((prev) => ({ ...prev, regencies: false }));
			}
		};
		fetchRegencies();
	}, []);

	// Filter regencies based on search query
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredRegencies(regencies);
		} else {
			const filtered = regencies.filter(r => 
				r.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredRegencies(filtered);
		}
	}, [searchQuery, regencies]);

	const handleSelectRegency = (code: string, name: string) => {
		setSelectedRegency(code);
		setSelectedRegencyName(name);
		setIsDropdownOpen(false);
		setSearchQuery("");
		fetchSchedule(code);
	};

	const fetchSchedule = async (regencyCode: string) => {
		if (!regencyCode) return;

		try {
			setLoading((prev) => ({ ...prev, schedule: true }));
			
			// Get wider date range for Ramadhan 2026 (perkiraan)
			// Fetch Feb-Mar 2026 to ensure we get all possible Ramadhan dates
			const startDate = "2026-02-01";
			const endDate = "2026-03-31";

			let allSchedules: Jadwal[] = [];
			let currentPage = 1;
			let totalPages = 1;

			// Fetch all pages for the date range
			while (currentPage <= totalPages) {
				const response = await axios.get(
					`${API_BASE_URL}?regency_code=${regencyCode}&start_date=${startDate}&end_date=${endDate}&page=${currentPage}`,
					{ headers: apiHeaders }
				);

				if (response.data.is_success) {
					allSchedules = [...allSchedules, ...response.data.data];
					totalPages = response.data.paging.total_page;
					currentPage++;
				} else {
					break;
				}
			}

			// Filter to get approximately 29-30 days starting from mid-February
			// This is an estimation - actual dates will be confirmed by government
			const ramadhanStart = new Date('2026-02-18');
			const ramadhanSchedules = allSchedules.filter(item => {
				const itemDate = new Date(item.date);
				return itemDate >= ramadhanStart;
			}).slice(0, 30); // Take first 30 days as estimation

			setSchedule(ramadhanSchedules);
			setError({ type: null, message: "" });
		} catch (error: any) {
			console.error("Error fetching schedule:", error);
			setError({
				type: "network",
				message:
					"Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.",
			});
		} finally {
			setLoading((prev) => ({ ...prev, schedule: false }));
		}
	};

	const handleExportPDF = async () => {
		const doc = new jsPDF("p", "mm", "a4");
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 10;

		const selectedRegencyName = regencies.find(r => r.code === selectedRegency)?.name || "";

		const addHeader = async (pageNumber: number) => {
			const logoDataUrl = logoAgpaii.src;
			if (logoDataUrl) {
				doc.addImage(logoDataUrl, "PNG", margin, margin, 20, 20);
			}
			doc.setFontSize(18);
			doc.text("AGPAII", pageWidth / 2, margin + 8, { align: "center" });
			doc.setFontSize(12);
			doc.text(
				`Jadwal Imsak Ramadhan 2026 - ${selectedRegencyName}`,
				pageWidth / 2,
				margin + 15,
				{ align: "center" }
			);
		};

		const tableData = schedule.map((item, index) => [
			index + 1,
			new Date(item.date).toLocaleDateString('id-ID', { 
				weekday: 'long',
				day: '2-digit', 
				month: 'long',
				year: 'numeric'
			}),
			item.imsyak,
		]);

		const header = ["Hari Ke-", "Tanggal", "Waktu Imsak"];

		let startY = 35;
		let pageNumber = 1;

		await addHeader(pageNumber);

		(doc as any).autoTable({
			head: [header],
			body: tableData,
			startY: startY,
			margin: { left: margin, right: margin },
			pageBreak: "auto",
			didDrawPage: async (data: any) => {
				if (data.pageNumber > pageNumber) {
					pageNumber = data.pageNumber;
					await addHeader(pageNumber);
					startY = 35;
				}
			},
			styles: {
				fontSize: 10,
				cellPadding: 3,
				halign: "center",
				valign: "middle",
			},
			headStyles: {
				fillColor: [0, 151, 136],
				textColor: 255,
				fontStyle: "bold",
				halign: "center",
			},
			columnStyles: { 
				0: { halign: "center", cellWidth: 20 },
				1: { halign: "left", cellWidth: 100 },
				2: { halign: "center", cellWidth: 30 }
			},
		});

		doc.save(`jadwal-imsak-ramadhan-2026-${selectedRegencyName}.pdf`);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 pt-[4.2rem]">
			<TopBar withBackButton>Jadwal Imsakiyah</TopBar>

			<div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
				{/* Clock Widget */}
				<div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-6 shadow-xl text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm opacity-90 mb-1">Waktu Sekarang</p>
							{mounted ? (
								<>
									<p className="text-4xl font-bold tracking-tight">
										{currentTime.toLocaleTimeString('id-ID', { 
											hour: '2-digit', 
											minute: '2-digit',
											second: '2-digit'
										})}
									</p>
									<p className="text-sm opacity-90 mt-2">
										{currentTime.toLocaleDateString('id-ID', { 
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											year: 'numeric'
										})}
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
							<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				{/* Ramadhan Info Banner */}
				<div className="bg-white rounded-2xl p-5 shadow-lg border border-teal-100">
					<div className="flex items-center gap-3 mb-3">
						<div className="bg-teal-100 rounded-full p-2">
							<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-md text-gray-800">Ramadhan 1447 H</h3>
							<p className="text-md text-gray-600">Perkiraan: Pertengahan Februari - Maret 2026</p>
						</div>
					</div>
					<div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200">
						<div className="flex items-start gap-2">
							<svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p className="text-md text-gray-700">
								<span className="font-semibold">Catatan:</span> Tanggal pasti Ramadhan akan ditentukan berdasarkan penetapan pemerintah melalui sidang isbat. Jadwal ini merupakan perkiraan berdasarkan perhitungan kalender Hijriyah.
							</p>
						</div>
					</div>
				</div>

				{/* Error State */}
				{error.type === "network" && (
					<div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="bg-red-100 rounded-full p-4">
								<svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
								<p className="text-gray-600 text-sm mb-4">{error.message}</p>
								<button
									onClick={() => window.location.reload()}
									className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition font-medium">
									Coba Lagi
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Location Selection */}
				{!error.type && (
					<div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
						<h3 className="font-bold text-gray-800 flex items-center gap-2">
							<svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Pilih Lokasi
						</h3>

						{/* Custom Dropdown with Search */}
						<div className="relative">
							<label className="block text-md font-medium text-gray-700 mb-2">
								Kabupaten/Kota
							</label>
							
							{/* Dropdown Button */}
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								disabled={loading.regencies}
								className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-left flex items-center justify-between bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
								<span className={selectedRegencyName ? "text-gray-900" : "text-gray-500"}>
									{selectedRegencyName || "-- Pilih Kabupaten/Kota --"}
								</span>
								<svg 
									className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown Menu */}
							{isDropdownOpen && (
								<div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
									{/* Search Input Inside Dropdown */}
									<div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
										<div className="relative">
											<input
												type="text"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												placeholder="Cari kabupaten/kota..."
												className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
												autoFocus
											/>
											<svg 
												className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
												fill="none" 
												stroke="currentColor" 
												viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
											</svg>
										</div>
										{searchQuery && (
											<p className="text-xs text-gray-500 mt-1">
												{filteredRegencies.length} hasil ditemukan
											</p>
										)}
									</div>

									{/* Options List */}
									<div className="overflow-y-auto max-h-80">
										{filteredRegencies.length > 0 ? (
											filteredRegencies.map((regency) => (
												<button
													key={regency.code}
													type="button"
													onClick={() => handleSelectRegency(regency.code, regency.name)}
													className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition ${
														selectedRegency === regency.code ? 'bg-teal-100 text-teal-700 font-medium' : 'text-gray-700'
													}`}>
													{regency.name}
												</button>
											))
										) : (
											<div className="px-4 py-8 text-center text-gray-500">
												<svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<p className="text-sm">Tidak ada hasil untuk "{searchQuery}"</p>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Close dropdown when clicking outside */}
							{isDropdownOpen && (
								<div 
									className="fixed inset-0 z-0" 
									onClick={() => {
										setIsDropdownOpen(false);
										setSearchQuery("");
									}}
								/>
							)}
						</div>
					</div>
				)}

				{/* Loading State */}
				{loading.schedule && (
					<div className="bg-white rounded-2xl p-8 shadow-lg">
						<div className="flex flex-col items-center space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
							<p className="text-gray-600 font-medium">Memuat jadwal imsak...</p>
						</div>
					</div>
				)}

				{/* Schedule Display */}
				{!loading.schedule && schedule.length > 0 && (
					<>
						{/* Schedule Cards */}
						<div className="space-y-3">
							{schedule.map((item, index) => (
								<div
									key={item.id}
									className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-teal-200">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-3 min-w-[60px] text-center">
												<p className="text-white text-2xl font-bold">{index + 1}</p>
												<p className="text-white text-xs opacity-90">Hari</p>
											</div>
											<div>
												<p className="font-semibold text-gray-800 text-lg">
													{new Date(item.date).toLocaleDateString('id-ID', { 
														weekday: 'long'
													})}
												</p>
												<p className="text-gray-600 text-sm">
													{new Date(item.date).toLocaleDateString('id-ID', { 
														day: 'numeric',
														month: 'long',
														year: 'numeric'
													})}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-xs text-gray-500 mb-1">Waktu Imsak</p>
											<div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl px-4 py-2 border-2 border-amber-200">
												<p className="text-3xl font-bold text-amber-700">{item.imsyak}</p>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Summary */}
						<div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-5 shadow-lg text-white">
							<div className="text-center">
								<p className="text-sm opacity-90 mb-1">Total Hari (Perkiraan)</p>
								<p className="text-4xl font-bold">{schedule.length}</p>
								<p className="text-sm opacity-90 mt-1">Hari</p>
								<p className="text-xs opacity-75 mt-3 border-t border-white/20 pt-3">
									Jumlah hari dapat berubah sesuai penetapan resmi
								</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default ImsakRamadhan;
