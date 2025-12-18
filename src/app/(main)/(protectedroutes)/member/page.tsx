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
		<div className="pt-[4.21rem]">
			<TopBar withBackButton>Informasi Anggota</TopBar>

			{/* Header */}
			<div className="flex mx-6 bg-[#009788] mt-8 rounded-lg h-[12rem] relative">
				<img
					src="/svg/indonesian.svg"
					alt=""
					className="w-full object-cover rounded-lg"
				/>
				<div className="absolute bottom-4 right-4 p-1 text-center bg-[#FFD600] text-[#009788] rounded-md flex flex-col px-3 py-2">
					<p className="w-full text-xl font-bold italic">
						{memberCount.toLocaleString().replace(",", ".")}
					</p>
					<span className="text-xs text-[0.60rem] -mt-1 font-medium">
						Pengguna Nasional
					</span>
				</div>
			</div>

			{/* Tombol Filter & Search */}
			<div className="flex items-center justify-between mt-6 px-6">
				<h2 className="font-semibold text-xl">{title}</h2>
				<button
					onClick={() => setIsFilterOpen(true)}
					className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md text-sm">
					Filter
				</button>
			</div>

			{/* Input search */}
			<div className="px-6 mt-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Cari anggota..."
					className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
				/>
			</div>

			{/* Konten daftar */}
			<div className="pt-4 flex flex-col">
				{searchData ? (
					// List user (hasil pencarian)
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
					// Data infinite query
					<>
						{data?.pages.map((page, pageIndex) =>
							page.data.map((province: ProvinceData, i: number) => {
								const count = province.users_count || 0;
								return (
									<Link
										key={`page-${pageIndex}-item-${i}`}
										href={`/member/${province.id}`}
										className="flex px-6 py-4 border-t border-t-slate-200">
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

			{/* Modal filter */}
			{isFilterOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* backdrop */}
					<div
						onClick={() => setIsFilterOpen(false)}
						className="absolute inset-0 bg-black bg-opacity-40"
					/>
					{/* content */}
					<div className="relative w-[90%] max-w-md bg-white rounded-md p-6 shadow-md">
						<h3 className="text-lg font-bold mb-4">Filter Pencarian</h3>
						<button
							className="border border-blue-500 text-blue-500 rounded-md px-3 py-1 text-sm mb-4"
							onClick={resetFilter}>
							Reset
						</button>

						<p className="font-semibold mb-2">Status Guru</p>
						<div className="flex flex-col gap-2 mb-4">
							<div className="flex gap-2">
								<button
									onClick={() => applyFilter("pns", "ASN")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm",
										filter === "pns"
											? "bg-blue-500 text-white border-blue-500"
											: "border-blue-500 text-blue-500",
									)}>
									ASN
								</button>
								<button
									onClick={() => applyFilter("non_pns", "Non ASN")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm",
										filter === "non_pns"
											? "bg-blue-500 text-white border-blue-500"
											: "border-blue-500 text-blue-500",
									)}>
									Non ASN
								</button>
								<button
									onClick={() => applyFilter("certificate", "Sertifikasi")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm",
										filter === "certificate"
											? "bg-blue-500 text-white border-blue-500"
											: "border-blue-500 text-blue-500",
									)}>
									Sertifikasi
								</button>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => applyFilter("inpassing", "Inpassing")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm",
										filter === "inpassing"
											? "bg-blue-500 text-white border-blue-500"
											: "border-blue-500 text-blue-500",
									)}>
									Inpassing
								</button>
								<button
									onClick={() => applyFilter("bsi", "Punya BSI")}
									className={clsx(
										"border rounded-md px-3 py-1 text-sm",
										filter === "bsi"
											? "bg-blue-500 text-white border-blue-500"
											: "border-blue-500 text-blue-500",
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
									"border rounded-md px-3 py-1 text-sm",
									filter === "expired"
										? "bg-blue-500 text-white border-blue-500"
										: "border-blue-500 text-blue-500",
								)}>
								Aktif
							</button>
							<button
								onClick={() => applyFilter("pension", "Pensiun")}
								className={clsx(
									"border rounded-md px-3 py-1 text-sm",
									filter === "pension"
										? "bg-blue-500 text-white border-blue-500"
										: "border-blue-500 text-blue-500",
								)}>
								Pensiun
							</button>
						</div>

						<div className="flex justify-end">
							<button
								onClick={() => setIsFilterOpen(false)}
								className="mt-2 border border-slate-400 text-slate-700 rounded-md px-3 py-1 text-sm">
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
