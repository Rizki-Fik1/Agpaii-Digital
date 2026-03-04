"use client";

import React, { useEffect, useState, useRef } from "react";
import type { NextPage } from "next";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useParams, useRouter } from "next/navigation";

interface User {
	name: string;
}

interface City {
	name: string;
}

interface Product {
	id: string | number;
	nama: string;
	harga: number;
	created_at: string;
	deskripsi: string;
	no_wa?: string;
	foto?: string;
	foto_2?: string;
	foto_3?: string;
	user?: User;
	city?: City;
}

const ProductDetailPage: NextPage = () => {
	const { id } = useParams(); // Getting product ID from URL params
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

	const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

	// Format price to Rupiah (without decimals)
	const formatRupiah = (price: number) => {
		const number = Number(price);
		if (isNaN(number)) return "";
		const integer = Math.floor(number);
		const formatted = integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		return `Rp${formatted}`;
	};

	// Format date to "18 Maret 2025"
	const formatDate = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const months = [
			"Januari",
			"Februari",
			"Maret",
			"April",
			"Mei",
			"Juni",
			"Juli",
			"Agustus",
			"September",
			"Oktober",
			"November",
			"Desember",
		];
		return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
	};

	// Fetch product data from API
	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				setLoading(true);
				const response = await API.get<Product>(`/product/${id}`);
				setProduct(response.data);
			} catch (error) {
				console.error("Error fetching product detail:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	// Build photos array from product's images
	const photos: string[] = [];
	if (product?.foto) photos.push(`${STORAGE_URL}/${product.foto}`);
	if (product?.foto_2) photos.push(`${STORAGE_URL}/${product.foto_2}`);
	if (product?.foto_3) photos.push(`${STORAGE_URL}/${product.foto_3}`);

	// Auto-change image every 3 seconds
	useEffect(() => {
		if (photos.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
		}, 3000);

		return () => clearInterval(interval);
	}, [photos.length]);

	// Function to open WhatsApp with predefined message
	const handleBuyNow = () => {
		if (!product) return;
		let waNumber = product.no_wa;
		if (!waNumber) {
			alert("Nomor WhatsApp tidak tersedia.");
			return;
		}
		const message = `Assalamualaikum ${
			product.user?.name || "Penjual"
		}, saya tertarik dengan produk ${product.nama} di aplikasi agpaii`;
		// Change WA number: if it starts with 0, change to 62
		if (waNumber.startsWith("0")) {
			waNumber = "62" + waNumber.substring(1);
		}
		const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
		window.open(url, "_blank");
	};

	if (loading) {
      return (
          <div className="pt-[4.2rem] bg-gray-50 min-h-screen">
              <TopBar withBackButton>Marketplace</TopBar>
              <div className="container mx-auto pb-24 animate-pulse">
                  <div className="bg-gray-200 h-80 w-full mb-4"></div>
                  <div className="px-5 py-4 space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded w-full"></div>
                  </div>
              </div>
          </div>
      );
    }

	if (!product) {
		return (
			<div className="pt-[4.2rem] flex justify-center items-center h-screen bg-gray-50">
				<TopBar withBackButton>Marketplace</TopBar>
				<div>Produk tidak ditemukan</div>
			</div>
		);
	}

	console.log(product.deskripsi);

	return (
		<div className="pt-[4.2rem] bg-gray-50 min-h-screen">
			<TopBar withBackButton>Marketplace</TopBar>
			<div className="container mx-auto pb-24">
				{/* Single Image Display (no scroll) */}
				<div className="relative bg-gray-200 h-80 overflow-hidden">
					{photos.length > 0 && (
						<img
							src={photos[currentImageIndex]}
							alt={`Product photo ${currentImageIndex + 1}`}
							className="w-full h-full object-cover"
						/>
					)}
				</div>

				{/* Carousel Indicators */}
				<div className="flex justify-center gap-2 py-4 bg-white">
					{photos.map((_, index) => (
						<div
							key={index}
							className={`h-2 rounded-full transition-all ${
								index === currentImageIndex
									? "w-8 bg-[#009788]"
									: "w-2 bg-gray-300"
							}`}
						/>
					))}
				</div>

				{/* Product Information */}
				<div className="bg-white px-5 py-4">
					{/* Title and Price */}
					<div className="flex justify-between items-start mb-3">
						<h1 className="text-xl font-bold text-gray-900 flex-1">
							{product.nama}
						</h1>
						<p className="text-xl font-bold text-[#07806F] ml-4">
							{formatRupiah(product.harga)}
						</p>
					</div>

					{/* Seller Name */}
					<p className="text-base text-gray-700 mb-1">
						oleh {product.user?.name || "Nama Penjual Tidak Tersedia"}
					</p>

					{/* Date Posted */}
					<p className="text-sm text-gray-400 mb-3">
						Di posting {formatDate(product.created_at)}
					</p>

					{/* Shipping Location */}
					<div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg mb-4 inline-flex">
						<img 
							src="/svg/delivery.svg" 
							alt="Tasbih" 
							className="w-6 h-4 object-contain"
						/>
						<span className="text-sm text-[#07806F] font-medium">
							<span className="text-[#8F8F8F]">Dikirim dari:</span> {product.city?.name?.toUpperCase() || "KOTA TIDAK TERSEDIA"}
						</span>
					</div>

					{/* Description Section */}
					<h2 className="text-lg font-bold text-gray-900 mb-2">
						Deskripsi Produk
					</h2>
					<p
						className="text-gray-600 text-sm leading-relaxed"
						style={{ whiteSpace: "pre-line" }}>
						{product.deskripsi}
					</p>
				</div>
			</div>

			{/* Buy Now Button - Fixed at bottom */}
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-[480px] mx-auto">
				<button
					onClick={handleBuyNow}
					className="w-full py-4 bg-[#07806F] hover:bg-[#076E5F] text-white font-bold rounded-full flex items-center justify-center gap-2 transition-colors">
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
						/>
					</svg>
					Beli Sekarang
				</button>
			</div>
		</div>
	);
};

export default ProductDetailPage;
