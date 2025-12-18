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
	const router = useRouter();
	const { id } = useParams(); // Getting product ID from URL params
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

	// For auto-scrolling carousel
	const carouselRef = useRef<HTMLDivElement>(null);

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

	// Auto-scroll carousel (looping)
	useEffect(() => {
		const container = carouselRef.current;
		if (!container || photos.length === 0) return;

		let index = 0;
		const scrollNext = () => {
			// Increase index and loop back when reaching the end
			index = (index + 1) % photos.length;
			const child = container.children[index] as HTMLElement;
			if (child) {
				container.scrollTo({
					left: child.offsetLeft,
					behavior: "smooth",
				});
			}
		};

		const interval = setInterval(scrollNext, 3000);
		return () => clearInterval(interval);
	}, [photos]);

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
			<div className="flex justify-center items-center h-screen">
				<div>Loading...</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div>Produk tidak ditemukan</div>
			</div>
		);
	}

	console.log(product.deskripsi);

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Martketplace</TopBar>
			<div className="container mx-auto pb-20">
				{/* Carousel Foto with auto-scroll and looping */}
				<div
					ref={carouselRef}
					className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
					{photos.map((uri, index) => (
						<img
							key={index}
							src={uri}
							alt={`Product photo ${index + 1}`}
							className="w-full h-80 object-cover snap-start"
						/>
					))}
				</div>

				{/* Product Information */}
				<div className="p-4">
					<h1 className="text-2xl font-bold text-gray-800">{product.nama}</h1>
					<p className="text-xl font-bold text-orange-500 mt-2">
						{formatRupiah(product.harga)}
					</p>
					<p className="text-sm text-gray-600 mt-1">
						{formatDate(product.created_at)}
					</p>
					<p className="text-lg text-gray-700 mt-2">
						{product.user?.name || "Nama Penjual Tidak Tersedia"}
					</p>
					<p className="text-md text-gray-700 mt-1">
						Dikirim dari: {product.city?.name || "Kota tidak tersedia"}
					</p>
					<h2 className="text-xl font-semibold text-gray-800 mt-4">
						Deskripsi Produk
					</h2>
					<p
						className="text-gray-600 mt-2 text-justify"
						style={{ whiteSpace: "pre-line" }}>
						{product.deskripsi}
					</p>
				</div>
			</div>

			{/* Buy Now Button */}
			<div className=" bottom-0 left-0 right-0 bg-green-600">
				<button
					onClick={handleBuyNow}
					className="w-full py-4 text-white font-bold">
					Beli Sekarang
				</button>
			</div>
		</div>
	);
};

export default ProductDetailPage;
