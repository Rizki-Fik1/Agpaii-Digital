"use client";
import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";

// ============ DUMMY DATA ============

// Jenjang Pendidikan
const JENJANG_DATA = [
	{ id: 1, name: "PAUD", description: "PAUD" },
	{ id: 2, name: "SD", description: "SD/MI" },
	{ id: 3, name: "SMP", description: "SMP/MTs" },
	{ id: 4, name: "SMA", description: "SMA/MA" },
	{ id: 5, name: "SMK", description: "SMK" },
];

// Fase berdasarkan Kurikulum Merdeka
const FASE_DATA: Record<number, { id: number; name: string; description: string; kelas: string }[]> = {
	// PAUD
	1: [
		{ id: 1, name: "Fase Fondasi", description: "Fase Fondasi", kelas: "Usia 5-6 tahun" },
	],
	// SD
	2: [
		{ id: 2, name: "Fase A", description: "Fase A", kelas: "Kelas 1-2" },
		{ id: 3, name: "Fase B", description: "Fase B", kelas: "Kelas 3-4" },
		{ id: 4, name: "Fase C", description: "Fase C", kelas: "Kelas 5-6" },
	],
	// SMP
	3: [
		{ id: 5, name: "Fase D", description: "Fase D", kelas: "Kelas 7-9" },
	],
	// SMA
	4: [
		{ id: 6, name: "Fase E", description: "Fase E", kelas: "Kelas 10" },
		{ id: 7, name: "Fase F", description: "Fase F", kelas: "Kelas 11-12" },
	],
	// SMK
	5: [
		{ id: 8, name: "Fase E", description: "Fase E", kelas: "Kelas 10" },
		{ id: 9, name: "Fase F", description: "Fase F", kelas: "Kelas 11-12" },
	],
};

// Mata Pelajaran berdasarkan Jenjang
const MATA_PELAJARAN_DATA: Record<number, { id: string; name: string }[]> = {
	// PAUD
	1: [
		{ id: "paud-1", name: "Nilai Agama dan Budi Pekerti" },
		{ id: "paud-2", name: "Jati Diri" },
		{ id: "paud-3", name: "Dasar Literasi dan STEAM" },
	],
	// SD
	2: [
		{ id: "sd-1", name: "Pendidikan Agama Islam" },
		{ id: "sd-2", name: "Pendidikan Pancasila" },
		{ id: "sd-3", name: "Bahasa Indonesia" },
		{ id: "sd-4", name: "Matematika" },
		{ id: "sd-5", name: "IPAS (Ilmu Pengetahuan Alam dan Sosial)" },
		{ id: "sd-6", name: "Seni Budaya" },
		{ id: "sd-7", name: "Pendidikan Jasmani" },
		{ id: "sd-8", name: "Bahasa Inggris" },
		{ id: "sd-9", name: "Muatan Lokal" },
	],
	// SMP
	3: [
		{ id: "smp-1", name: "Pendidikan Agama Islam" },
		{ id: "smp-2", name: "Pendidikan Pancasila" },
		{ id: "smp-3", name: "Bahasa Indonesia" },
		{ id: "smp-4", name: "Matematika" },
		{ id: "smp-5", name: "IPA (Ilmu Pengetahuan Alam)" },
		{ id: "smp-6", name: "IPS (Ilmu Pengetahuan Sosial)" },
		{ id: "smp-7", name: "Bahasa Inggris" },
		{ id: "smp-8", name: "Seni Budaya" },
		{ id: "smp-9", name: "Pendidikan Jasmani" },
		{ id: "smp-10", name: "Informatika" },
		{ id: "smp-11", name: "Muatan Lokal" },
	],
	// SMA
	4: [
		{ id: "sma-1", name: "Pendidikan Agama Islam" },
		{ id: "sma-2", name: "Pendidikan Pancasila" },
		{ id: "sma-3", name: "Bahasa Indonesia" },
		{ id: "sma-4", name: "Matematika" },
		{ id: "sma-5", name: "Bahasa Inggris" },
		{ id: "sma-6", name: "Fisika" },
		{ id: "sma-7", name: "Kimia" },
		{ id: "sma-8", name: "Biologi" },
		{ id: "sma-9", name: "Sosiologi" },
		{ id: "sma-10", name: "Ekonomi" },
		{ id: "sma-11", name: "Geografi" },
		{ id: "sma-12", name: "Sejarah" },
		{ id: "sma-13", name: "Seni Budaya" },
		{ id: "sma-14", name: "Pendidikan Jasmani" },
		{ id: "sma-15", name: "Informatika" },
	],
	// SMK
	5: [
		{ id: "smk-1", name: "Pendidikan Agama Islam" },
		{ id: "smk-2", name: "Pendidikan Pancasila" },
		{ id: "smk-3", name: "Bahasa Indonesia" },
		{ id: "smk-4", name: "Matematika" },
		{ id: "smk-5", name: "Bahasa Inggris" },
		{ id: "smk-6", name: "Informatika" },
		{ id: "smk-7", name: "Projek IPAS" },
		{ id: "smk-8", name: "Seni Budaya" },
		{ id: "smk-9", name: "Pendidikan Jasmani" },
		{ id: "smk-10", name: "Dasar Program Keahlian" },
		{ id: "smk-11", name: "Konsentrasi Keahlian" },
	],
};

// Dummy Modul Data untuk hasil pencarian
const DUMMY_MODULES = [
	{
		id: "modul-1",
		topic: "Implementasi Fikih Mu'amalah",
		type: "Materi ajar & RPP",
		jenjangId: 4, // SMA
		grade: { id: 4, description: "Kelas 10" },
		subject: "Pendidikan Agama Islam",
		subjectId: "sma-1",
		fase: "Fase E",
		faseId: 6,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-12-10",
		downloads: 89,
		likes_count: 120,
		user_id: 1,
		user: { id: 1, name: "Ahmad Fauzi", avatar: null }
	},
	{
		id: "modul-2",
		topic: "Akhlak Terpuji dalam Kehidupan Sehari-hari",
		type: "Materi ajar & RPP",
		jenjangId: 4, // SMA
		grade: { id: 4, description: "Kelas 10" },
		subject: "Pendidikan Agama Islam",
		subjectId: "sma-1",
		fase: "Fase E",
		faseId: 6,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-12-08",
		downloads: 75,
		likes_count: 98,
		user_id: 2,
		user: { id: 2, name: "Siti Aisyah", avatar: null }
	},
	{
		id: "modul-3",
		topic: "Sejarah Peradaban Islam",
		type: "Materi ajar & RPP",
		jenjangId: 4, // SMA
		grade: { id: 4, description: "Kelas 11-12" },
		subject: "Pendidikan Agama Islam",
		subjectId: "sma-1",
		fase: "Fase F",
		faseId: 7,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-12-05",
		downloads: 62,
		likes_count: 85,
		user_id: 3,
		user: { id: 3, name: "Muhammad Rizki", avatar: null }
	},
	{
		id: "modul-4",
		topic: "Aqidah Islam: Rukun Iman",
		type: "Materi ajar & RPP",
		jenjangId: 4, // SMA
		grade: { id: 4, description: "Kelas 10" },
		subject: "Pendidikan Agama Islam",
		subjectId: "sma-1",
		fase: "Fase E",
		faseId: 6,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-12-01",
		downloads: 95,
		likes_count: 110,
		user_id: 4,
		user: { id: 4, name: "Fatimah Zahra", avatar: null }
	},
	{
		id: "modul-5",
		topic: "Bilangan Bulat dan Operasinya",
		type: "Materi ajar & RPP",
		jenjangId: 2, // SD
		grade: { id: 2, description: "Kelas 1-2" },
		subject: "Matematika",
		subjectId: "sd-4",
		fase: "Fase A",
		faseId: 2,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-28",
		downloads: 150,
		likes_count: 200,
		user_id: 5,
		user: { id: 5, name: "Budi Santoso", avatar: null }
	},
	{
		id: "modul-6",
		topic: "Teks Narasi dan Deskripsi",
		type: "Materi ajar & RPP",
		jenjangId: 3, // SMP
		grade: { id: 3, description: "Kelas 7-9" },
		subject: "Bahasa Indonesia",
		subjectId: "smp-3",
		fase: "Fase D",
		faseId: 5,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-25",
		downloads: 88,
		likes_count: 132,
		user_id: 6,
		user: { id: 6, name: "Dewi Lestari", avatar: null }
	},
	{
		id: "modul-7",
		topic: "Ekosistem dan Komponen Penyusunnya",
		type: "Materi ajar & RPP",
		jenjangId: 2, // SD
		grade: { id: 2, description: "Kelas 5-6" },
		subject: "IPAS (Ilmu Pengetahuan Alam dan Sosial)",
		subjectId: "sd-5",
		fase: "Fase C",
		faseId: 4,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-20",
		downloads: 112,
		likes_count: 145,
		user_id: 7,
		user: { id: 7, name: "Agus Prasetyo", avatar: null }
	},
	{
		id: "modul-8",
		topic: "Pancasila sebagai Dasar Negara",
		type: "Materi ajar & RPP",
		jenjangId: 3, // SMP
		grade: { id: 3, description: "Kelas 7-9" },
		subject: "Pendidikan Pancasila",
		subjectId: "smp-2",
		fase: "Fase D",
		faseId: 5,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-15",
		downloads: 78,
		likes_count: 92,
		user_id: 8,
		user: { id: 8, name: "Rina Wati", avatar: null }
	},
	{
		id: "modul-9",
		topic: "Pengenalan Huruf dan Angka",
		type: "Materi ajar & RPP",
		jenjangId: 2, // SD
		grade: { id: 2, description: "Kelas 3-4" },
		subject: "Bahasa Indonesia",
		subjectId: "sd-3",
		fase: "Fase B",
		faseId: 3,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-10",
		downloads: 200,
		likes_count: 180,
		user_id: 9,
		user: { id: 9, name: "Ani Wijaya", avatar: null }
	},
	{
		id: "modul-10",
		topic: "Nilai Agama dan Budi Pekerti Anak Usia Dini",
		type: "Materi ajar & RPP",
		jenjangId: 1, // PAUD
		grade: { id: 1, description: "Usia 5-6 tahun" },
		subject: "Nilai Agama dan Budi Pekerti",
		subjectId: "paud-1",
		fase: "Fase Fondasi",
		faseId: 1,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-05",
		downloads: 95,
		likes_count: 88,
		user_id: 10,
		user: { id: 10, name: "Sri Mulyani", avatar: null }
	},
	{
		id: "modul-11",
		topic: "Dasar-Dasar Pemrograman dan Algoritma",
		type: "Materi ajar & RPP",
		jenjangId: 5, // SMK
		grade: { id: 5, description: "Kelas 10" },
		subject: "Informatika",
		subjectId: "smk-6",
		fase: "Fase E",
		faseId: 8,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-11-03",
		downloads: 180,
		likes_count: 165,
		user_id: 11,
		user: { id: 11, name: "Hendra Kurniawan", avatar: null }
	},
	{
		id: "modul-12",
		topic: "Teknik Mesin: Pengelasan Dasar",
		type: "Materi ajar & RPP",
		jenjangId: 5, // SMK
		grade: { id: 5, description: "Kelas 11-12" },
		subject: "Dasar Program Keahlian",
		subjectId: "smk-10",
		fase: "Fase F",
		faseId: 9,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-10-28",
		downloads: 145,
		likes_count: 130,
		user_id: 12,
		user: { id: 12, name: "Teguh Prasetya", avatar: null }
	},
	{
		id: "modul-13",
		topic: "Business English for Vocational Students",
		type: "Materi ajar & RPP",
		jenjangId: 5, // SMK
		grade: { id: 5, description: "Kelas 10" },
		subject: "Bahasa Inggris",
		subjectId: "smk-5",
		fase: "Fase E",
		faseId: 8,
		image: "/img/thumbnailmodul.png",
		created_at: "2025-10-20",
		downloads: 210,
		likes_count: 190,
		user_id: 13,
		user: { id: 13, name: "Dina Amelia", avatar: null }
	},
];

// ============ END DUMMY DATA ============

interface JenjangOption {
	id: number;
	description: string;
	name: string;
}

interface FaseOption {
	id: number;
	name: string;
	description: string;
	kelas: string;
}

interface MataPelajaranOption {
	id: string;
	name: string;
}

interface CardData {
	id: string;
	type: string;
	grade?: { id: number; description: string };
	topic: string;
	created_at: string;
	image: string;
	user_id?: number;
	downloads?: number;
	likes_count?: number;
}

const ModulAjarPage: React.FC = () => {
	const router = useRouter();
	const { auth: user } = useAuth();
	const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
	const [cards, setCards] = useState<CardData[]>([]);
	const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Filter states with dummy data
	const [jenjangOptions] = useState<JenjangOption[]>(JENJANG_DATA);
	const [faseOptions, setFaseOptions] = useState<FaseOption[]>([]);
	const [mataPelajaranOptions, setMataPelajaranOptions] = useState<MataPelajaranOption[]>([]);
	const [selectedJenjang, setSelectedJenjang] = useState<string>("");
	const [selectedFase, setSelectedFase] = useState<string>("");
	const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<string>("");

	const observerRef = useRef<HTMLDivElement | null>(null);

	// Update fase options when jenjang changes - using dummy data
	useEffect(() => {
		if (selectedJenjang) {
			const jenjangId = parseInt(selectedJenjang);
			setFaseOptions(FASE_DATA[jenjangId] || []);
			setMataPelajaranOptions(MATA_PELAJARAN_DATA[jenjangId] || []);
		} else {
			setFaseOptions([]);
			setMataPelajaranOptions([]);
		}
		setSelectedFase("");
		setSelectedMataPelajaran("");
	}, [selectedJenjang]);


	const fetchCards = async (currentPage: number, append: boolean) => {
		try {
			setIsLoading(true);
			// Filter only "Materi ajar & RPP" type
			const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/bahanajar`;
			
			let endpoint = activeTab === "all"
				? `${baseUrl}?type=Materi ajar %26 RPP&limit=10&page=${currentPage}`
				: `${baseUrl}saya?user_id=${user.id}&type=Materi ajar %26 RPP&limit=10&page=${currentPage}`;

			// Add search query if exists
			if (searchQuery) {
				endpoint += `&search=${encodeURIComponent(searchQuery)}`;
			}

			const response = await axios.get(endpoint);

			if (response.data.data.length > 0) {
				const uniqueCards = append
					? [
							...new Map(
								[...cards, ...response.data.data].map((item) => [
									item.id,
									item,
								]),
							).values(),
					  ]
					: response.data.data;
				setCards(uniqueCards);
				setFilteredCards(uniqueCards);
				setPage(currentPage + 1);
			} else {
				// Use dummy data as fallback when API returns empty
				if (!append && currentPage === 1) {
					setCards(DUMMY_MODULES as any);
					setFilteredCards(DUMMY_MODULES as any);
				}
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error fetching cards:", error);
			// Use dummy data as fallback when API fails
			if (currentPage === 1) {
				setCards(DUMMY_MODULES as any);
				setFilteredCards(DUMMY_MODULES as any);
			}
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		setCards([]);
		setPage(1);
		setHasMore(true);
		fetchCards(1, false);
	}, [activeTab]);

	// Infinite scroll observer
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

	// Filter cards locally based on selected filters
	useEffect(() => {
		let filtered = cards;
		
		// Filter by Jenjang
		if (selectedJenjang) {
			const jenjangId = parseInt(selectedJenjang);
			filtered = filtered.filter((card: any) => card.jenjangId === jenjangId);
		}
		
		// Filter by Fase
		if (selectedFase) {
			const faseId = parseInt(selectedFase);
			filtered = filtered.filter((card: any) => card.faseId === faseId);
		}
		
		// Filter by Mata Pelajaran
		if (selectedMataPelajaran) {
			filtered = filtered.filter((card: any) => card.subjectId === selectedMataPelajaran);
		}
		
		setFilteredCards(filtered);
	}, [selectedJenjang, selectedFase, selectedMataPelajaran, cards]);

	const handleSearch = () => {
		setCards([]);
		setPage(1);
		setHasMore(true);
		fetchCards(1, false);
	};

	return (
		<div className="pt-[5.21rem] bg-white min-h-screen">
			<TopBar 
				withBackButton 
				tambahButton="/perangkat-ajar/tambah"
			>
				Materi Ajar
			</TopBar>

			{/* Hero Banner */}
			<div className="mx-4 mt-4 bg-[#006557] rounded-2xl p-4 flex items-center gap-4">
				<div className="bg-[#00806B] rounded-xl p-3">
					<svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
					</svg>
				</div>
				<div>
					<h2 className="text-white font-bold text-lg">Belajar, Berkembang, dan Menginspirasi</h2>
					<p className="text-white/80 text-sm">Dirancang oleh guru, untuk guru.</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex space-x-2 px-4 mt-4">
				<button
					className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						activeTab === "all"
							? "bg-[#006557] text-white"
							: "bg-gray-100 text-gray-600"
					}`}
					onClick={() => {
						setActiveTab("all");
					}}>
					Semua Modul
				</button>
				<button
					className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						activeTab === "mine"
							? "bg-[#006557] text-white"
							: "bg-gray-100 text-gray-600"
					}`}
					onClick={() => {
						setActiveTab("mine");
					}}>
					Modul Saya
				</button>
			</div>

			{/* Filter Section */}
			<div className="p-4">
				<h3 className="font-semibold text-gray-800 mb-2">Mau cari materi apa?</h3>
				<p className="text-sm text-gray-500 mb-4">Cari materi berdasarkan filter pencarian</p>

				<div className="flex gap-2 mb-3">
					<select
						className="flex-1 p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
						value={selectedJenjang}
						onChange={(e) => setSelectedJenjang(e.target.value)}>
						<option value="">Pilih Jenjang</option>
						{jenjangOptions.map((option) => (
							<option key={option.id} value={option.id}>
								{option.description}
							</option>
						))}
					</select>

					<select
						className="flex-1 p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
						value={selectedFase}
						onChange={(e) => setSelectedFase(e.target.value)}
						disabled={!selectedJenjang}>
						<option value="">Pilih Fase</option>
						{faseOptions.map((option) => (
							<option key={option.id} value={option.id}>
								{option.name} ({option.kelas})
							</option>
						))}
					</select>
				</div>

				<select
					className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
					value={selectedMataPelajaran}
					onChange={(e) => setSelectedMataPelajaran(e.target.value)}
					disabled={!selectedJenjang}>
					<option value="">Pilih Mata Pelajaran</option>
					{mataPelajaranOptions.map((option) => (
						<option key={option.id} value={option.id}>
							{option.name}
						</option>
					))}
				</select>

				{/* Search Button */}
				<button
					onClick={handleSearch}
					className="w-full mt-4 py-3 bg-white border border-gray-300 rounded-full text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					Cari materi ajar
				</button>
			</div>

			{/* Card List */}
			<div className="px-4 pb-6">
				{activeTab === "mine" && !isLoading && cards.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500 mb-4">Anda belum memiliki modul ajar.</p>
						<button
							className="px-6 py-2 bg-[#006557] text-white rounded-lg font-medium"
							onClick={() => router.push("/perangkat-ajar/tambah")}>
							Buat Modul Ajar
						</button>
					</div>
				)}

				{/* Search Results Info */}
				{filteredCards.length > 0 && (
					<div className="flex justify-between items-center mb-4">
						<p className="text-gray-700">Menampilkan hasil pencarian</p>
						<p className="text-[#006557] font-medium">{filteredCards.length} hasil</p>
					</div>
				)}

				{/* Card List - Horizontal Layout */}
				<div className="space-y-3">
					{isLoading && cards.length === 0 ? (
						<p className="text-center py-8">Loading...</p>
					) : filteredCards.length === 0 && !isLoading ? (
						<p className="text-center text-gray-500 py-8">Tidak ada modul ajar ditemukan</p>
					) : (
						filteredCards.map((item: any) => (
							<div
								onClick={() => router.push(`/modul-ajar/${item.id}`)}
								key={item.id}
								className="flex gap-3 p-3 border rounded-xl bg-white hover:shadow-md transition-shadow cursor-pointer">
								{/* Image */}
								<div className="flex-shrink-0">
									<img
										src={item.image?.startsWith('/') ? item.image : `${process.env.NEXT_PUBLIC_MITRA_URL}/public/${item.image}`}
										alt={item.topic}
										className="w-16 h-16 rounded-lg object-cover bg-gray-100"
										onError={(e) => {
											(e.target as HTMLImageElement).src = '/img/modul-placeholder.png';
										}}
									/>
								</div>
								
								{/* Content */}
								<div className="flex-1 min-w-0">
									{/* Kelas Badge */}
									<span className="text-xs text-[#006557] font-medium">
										• {item.grade?.description || "Kelas"}
									</span>
									
									{/* Title */}
									<h3 className="font-semibold text-gray-800 mt-1 line-clamp-1">
										{item.topic}
									</h3>
									
									{/* Date */}
									<p className="text-xs text-gray-500 mt-1">
										Diunggah pada: {moment(item.created_at).format("MMM DD YYYY")}
									</p>
								</div>

								{/* Stats */}
								<div className="flex flex-col items-end justify-center gap-1 text-xs text-gray-500">
									<div className="flex items-center gap-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
										</svg>
										<span>{item.likes_count || 0}</span>
									</div>
									<div className="flex items-center gap-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										<span>{item.downloads || 0}</span>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Infinite Scroll Trigger */}
				{hasMore && !isLoading && filteredCards.length > 0 && (
					<div ref={observerRef} className="h-10" />
				)}

				{isLoading && filteredCards.length > 0 && (
					<div className="text-center py-4">
						<p>Loading more...</p>
					</div>
				)}
			</div>


		</div>
	);
};

export default ModulAjarPage;
