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
				kelolaButton="/marketplace/produk-saya">
				Marketplace
			</TopBar>
			<div className="container mx-auto p-4">
				{/* Search Bar */}
				<div className="relative mb-4">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<svg
							className="w-5 h-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<input
						type="text"
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Cari Produk..."
						className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white shadow-sm"
					/>
				</div>

				{/* Banner Carousel */}
				<div className="relative mb-6">
					<div
						className="relative overflow-hidden rounded-2xl bg-gray-200"
						style={{ height: "200px" }}>
						{banners.length > 0 && (
							<img
								src={`${STORAGE_URL}/${banners[currentIndex].foto}`}
								alt="Banner"
								className="w-full h-full object-cover rounded-2xl"
							/>
						)}
					</div>
					
					{/* Indicator Dots */}
					{banners.length > 0 && (
						<div className="flex justify-center gap-2 mt-3">
							{banners.map((_, index) => (
								<div
									key={index}
									className={`h-2 rounded-full transition-all duration-300 ${
										index === currentIndex
											? "w-8 bg-[#009788]"
											: "w-2 bg-gray-300"
									}`}
								/>
							))}
						</div>
					)}
				</div>

				{/* Header Daftar Produk */}
				<div className="mb-4">
					<h2 className="text-xl font-bold text-gray-900">
						Daftar Produk{" "}
						<span className="text-gray-400 font-normal text-base">
							Menampilkan {filteredData.filter((item) => item.id !== "dummy").length}
						</span>
					</h2>
				</div>

				{/* Grid Produk */}
				<div className="grid grid-cols-2 gap-3">
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
								<div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
									{item.foto && (
										<img
											src={`${STORAGE_URL}/${item.foto}`}
											alt={item.nama}
											className="w-full h-40 object-cover"
										/>
									)}
									<div className="p-3">
										<h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
											{item.nama}
										</h3>
										<p className="text-xs text-gray-400 line-clamp-2 mb-1">
											{item.deskripsi}
										</p>
										<p className="text-xs text-gray-500 mb-2">
											{item.user?.name || "Nama User Tidak Tersedia"}
										</p>
										<div className="flex justify-end">
											<p className="text-sm font-bold text-[#009788]">
												{formatRupiah(item.harga ?? 0)}
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
