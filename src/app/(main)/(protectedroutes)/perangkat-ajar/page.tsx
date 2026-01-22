"use client";
import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import API from "@/utils/api/config";
import { cekDanUbahType } from "@/utils/function/function";

interface JenjangOption {
	id: number;
	description: string;
	name: string;
	created_at: string;
	updated_at: string;
	educational_level_id: number;
}

interface CardData {
	id: number;
	type: string;
	grade?: { id: number; description: string };
	topic: string;
	created_at: string;
	image: string;
	original_lesson_plan_id?: number | null;
	original?: {
		user?: {
			name: string;
		};
	};
	likes_count?: number;
	downloads?: number;
	reposts?: number;
}

const PerangkatAjarPage: React.FC = () => {
	const router = useRouter();
	const { auth: user } = useAuth();
	const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
	const [cards, setCards] = useState<CardData[]>([]);
	const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filterType, setFilterType] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("latest");
	const [jenjangOptions, setJenjangOptions] = useState<JenjangOption[]>([]);
	const [selectedJenjang, setSelectedJenjang] = useState<any>(null);
	const observerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const fetchJenjangOptions = async () => {
			try {
				const response = await API.get("/grade");
				setJenjangOptions(response.data);
			} catch (error) {
				console.error("Error fetching jenjang options:", error);
			}
		};
		fetchJenjangOptions();
	}, []);

	const fetchCards = async (currentPage: number, append: boolean) => {
		try {
			const token = localStorage.getItem("access_token");
			
			const endpoint =
				activeTab === "all"
					? "https://2024.agpaiidigital.org/api/bahanajar"
					: "https://2024.agpaiidigital.org/api/bahanajar/me/list";

			const headers = activeTab === "mine" && token 
				? { Authorization: `Bearer ${token}` }
				: {};

			// Build query params
			let queryParams = `limit=10&page=${currentPage}`;
			
			// Add sort parameter for "all" tab
			if (activeTab === "all" && sortBy) {
				queryParams += `&sort=${sortBy}`;
			}

			const response = await axios.get(
				`${endpoint}?${queryParams}`,
				{ headers }
			);

			if (response.data.data.length > 0) {
				let uniqueCards = append
					? [
							...new Map(
								[...cards, ...response.data.data].map((item) => [
									item.id,
									item,
								]),
							).values(),
					  ]
					: response.data.data;
				
				// Sort by latest (newest first) if sortBy is "latest"
				if (sortBy === "latest") {
					uniqueCards = [...uniqueCards].sort((a, b) => 
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
					);
				}
				
				setCards(uniqueCards);
				setFilteredCards(uniqueCards);
				setPage(currentPage + 1);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error fetching cards:", error);
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCards(1, false);
	}, [activeTab, sortBy]);

	useEffect(() => {
		if (!observerRef.current || !hasMore || isLoading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchCards(page, true);
				}
			},
			{ threshold: 1.0 },
		);

		observer.observe(observerRef.current);

		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [page, hasMore, isLoading]);

	useEffect(() => {
		const lowerCaseQuery = searchQuery.toLowerCase();
		let filtered = cards.filter(
			(card) =>
				card.topic.toLowerCase().includes(lowerCaseQuery) &&
				(filterType === "all" || card.type === filterType) &&
				(!selectedJenjang || card.grade?.id === selectedJenjang),
		);
		
		// Sort filtered results by latest if sortBy is "latest"
		if (sortBy === "latest") {
			filtered = filtered.sort((a, b) => 
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		}
		
		setFilteredCards(filtered);
	}, [searchQuery, filterType, cards, selectedJenjang, sortBy]);

	return (
		<div className="pt-[5.21rem] bg-gray-50 min-h-screen">
			<TopBar withBackButton>
				<div className="flex items-center justify-between w-full">
					<span>Perangkat Ajar</span>
					<button
						onClick={() => router.push("/perangkat-ajar/tambah")}
						className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#006557] rounded-lg font-medium transition-all shadow-sm border border-[#006557]">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span className="hidden sm:inline">Tambah</span>
					</button>
				</div>
			</TopBar>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm">
					<button
						className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
							activeTab === "all" 
								? "bg-[#006557] text-white shadow-md" 
								: "text-gray-600 hover:bg-gray-50"
						}`}
						onClick={() => {
							setActiveTab("all");
							setCards([]);
							setPage(1);
							setHasMore(true);
							setIsLoading(true);
						}}>
						<div className="flex items-center justify-center gap-2">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							Semua Perangkat
						</div>
					</button>
					<button
						className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
							activeTab === "mine" 
								? "bg-[#006557] text-white shadow-md" 
								: "text-gray-600 hover:bg-gray-50"
						}`}
						onClick={() => {
							setActiveTab("mine");
							setCards([]);
							setPage(1);
							setHasMore(true);
							setIsLoading(true);
						}}>
						<div className="flex items-center justify-center gap-2">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Perangkat Saya
						</div>
					</button>
				</div>

				{/* Search and Filter */}
				{activeTab === "all" && (
					<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
						<div className="space-y-4">
							{/* Search Input */}
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								<input
									type="text"
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006557] focus:border-transparent outline-none transition-all"
									placeholder="Cari perangkat ajar..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>

							{/* Filter Grid */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Sort By */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Urutkan
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006557] focus:border-transparent outline-none transition-all bg-white"
										value={sortBy}
										onChange={(e) => {
											setSortBy(e.target.value);
											setCards([]);
											setPage(1);
											setHasMore(true);
											setIsLoading(true);
										}}>
										<option value="latest">🕐 Terbaru</option>
										<option value="most_liked">❤️ Paling Disukai</option>
										<option value="downloads">⬇️ Paling Diunduh</option>
										<option value="reposts">🔄 Paling Direpost</option>
									</select>
								</div>

								{/* Filter Type */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tipe
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006557] focus:border-transparent outline-none transition-all bg-white"
										value={filterType}
										onChange={(e) => setFilterType(e.target.value)}>
										<option value="all">Semua Tipe</option>
										<option value="Materi ajar & RPP">Materi ajar/RPP</option>
										<option value="Bahan ajar">Bahan Tayang</option>
										<option value="Buku">Materi Ajar</option>
										<option value="LKPD">LKPD</option>
									</select>
								</div>

								{/* Filter Jenjang */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Jenjang
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006557] focus:border-transparent outline-none transition-all bg-white"
										value={selectedJenjang}
										onChange={(e) =>
											setSelectedJenjang(
												e.target.value === "all" ? "all" : parseInt(e.target.value),
											)
										}>
										<option value="all">Semua Jenjang</option>
										{jenjangOptions.map((option) => (
											<option key={option.id} value={option.id}>
												{option.description}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Empty state for "mine" tab */}
				{activeTab === "mine" && !isLoading && cards.length === 0 && (
					<div className="text-center py-12 mb-6">
						<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p className="text-gray-500 font-medium">Anda belum memiliki perangkat ajar</p>
						<p className="text-gray-400 text-sm mt-1">Klik tombol "Tambah" di atas untuk membuat yang pertama</p>
					</div>
				)}

				{/* Card List */}
				<div className="space-y-3 mb-6">
					{isLoading ? (
						<div className="flex justify-center items-center py-12">
							<div className="flex flex-col items-center gap-3">
								<div className="w-12 h-12 border-4 border-[#006557] border-t-transparent rounded-full animate-spin"></div>
								<p className="text-gray-600">Memuat data...</p>
							</div>
						</div>
					) : filteredCards.length === 0 ? (
						<div className="text-center py-12">
							<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p className="text-gray-500 font-medium">Tidak ada data ditemukan</p>
							<p className="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
						</div>
					) : (
						filteredCards.map((item) => (
							<div
								onClick={() => router.push(`/perangkat-ajar/${item.id}`)}
								key={item.id}
								className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
								<div className="flex gap-3 p-3 sm:p-4">
									{/* Image - Left Side */}
									<div className="flex-shrink-0">
										<div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100">
											<img
												src={`https://2024.agpaiidigital.org/${item.image}`}
												alt={item.topic}
												className="w-full h-full object-cover"
												onError={(e) => {
													(e.target as HTMLImageElement).src = "/img/placeholder.png";
												}}
											/>
										</div>
									</div>

									{/* Content - Middle */}
									<div className="flex-1 min-w-0 flex flex-col justify-between">
										{/* Top Section */}
										<div>
											{/* Badge */}
											<div className="mb-1.5">
												<span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#006557] bg-[#006557]/10 px-2 py-0.5 rounded-full">
													<span className="w-1 h-1 bg-[#006557] rounded-full"></span>
													{item.grade?.description || "Kelas 10"}
												</span>
											</div>

											{/* Title */}
											<h2 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-1.5 line-clamp-2">
												{item.topic}
											</h2>

											{/* Author & School - Hidden on mobile */}
											<div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 mb-2">
												<span>Oleh Salsa Amani</span>
												<span className="text-gray-400">•</span>
												<span className="text-gray-500">Sma</span>
											</div>
										</div>

										{/* Bottom Section */}
										<div className="flex flex-wrap items-center gap-2 mt-2">
											{/* Date */}
											<div className="text-[10px] sm:text-xs text-gray-500">
												{moment(item.created_at).format("DD MMM YYYY")}
											</div>

											{/* Repost Badge - Smaller on mobile */}
											{item?.original_lesson_plan_id && item?.original?.user?.name && (
												<div className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9px] sm:text-[10px] font-semibold">
													<svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
													</svg>
													<span className="hidden sm:inline">Repost dari {item.original.user.name}</span>
													<span className="sm:hidden">Repost</span>
												</div>
											)}
										</div>
									</div>

									{/* Statistics - Right Side */}
									<div className="flex flex-col items-end justify-center gap-2 sm:gap-2.5 flex-shrink-0">
										{/* Likes */}
										<div className="flex items-center gap-1 sm:gap-1.5">
											<svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
											</svg>
											<span className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">{item.likes_count || 0}</span>
										</div>

										{/* Downloads */}
										<div className="flex items-center gap-1 sm:gap-1.5">
											<svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
											</svg>
											<span className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">{item.downloads || 0}</span>
										</div>

										{/* Reposts */}
										<div className="flex items-center gap-1 sm:gap-1.5">
											<svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
											<span className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">{item.reposts || 0}</span>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Infinite Scroll Trigger */}
				{hasMore && !isLoading && (
					<div ref={observerRef} className="h-10" />
				)}

				{isLoading && filteredCards.length > 0 && (
					<div className="text-center py-8">
						<div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm">
							<div className="w-5 h-5 border-2 border-[#006557] border-t-transparent rounded-full animate-spin"></div>
							<span className="text-gray-600 font-medium">Memuat lebih banyak...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PerangkatAjarPage;
