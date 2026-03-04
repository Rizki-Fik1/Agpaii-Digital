"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useInView } from "react-intersection-observer";
import {
	useInfiniteQuery,
	QueryFunction,
	InfiniteData,
	QueryFunctionContext,
} from "@tanstack/react-query";

import TopBar from "@/components/nav/topbar";
import {
	provinceMemberAPI,
	provinceExpiredMemberAPI,
	provincePensionMemberAPI,
	provincePNSMemberAPI,
	provinceNonPNSMemberAPI,
	provinceCertificateMemberAPI,
	provinceInpassingMemberAPI,
	provinceBSIMemberAPI,
	searchAllMemberAPI,
} from "@/utils/api/member";

// Tipe profil opsional
interface ProfileData {
	school_place?: string;
	// Tambahkan field lain jika ada
}

// Tipe data "provinsi" (atau user) yang kita tampilkan
interface ProvinceData {
	id: number;
	name: string;
	users_count?: number; // filter umum
	total_payment?: number; // kalau pakai filter iuran
	profile?: ProfileData; // jika hasil search menampilkan user profile
}

interface PageResponse {
	data: ProvinceData[];
	nextPage: number | undefined;
	total: number;
}

// Perbaiki tipe parameter pada arrow function dengan anotasi
const FILTER_MAP: Record<string, (page?: number) => Promise<any>> = {
	default: (page: number = 1) => provinceMemberAPI(page),
	expired: (page: number = 1) => provinceExpiredMemberAPI(page),
	pension: (page: number = 1) => provincePensionMemberAPI(page),
	pns: (page: number = 1) => provincePNSMemberAPI(page),
	non_pns: (page: number = 1) => provinceNonPNSMemberAPI(page),
	certificate: (page: number = 1) => provinceCertificateMemberAPI(page),
	inpassing: (page: number = 1) => provinceInpassingMemberAPI(page),
	bsi: (page: number = 1) => provinceBSIMemberAPI(page),
};

// Definisikan tipe QueryKey
type FilterKey = keyof typeof FILTER_MAP; // "default" | "expired" | ...
type TQueryKey = [string, FilterKey];

// Hapus parameter generic ketiga (TPageParam) dari QueryFunction
const fetchProvinces = async ({
	pageParam = 1,
	queryKey,
}: QueryFunctionContext<TQueryKey, number>): Promise<PageResponse> => {
	const filter = queryKey[1]; // "default", "expired", dll.
	const fn = FILTER_MAP[filter];
	const res = await fn(pageParam);

	if (res?.status === 200 && res?.data?.member) {
		return {
			data: res.data.member.data || [],
			nextPage: res.data.member.next_page_url
				? parseInt(res.data.member.next_page_url.split("=")[1], 10)
				: undefined,
			total: res.data.total || 0,
		};
	}

	return { data: [], nextPage: undefined, total: 0 };
};

export default function Members() {
	const [memberCount, setMemberCount] = useState(0);

	// Pencarian
	const [searchTerm, setSearchTerm] = useState("");
	const [searchData, setSearchData] = useState<ProvinceData[] | null>(null);

	// Filter
	const [filter, setFilter] = useState<FilterKey>("default");
	const [title, setTitle] = useState("Nasional");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const { ref, inView } = useInView();

	// Perhatikan tipe data infinite query sekarang menggunakan InfiniteData<PageResponse>
	const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage } =
		useInfiniteQuery<
			PageResponse,
			Error,
			InfiniteData<PageResponse>,
			TQueryKey,
			number
		>({
			queryKey: ["provinces", filter],
			queryFn: fetchProvinces,
			getNextPageParam: (lastPage) => lastPage.nextPage,
			initialPageParam: 1,
		});

	// Ambil total dari halaman pertama
	useEffect(() => {
		if (data?.pages?.length) {
			setMemberCount(data.pages[0].total);
		}
	}, [data]);

	// Infinite scroll
	useEffect(() => {
		if (inView && !isLoading && !isFetchingNextPage && !searchData) {
			fetchNextPage();
		}
	}, [inView, isLoading, isFetchingNextPage, searchData]);

	// Error handling
	useEffect(() => {
		if (isError) {
			console.error("Query Error: ", error);
		}
	}, [isError, error]);

	// Handle search
	async function handleSearch(keyword: string) {
		setSearchTerm(keyword);
		if (!keyword) {
			setSearchData(null);
			return;
		}
		try {
			const res = await searchAllMemberAPI({ keyword });
			// misal: res.data?.data -> array
			setSearchData(res.data?.data || []);
		} catch (err) {
			console.error(err);
		}
	}

	// Apply filter
	function applyFilter(newFilter: FilterKey, newTitle: string) {
		setFilter(newFilter);
		setTitle(newTitle);
		setSearchTerm("");
		setSearchData(null);
		setIsFilterOpen(false);
	}

	// Reset filter
	function resetFilter() {
		setFilter("default");
		setTitle("Nasional");
		setSearchTerm("");
		setSearchData(null);
		setIsFilterOpen(false);
	}

	return (
		<>
			{/* =========== MOBILE VIEW - TAMPILAN LAMA =========== */}
			<div className="md:hidden pb-20">
				<div className="pt-[4.21rem]">
					<TopBar withBackButton>
						Informasi Anggota
					</TopBar>

					{/* Header */}
					<div className="flex mx-6 md:mx-auto md:max-w-5xl bg-gradient-to-r from-[#006557] to-[#009788] mt-8 rounded-2xl h-[12rem] relative shadow-md">
						<img
							src="/svg/indonesian.svg"
							alt=""
							className="w-full object-cover rounded-lg"
						/>
						<div className="absolute bottom-4 right-4 p-1 text-center bg-[#FFD600] text-[#009788] rounded-md flex flex-col px-3 py-2">
							<p className="w-full text-xl font-bold italic">
								{memberCount.toLocaleString().replace(",", ".")}
							</p>
							<span className="text-[0.60rem] -mt-1 font-medium">
								Pengguna Nasional
							</span>
						</div>
					</div>

					{/* Tombol Filter & Search */}
					<div className="flex items-center justify-between mt-6 px-6">
						<h2 className="font-semibold text-xl">{title}</h2>

						<div className="flex gap-2">
							<button
								onClick={() => setIsFilterOpen(true)}
								className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md text-sm">
								Filter
							</button>

							<Link
								href="/member/export"
								className="flex items-center gap-2 bg-[#266565] text-white px-3 py-2 rounded-md text-sm hover:opacity-90">
								Export
							</Link>
						</div>
					</div>

					{/* Input search */}
					<div className="px-6 mt-4">
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder="Cari anggota..."
							className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#009788]"
						/>
					</div>

					{/* Konten daftar */}
					<div className="pt-4 flex flex-col">
						{searchData ? (
							// List user (hasil pencarian)
							searchData.length > 0 ? (
								searchData.map((member, idx) => (
									<Link
										href={`/profile/${member.id}`}
										key={idx}>
										<div className="px-6 py-4 border-t border-t-slate-200">
											<div className="font-bold text-lg">{member.name}</div>
											<div className="text-sm text-gray-600">
												{member.profile?.school_place || "Tidak diketahui"}
											</div>
										</div>
									</Link>
								))
							) : (
								<div className="px-6 py-8 text-center text-gray-400">Pencarian tidak ditemukan</div>
							)
						) : (
							// Data infinite query
							<>
								{data?.pages.map((page, pageIndex) =>
									page.data.map((province: ProvinceData, i: number) => {
										const count = province.users_count || 0;
										return (
											<Link
												key={`page-${pageIndex}-item-${i}`}
												href={`/member/${province.id}`}
												className="flex px-6 py-4 border-t border-t-slate-200 hover:bg-slate-50 transition-colors">
												<h1 className="capitalize">
													{province.name.toLowerCase()}
												</h1>
												<span className="ml-auto text-xs text-neutral-600">
													{isLoading ? "..." : count} Pengguna
												</span>
											</Link>
										);
									}),
								)}

								{/* Indikator fetch berikutnya */}
								<div
									ref={ref}
									className={clsx(
										isFetchingNextPage &&
											"flex justify-center py-4 text-sm text-neutral-600",
									)}>
									{isFetchingNextPage ? "Harap Tunggu.." : ""}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Modal filter Mobile */}
				{isFilterOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						<div
							onClick={() => setIsFilterOpen(false)}
							className="absolute inset-0 bg-black bg-opacity-40"
						/>
						<div className="relative w-[90%] max-w-md bg-white rounded-md p-6 shadow-md">
							<h3 className="text-lg font-bold mb-4">Filter Pencarian</h3>
							<button
								className="border border-[#009788] text-[#009788] rounded-md px-3 py-1 text-sm mb-4"
								onClick={resetFilter}>
								Reset
							</button>

							<p className="font-semibold mb-2">Status Guru</p>
							<div className="flex flex-col gap-2 mb-4">
								<div className="flex gap-2">
									<button
										onClick={() => applyFilter("pns", "ASN")}
										className={clsx(
											"border rounded-md px-3 py-1 text-sm transition-colors",
											filter === "pns"
												? "bg-[#009788] text-white border-[#009788]"
												: "border-[#009788] text-[#009788] hover:bg-teal-50",
										)}>
										ASN
									</button>
									<button
										onClick={() => applyFilter("non_pns", "Non ASN")}
										className={clsx(
											"border rounded-md px-3 py-1 text-sm transition-colors",
											filter === "non_pns"
												? "bg-[#009788] text-white border-[#009788]"
												: "border-[#009788] text-[#009788] hover:bg-teal-50",
										)}>
										Non ASN
									</button>
									<button
										onClick={() => applyFilter("certificate", "Sertifikasi")}
										className={clsx(
											"border rounded-md px-3 py-1 text-sm transition-colors",
											filter === "certificate"
												? "bg-[#009788] text-white border-[#009788]"
												: "border-[#009788] text-[#009788] hover:bg-teal-50",
										)}>
										Sertifikasi
									</button>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => applyFilter("inpassing", "Inpassing")}
										className={clsx(
											"border rounded-md px-3 py-1 text-sm transition-colors",
											filter === "inpassing"
												? "bg-[#009788] text-white border-[#009788]"
												: "border-[#009788] text-[#009788] hover:bg-teal-50",
										)}>
										Inpassing
									</button>
									<button
										onClick={() => applyFilter("bsi", "Punya BSI")}
										className={clsx(
											"border rounded-md px-3 py-1 text-sm transition-colors",
											filter === "bsi"
												? "bg-[#009788] text-white border-[#009788]"
												: "border-[#009788] text-[#009788] hover:bg-teal-50",
										)}>
										Punya BSI
									</button>
								</div>
							</div>

							<p className="font-semibold mb-2">Kategori</p>
							<div className="flex gap-2 mb-4">
								<button
									onClick={() => applyFilter("expired", "Aktif")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm transition-colors",
										filter === "expired"
											? "bg-[#009788] text-white border-[#009788]"
											: "border-[#009788] text-[#009788] hover:bg-teal-50",
									)}>
									Aktif
								</button>
								<button
									onClick={() => applyFilter("pension", "Pensiun")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm transition-colors",
										filter === "pension"
											? "bg-[#009788] text-white border-[#009788]"
											: "border-[#009788] text-[#009788] hover:bg-teal-50",
									)}>
									Pensiun
								</button>
							</div>

							<div className="flex justify-end">
								<button
									onClick={() => setIsFilterOpen(false)}
									className="mt-2 border border-slate-400 text-slate-700 rounded-md px-3 py-1 text-sm hover:bg-slate-50">
									Tutup
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* =========== DESKTOP VIEW - TAMPILAN BARU PREMIUM =========== */}
			<div className="hidden md:block bg-gray-50 min-h-screen pb-28">
				<TopBar withBackButton href="/">
					Informasi Anggota
				</TopBar>

				{/* Hero Banner Area */}
				<div className="bg-gradient-to-br from-[#006557] to-[#004D40] pt-[7rem] pb-[6rem] px-8 text-white relative">
					<div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
						<div className="max-w-2xl flex-1 z-10">
							<h1 className="text-4xl font-bold mb-4">Informasi Anggota Nasional</h1>
							<p className="opacity-80 text-lg mb-8 leading-relaxed">
								Data persebaran dan informasi dari seluruh anggota dan guru PAI yang bernaung di Indonesia.
							</p>
							
							<div className="flex flex-wrap gap-3">
								<div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl flex items-center justify-between border border-white/20 shadow-sm gap-8 min-w-[200px]">
									<div>
                    <span className="text-sm text-emerald-100/80 uppercase font-semibold tracking-wider block mb-1">Total Pengguna</span>
                    <span className="text-3xl font-bold text-white tracking-tight">{memberCount.toLocaleString().replace(",", ".")}</span>
                  </div>
									<div className="w-12 h-12 bg-[#FFD600]/20 rounded-full flex items-center justify-center text-[#FFD600]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
								</div>
								
								<div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl flex items-center justify-between border border-white/20 shadow-sm gap-8 min-w-[200px]">
									<div>
                    <span className="text-sm text-emerald-100/80 uppercase font-semibold tracking-wider block mb-1">Filter Aktif</span>
                    <span className="text-2xl font-bold text-white tracking-tight line-clamp-1">{title}</span>
                  </div>
								</div>
							</div>
						</div>

						<div className="hidden lg:flex w-[400px] relative z-10 justify-end">
							<img src="/svg/indonesian.svg" alt="Peta Indonesia" className="w-[300px] opacity-20" />
						</div>
					</div>
					
					{/* Background decorations */}
					<div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
						<svg className="absolute -right-[10%] -top-[20%] w-[50%] h-[150%]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
							<path fill="#FFFFFF" d="M42.7,-73.4C55.9,-67.8,67.6,-57.6,76.5,-45.3C85.4,-33,91.5,-18.6,90.9,-4.4C90.3,9.8,83.1,23.8,74.1,36C65.1,48.2,54.4,58.7,42.1,65.8C29.8,72.9,15.9,76.6,1.4,74.2C-13.1,71.8,-26.2,63.3,-38.7,55C-51.2,46.7,-63.1,38.6,-71.4,27.5C-79.7,16.4,-84.4,2.3,-82.3,-10.8C-80.2,-23.9,-71.3,-36.1,-60.7,-45.2C-50.1,-54.3,-37.8,-60.3,-25.7,-66.6C-13.6,-72.9,-1.7,-79.5,10.6,-81.7C22.9,-83.9,35.2,-81.7,42.7,-73.4Z" transform="translate(100 100)" />
						</svg>
					</div>
				</div>

				<div className="max-w-[1400px] mx-auto px-8 -mt-8 relative z-20">
					{/* Filter Bar & Search Desktop */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
						<div className="relative w-full xl:max-w-md">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
							</div>
							<input
								type="text"
								placeholder="Cari nama anggota atau pengguna..."
								className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006557]/20 focus:border-[#006557] focus:bg-white transition-all shadow-sm"
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>

						<div className="flex flex-wrap items-center gap-2 xl:gap-3 flex-1 xl:justify-end">
              <span className="text-sm font-semibold text-gray-400 mr-2 uppercase tracking-wide">Filter:</span>
							<button onClick={resetFilter} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "default" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Semua
							</button>
							<button onClick={() => applyFilter("pns", "ASN")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "pns" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								ASN
							</button>
							<button onClick={() => applyFilter("non_pns", "Non ASN")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "non_pns" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Non ASN
							</button>
							<button onClick={() => applyFilter("certificate", "Sertifikasi")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "certificate" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Sertifikasi
							</button>
							<button onClick={() => applyFilter("inpassing", "Inpassing")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "inpassing" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Inpassing
							</button>
							<button onClick={() => applyFilter("bsi", "Punya BSI")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "bsi" ? "bg-[#006557] text-white border-[#006557]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								BSI
							</button>
							
							<div className="w-px h-6 bg-gray-300 mx-1"></div>
							
							<button onClick={() => applyFilter("expired", "Aktif")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "expired" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Aktif
							</button>
							<button onClick={() => applyFilter("pension", "Pensiun")} className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border", filter === "pension" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300")}>
								Pensiun
							</button>
							
							<Link href="/member/export" className="ml-2 flex items-center gap-2 bg-[#FFD600] text-[#006557] px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all shadow-sm border border-[#FFD600]">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
								Export Excel
							</Link>
						</div>
					</div>

					{/* Layout Data/Grid */}
					<div className="mb-10 w-full min-h-[300px]">
						{searchData ? (
							// ================= Halaman Pencarian (User Results) =================
							searchData.length > 0 ? (
								<div>
									<h2 className="text-xl font-bold text-gray-800 mb-6">Hasil Pencarian: {searchData.length} Anggota</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
										{searchData.map((member, idx) => (
											<Link href={`/profile/${member.id}`} key={`desk-search-${idx}`}>
												<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#006557]/30 transition-all flex items-start gap-4 group h-full">
													<div className="w-12 h-12 flex-shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-[#006557] font-bold text-lg group-hover:scale-110 group-hover:bg-[#006557] group-hover:text-white transition-all">
														{member.name.charAt(0).toUpperCase()}
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-bold text-gray-900 text-base line-clamp-2 leading-tight mb-1 group-hover:text-[#006557] transition-colors">{member.name}</div>
														<div className="text-xs text-gray-500 line-clamp-2">
															<span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                {member.profile?.school_place || "Instansi tidak diketahui"}
                              </span>
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							) : (
								<div className="py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
									<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
										<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
									</div>
									<h3 className="text-lg font-bold text-gray-900 mb-1">Pencarian Tidak Ditemukan</h3>
									<p className="text-gray-500">Coba gunakan nama atau kata kunci yang berbeda.</p>
								</div>
							)
						) : (
							// ================= Halaman Provinsi (Initial View) =================
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{data?.pages.map((page, pageIndex) =>
										page.data.map((province: ProvinceData, i: number) => {
											const count = province.users_count || 0;
											return (
												<Link
													key={`desk-prov-${pageIndex}-${i}`}
													href={`/member/${province.id}`}
												>
													<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col justify-between h-[140px] relative overflow-hidden">
														
														<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
															<svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
														</div>

														<div>
															<h2 className="text-lg font-bold text-gray-800 capitalize leading-tight mb-2 group-hover:text-[#006557] transition-colors relative z-10">
																{province.name.toLowerCase()}
															</h2>
														</div>
														<div className="flex items-center justify-between relative z-10 border-t border-gray-50 pt-3">
															<span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Anggota</span>
															<span className="text-[#006557] font-bold text-lg bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50">
																{isLoading ? "..." : count.toLocaleString().replace(",", ".")}
															</span>
														</div>
													</div>
												</Link>
											);
										}),
									)}
								</div>

								{/* Indikator loading */}
								<div
									ref={ref}
									className="flex justify-center mt-12 mb-8">
									{isFetchingNextPage ? (
										<div className="flex flex-col items-center gap-3">
											<div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#006557] animate-spin"></div>
											<span className="text-sm font-semibold text-gray-400">Memuat provinsi lainnya...</span>
										</div>
									) : null}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
