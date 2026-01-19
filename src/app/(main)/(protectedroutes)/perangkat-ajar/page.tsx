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

			const response = await axios.get(
				`${endpoint}?limit=10&page=${currentPage}`,
				{ headers }
			);

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
	}, [activeTab]);

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
		const filtered = cards.filter(
			(card) =>
				card.topic.toLowerCase().includes(lowerCaseQuery) &&
				(filterType === "all" || card.type === filterType) &&
				(!selectedJenjang || card.grade?.id === selectedJenjang),
		);
		setFilteredCards(filtered);
	}, [searchQuery, filterType, cards, selectedJenjang]);

	return (
		<div className="pt-[5.21rem] p-6 bg-white min-h-screen">
			<TopBar withBackButton>Perangkat Ajar</TopBar>

			{/* Tabs */}
			<div className="flex space-x-4 mb-6">
				<button
					className={`px-4 py-2 rounded border font-semibold ${
						activeTab === "all" ? "bg-green-500 text-white" : "bg-gray-100"
					}`}
					onClick={() => {
						setActiveTab("all");
						setCards([]);
						setPage(1);
						setHasMore(true);
					}}>
					Semua Perangkat
				</button>
				<button
					className={`px-4 py-2 rounded border font-semibold ${
						activeTab === "mine" ? "bg-green-500 text-white" : "bg-gray-100"
					}`}
					onClick={() => {
						setActiveTab("mine");
						setCards([]);
						setPage(1);
						setHasMore(true);
					}}>
					Perangkat Saya
				</button>
			</div>

			{/* Search and Filter */}
			{activeTab === "all" && (
				<div className="mb-6">
					<input
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Cari perangkat ajar"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select
						className="w-full p-2 border rounded mt-4"
						value={selectedJenjang}
						onChange={(e) => setFilterType(e.target.value)}>
						<option value="all">Semua Tipe</option>
						<option value="Materi ajar & RPP">Materi ajar/RPP</option>
						<option value="Bahan ajar">Bahan Tayang</option>
						<option value="Buku">Materi Ajar</option>
						<option value="LKPD">LKPD</option>
					</select>
					<select
						className="w-full p-2 border rounded mt-4"
						value={selectedJenjang}
						onChange={(e) =>
							setSelectedJenjang(
								e.target.value === "all" ? "all" : parseInt(e.target.value),
							)
						}>
						<option value="all">Semua Jenjang</option>
						{jenjangOptions.map((option) => (
							<option
								key={option.id}
								value={option.id}>
								{option.description}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Add Perangkat Button for "mine" tab */}
			{activeTab === "mine" && (
				<div className="mb-6">
					<button
						className="px-4 py-2 bg-green-500 text-white rounded w-full"
						onClick={() => router.push("/perangkat-ajar/tambah")}>
						Tambah Perangkat Ajar
					</button>
					{!isLoading && cards.length === 0 && (
						<p className="text-center text-gray-500 mt-4">
							Anda belum memiliki perangkat ajar.
						</p>
					)}
				</div>
			)}

			{/* Card List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
				{isLoading ? (
					<p>Loading...</p> // Menampilkan teks loading jika sedang memuat
				) : filteredCards.length === 0 ? (
					<p className="text-center text-gray-500 mt-4">Tidak ada data</p> // Teks "Tidak ada data" jika data kosong
				) : (
					filteredCards.map((item) => (
						<div
							onClick={() => router.push(`/perangkat-ajar/${item.id}`)}
							key={item.id}
							className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg">
							<img
								src={`${process.env.NEXT_PUBLIC_MITRA_URL}/public/${item.image}`}
								alt={item.topic}
								className="w-full h-40 object-cover"
							/>
							<div className="p-4">
								<span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
									{cekDanUbahType(item.type)}
								</span>
								<h2 className="font-bold text-lg mt-2">{item.topic}</h2>
								<p className="text-sm text-gray-500">
									{item.grade?.description || "Kelas 10"}
								</p>
								<p className="text-sm text-gray-400 mt-1">
									Diunggah pada {moment(item.created_at).format("DD MMMM")}
								</p>
							</div>
						</div>
					))
				)}
			</div>

			{/* Infinite Scroll Trigger */}
			{hasMore && !isLoading && (
				<div
					ref={observerRef}
					className="h-10"
				/>
			)}

			{isLoading && filteredCards.length > 0 && (
				<div className="text-center py-4">
					<p>Loading more data...</p>
				</div>
			)}
		</div>
	);
};

export default PerangkatAjarPage;
