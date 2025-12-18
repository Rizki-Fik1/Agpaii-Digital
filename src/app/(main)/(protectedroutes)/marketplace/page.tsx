"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import Link from "next/link";

interface Product {
	id: string | number;
	nama?: string;
	foto?: string;
	harga?: number;
	deskripsi?: string;
	user?: {
		name: string;
	};
}

interface Banner {
	id: string | number;
	foto: string;
}

const MarketplacePage: NextPage = () => {
	const [data, setData] = useState<Product[]>([]);
	const [filteredData, setFilteredData] = useState<Product[]>([]);
	const [searchText, setSearchText] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [banners, setBanners] = useState<Banner[]>([]);
	const [currentIndex, setCurrentIndex] = useState<number>(0);

	const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

	// Fetch data produk dan banner dari API
	const loadData = async () => {
		try {
			setLoading(true);
			const productRes = await API.get<Product[]>("/product");
			const bannerRes = await API.get<Banner[]>("/get-marketplace-banners");
			setData(productRes.data);
			setBanners(bannerRes.data);
			adjustData(productRes.data);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	// Menyesuaikan data agar jumlah item produk selalu genap
	const adjustData = (products: Product[]) => {
		const adjustedData = [...products];
		if (adjustedData.length % 2 !== 0) {
			adjustedData.push({ id: "dummy" });
		}
		setFilteredData(adjustedData);
	};

	// Fungsi pencarian produk berdasarkan nama
	const handleSearch = (text: string) => {
		setSearchText(text);
		if (text.trim() === "") {
			adjustData(data);
		} else {
			const filtered = data.filter((item) =>
				item.nama?.toLowerCase().includes(text.toLowerCase()),
			);
			adjustData(filtered);
		}
	};

	// Format harga ke format rupiah
	const formatRupiah = (price: number) => {
		const number = Number(price);
		if (isNaN(number)) return "";
		return `Rp${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
	};

	// Autoplay banner setiap 3 detik
	useEffect(() => {
		const interval = setInterval(() => {
			if (banners.length > 0) {
				setCurrentIndex((prevIndex) =>
					prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
				);
			}
		}, 3000);
		return () => clearInterval(interval);
	}, [banners]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<div className="pt-[4.2rem]">
			<TopBar
				withBackButton
				dots="/marketplace/produk-saya">
				Martketplace
			</TopBar>
			<div className="container mx-auto p-4">
				{/* Banner Carousel */}
				<div
					className="relative overflow-hidden rounded-lg mb-4"
					style={{ height: "250px" }}>
					{banners.length > 0 && (
						<img
							src={`${STORAGE_URL}/${banners[currentIndex].foto}`}
							alt="Banner"
							className="w-full h-full object-contain rounded-lg"
						/>
					)}
				</div>

				{/* Search Bar */}
				<div className="flex mb-4">
					<input
						type="text"
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Cari produk"
						className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
					/>
					<button
						className="bg-green-600 text-white px-4 rounded-r-lg"
						onClick={() => {}}>
						Tampilkan
					</button>
				</div>

				{/* Grid Produk */}
				<div className="grid grid-cols-2 gap-4">
					{filteredData.map((item) => {
						if (item.id === "dummy") {
							return (
								<div
									key="dummy"
									className="invisible"></div>
							);
						}
						return (
							<Link
								key={item.id}
								href={`/marketplace/${item.id}`}>
								<div className="bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-lg">
									{item.foto && (
										<img
											src={`${STORAGE_URL}/${item.foto}`}
											alt={item.nama}
											className="w-full h-40 object-cover rounded-t-lg"
										/>
									)}
									<div className="p-2">
										<h3 className="text-sm font-bold text-gray-800 truncate">
											{item.nama}
										</h3>
										<p className="text-sm font-semibold text-orange-500 my-1">
											{formatRupiah(item.harga ?? 0)}
										</p>
										<p className="text-xs text-gray-500 line-clamp-2">
											{item.deskripsi}
										</p>
										<div className="mt-2">
											<p className="text-xs text-gray-600 truncate">
												{item.user?.name || "Nama User Tidak Tersedia"}
											</p>
										</div>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default MarketplacePage;
