"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import moment from "moment";

interface CardData {
	id: string;
	type: string;
	grade?: { id: number; description: string };
	topic: string;
	description: string;
	downloads: number;
	created_at: string;
	image: string;
}

const SearchModulAjarPage: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jenjangId = searchParams.get("jenjangId");
	const faseId = searchParams.get("faseId");
	const mataPelajaran = searchParams.get("mataPelajaran");
	const searchQuery = searchParams.get("search");

	const [cards, setCards] = useState<CardData[]>([]);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		setCards([]);
		setPage(1);
		setHasMore(true);
		fetchCards(1);
	}, [jenjangId, faseId, mataPelajaran, searchQuery]);

	const fetchCards = async (currentPage: number) => {
		try {
			setIsLoading(true);

			const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/bahanajar`;

			const params: Record<string, string> = {
				limit: "10",
				page: currentPage.toString(),
				type: "Materi ajar & RPP",
			};

			if (searchQuery) params.search = searchQuery;
			if (jenjangId) params.grade_id = jenjangId;
			if (faseId) params.phase_id = faseId;
			if (mataPelajaran) params.subject_id = mataPelajaran;

			const queryString = new URLSearchParams(params).toString();
			const url = `${baseUrl}?${queryString}`;

			const response = await axios.get(url);
			
			if (response.data.data.length > 0) {
				setCards((prevCards) =>
					currentPage === 1 ? response.data.data : [...prevCards, ...response.data.data],
				);
				setPage(currentPage + 1);
			} else {
				setHasMore(false);
			}
			
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching cards:", error);
			setIsLoading(false);
			setHasMore(false);
		}
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading) {
			fetchCards(page);
		}
	};

	return (
		<div className="p-4 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Hasil Pencarian</TopBar>

			<div className="mb-4">
				<h1 className="text-lg font-bold text-gray-800">Hasil Pencarian</h1>
				<p className="text-sm text-gray-500">
					{searchQuery && `Kata kunci: "${searchQuery}"`}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3 mb-6">
				{isLoading && cards.length === 0 ? (
					<p className="col-span-2 text-center py-8">Loading...</p>
				) : cards.length > 0 ? (
					cards.map((item) => (
						<div
							onClick={() => router.push(`/modul-ajar/${item.id}`)}
							key={item.id}
							className="border rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
							<img
								src={`${process.env.NEXT_PUBLIC_MITRA_URL}/public/${item.image}`}
								alt={item.topic}
								className="w-full h-28 object-cover"
							/>
							<div className="p-3">
								<span className="text-xs bg-[#E8F5F3] text-[#006557] px-2 py-0.5 rounded-full">
									Modul Ajar
								</span>
								<h2 className="font-semibold text-sm mt-2 line-clamp-2">{item.topic}</h2>
								<p className="text-xs text-gray-500 mt-1">
									{item.grade?.description || ""}
								</p>
								<p className="text-xs text-gray-400 mt-1">
									{moment(item.created_at).format("DD MMMM YYYY")}
								</p>
								<div className="flex items-center text-xs text-gray-500 mt-2">
									<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
									</svg>
									{item.downloads || 0} unduhan
								</div>
							</div>
						</div>
					))
				) : (
					<div className="col-span-2 text-center py-8">
						<p className="text-gray-500">Tidak ada hasil ditemukan.</p>
						<button
							onClick={() => router.back()}
							className="mt-4 px-4 py-2 bg-[#006557] text-white rounded-lg">
							Kembali
						</button>
					</div>
				)}
			</div>

			{cards.length > 0 && hasMore && !isLoading && (
				<button
					onClick={handleLoadMore}
					className="w-full py-3 bg-[#006557] text-white rounded-xl font-medium">
					Muat Lebih Banyak
				</button>
			)}

			{isLoading && cards.length > 0 && (
				<p className="text-center py-4 text-gray-500">Loading more...</p>
			)}
		</div>
	);
};

export default SearchModulAjarPage;
