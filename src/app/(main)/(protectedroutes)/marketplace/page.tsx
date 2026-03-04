"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { NextPage } from "next";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getImage } from "@/utils/function/function";

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
    const [searchText, setSearchText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

  /* ---------------- QUERY DATA ---------------- */
  const { data: products = [] } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const res = await API.get<Product[]>("/product");
      return res.status === 200 ? res.data : [];
    },
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["marketplace-banners"],
    queryFn: async () => {
      const res = await API.get<Banner[]>("/get-marketplace-banners");
      return res.status === 200 ? res.data : [];
    },
  });

  /* ---------------- SEARCH & FILTER ---------------- */
  const filteredData = useMemo(() => {
    let result = products;
    if (searchText.trim() !== "") {
      result = products.filter((item) =>
        item.nama?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // Adjust logic
    if (result.length % 2 !== 0) {
      return [...result, { id: "dummy" }];
    }
    return result;
  }, [products, searchText]);

  // Fungsi pencarian produk berdasarkan nama
  const handleSearch = (text: string) => {
    setSearchText(text);
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



	return (
		<>
			{/* =========== MOBILE VIEW - TAMPILAN LAMA =========== */}
			<div className="pt-[4.2rem] md:hidden">
				<TopBar
					withBackButton
					kelolaButton="/marketplace/produk-saya">
					Marketplace
				</TopBar>
				<div className="container mx-auto p-4 flex flex-col gap-4">
					{/* Search Bar */}
					<div className="relative">
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
					<div className="relative mb-2">
						<div
							className="relative overflow-hidden rounded-2xl bg-gray-200 h-[180px]">
							{banners.length > 0 && (
								<Image
									src={getImage(banners[currentIndex].foto)}
									alt="Banner"
									fill
									className="object-cover rounded-2xl"
								/>
							)}
						</div>
						
						{/* Indicator Dots */}
						{banners.length > 0 && (
							<div className="flex justify-center gap-2 mt-3 mb-2">
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
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Daftar Produk{" "}
							<span className="text-gray-400 font-normal text-base block mt-1">
								Menampilkan {filteredData.filter((item) => item.id !== "dummy").length} item
							</span>
						</h2>
					</div>

					{/* Grid Produk */}
					<div className="grid grid-cols-2 gap-3 mb-8">
						{filteredData.map((item) => {
							if (item.id === "dummy") {
								return <div key="dummy" className="hidden"></div>;
							}
							return (
								<Link
									key={item.id}
									href={`/marketplace/${item.id}`}>
									<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
										<div className="relative w-full h-36">
											<Image
												src={getImage(item.foto!)}
												alt={item.nama || "Product"}
												fill
												className="object-cover"
											/>
										</div>
										<div className="p-3 flex flex-col flex-1">
											<h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
												{item.nama}
											</h3>
											<p className="text-[10px] text-gray-500 line-clamp-1 mb-2">
												{item.user?.name || "Nama User Tidak Tersedia"}
											</p>
											<div className="mt-auto flex justify-between items-end">
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

			{/* =========== DESKTOP VIEW - TAMPILAN BARU PREMIUM =========== */}
			<div className="hidden md:block bg-gray-50 min-h-screen pb-28">
				<TopBar withBackButton href="/">
					Marketplace
				</TopBar>

				{/* Hero Banner Area (contains search and banner) */}
				<div className="bg-gradient-to-br from-[#006557] to-[#004D40] pt-[7rem] pb-[6rem] px-8 text-white relative">
					<div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
            <div className="max-w-2xl flex-1 z-10">
              <h1 className="text-4xl font-bold mb-4">Marketplace Digital</h1>
              <p className="opacity-80 text-lg mb-8 leading-relaxed">
                Temukan berbagai produk edukasi, buku, peralatan sekolah, dan perangkat ajar dari berbagai penjual di komunitas AGPAII.
              </p>
              
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Cari produk impianmu disini..."
                  className="w-full pl-14 pr-6 py-4 border-none rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/20 bg-white shadow-xl text-lg font-medium transition-all"
                />
              </div>
            </div>

            {/* Desktop Banner Carousel */}
            <div className="w-full lg:w-[500px] flex-shrink-0 relative z-10">
              <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 h-[280px] shadow-2xl">
                {banners.length > 0 ? (
                  <Image
                    src={getImage(banners[currentIndex].foto)}
                    alt="Banner"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50 border border-dashed border-white/30 m-4 rounded-xl">Banner Promosi</div>
                )}
              </div>
              
              {/* Indicator Dots Desktop */}
              {banners.length > 0 && (
                <div className="flex justify-center gap-3 mt-4 absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === currentIndex ? "w-10 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
					</div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
            <svg className="absolute -right-[10%] -top-[20%] w-[50%] h-[150%]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-67.8,67.6,-57.6,76.5,-45.3C85.4,-33,91.5,-18.6,90.9,-4.4C90.3,9.8,83.1,23.8,74.1,36C65.1,48.2,54.4,58.7,42.1,65.8C29.8,72.9,15.9,76.6,1.4,74.2C-13.1,71.8,-26.2,63.3,-38.7,55C-51.2,46.7,-63.1,38.6,-71.4,27.5C-79.7,16.4,-84.4,2.3,-82.3,-10.8C-80.2,-23.9,-71.3,-36.1,-60.7,-45.2C-50.1,-54.3,-37.8,-60.3,-25.7,-66.6C-13.6,-72.9,-1.7,-79.5,10.6,-81.7C22.9,-83.9,35.2,-81.7,42.7,-73.4Z" transform="translate(100 100)" />
            </svg>
          </div>
				</div>

				{/* Products Section */}
				<div className="max-w-[1400px] mx-auto px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-[#006557] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Jelajahi Produk</h2>
                <p className="text-sm text-gray-500">Menampilkan {filteredData.filter((item) => item.id !== "dummy").length} produk tersedia</p>
              </div>
            </div>
            
            <Link
              href="/marketplace/produk-saya"
              className="bg-[#006557] hover:bg-[#004D40] text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Kelola Produk Saya
            </Link>
          </div>

					{/* Grid Produk */}
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{filteredData.map((item) => {
							if (item.id === "dummy") {
								return null;
							}
							return (
								<Link
									key={`desk-prod-${item.id}`}
									href={`/marketplace/${item.id}`}>
									<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer h-[320px] flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
										<div className="relative w-full h-48 bg-gray-100 overflow-hidden">
											<Image
												src={getImage(item.foto!)}
												alt={item.nama || "Product"}
												fill
												className="object-cover group-hover:scale-105 transition-transform duration-500"
											/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>
										<div className="p-4 flex flex-col flex-1">
											<h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#006557] transition-colors">
												{item.nama}
											</h3>
											<p className="text-xs text-gray-500 line-clamp-1 mb-auto flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
												{item.user?.name || "User"}
											</p>
											<div className="mt-4 flex justify-between items-center border-t border-gray-50 pt-3">
												<p className="text-lg font-bold text-[#006557]">
													{formatRupiah(item.harga ?? 0)}
												</p>
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>

          {filteredData.filter((item) => item.id !== "dummy").length === 0 && (
            <div className="py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Produk Tidak Ditemukan</h3>
              <p className="text-gray-500">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}
				</div>
			</div>
		</>
	);
};

export default MarketplacePage;
