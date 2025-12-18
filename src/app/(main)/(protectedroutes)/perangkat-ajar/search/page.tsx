"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import { cekDanUbahType } from "@/utils/function/function";

interface CardData {
	id: string;
	type: string;
	grade?: { description: string };
	topic: string;
	description: string;
	downloads: number;
	created_at: string;
	image: string;
}

const SearchModulPage: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jenjangId = searchParams.get("jenjangId");
	const mataPelajaran = searchParams.get("mataPelajaran");
	const searchQuery = searchParams.get("searchQuery");

	const [cards, setCards] = useState<CardData[]>([]);
	const [page, setPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchCards(page);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, jenjangId, mataPelajaran, searchQuery]);

	const fetchCards = async (page: number) => {
		try {
			setIsLoading(true);

			// Base URL
			const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/bahanajar`;

			// Build query parameters dynamically
			const params: Record<string, string> = {
				limit: "10",
				page: page.toString(),
				...(searchQuery ? { search: searchQuery } : {}),
			};

			// Construct URL with filtered parameters
			const queryString = new URLSearchParams(params).toString();
			const url = `${baseUrl}?${queryString}`;

			// Log the generated URL for debugging
			console.log(url);

			// Fetch data
			const response = await axios.get(url);
			setCards((prevCards) =>
				page === 1 ? response.data.data : [...prevCards, ...response.data.data],
			);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching cards:", error);
			setIsLoading(false);
		}
	};

	const handleLoadMore = () => {
		setPage((prevPage) => prevPage + 1);
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Hasil Pencarian</TopBar>
			<h1 className="text-xl font-bold mb-4">Hasil Pencarian</h1>

			<div className="grid grid-cols-1 gap-4 mb-6">
				{isLoading && page === 1 ? (
					<p>Loading...</p>
				) : cards.length > 0 ? (
					cards.map((item) => (
						<div
							onClick={() => router.push(`/perangkat-ajar/${item.id}`)}
							key={item.id}
							className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg">
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
									Diunggah pada{" "}
									{new Date(item.created_at).toLocaleDateString("id-ID", {
										day: "numeric",
										month: "long",
									})}
								</p>
								<p className="text-sm text-gray-600 mt-1">{item.description}</p>
								<div className="flex items-center justify-between mt-4">
									<div className="flex items-center text-sm text-gray-600">
										<span className="mr-2">Unduhan:</span>
										<span>{item.downloads || 0}</span>
									</div>
								</div>
							</div>
						</div>
					))
				) : (
					<p>Tidak ada hasil ditemukan.</p>
				)}
			</div>

			{cards.length > 0 && !isLoading && (
				<button
					onClick={handleLoadMore}
					className="bg-green-500 text-white px-4 py-2 rounded w-full">
					Load More
				</button>
			)}
		</div>
	);
};

export default SearchModulPage;
