"use client";

import React, { useState, useEffect, ChangeEvent, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import clsx from "clsx";

// Custom hooks and components (you'll need these or replace them)
import { useAuth } from "@/utils/context/auth_context";
import { useModal } from "@/utils/hooks/use_modal";
import TopBar from "@/components/nav/topbar";
import Modal from "@/components/modal/modal";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";

// ============== Types & Interfaces ==============
interface Province {
	id: number;
	name: string;
}

interface City {
	id: number;
	name: string;
}

interface RegionState {
	province_id: number | null;
	city_id: number | null;
}

export default function TambahProdukPage() {
	// ----- Form fields -----
	const [namaProduk, setNamaProduk] = useState<string>("");
	const [noWa, setNoWa] = useState<string>("");
	const [deskripsi, setDeskripsi] = useState<string>("");
	const [harga, setHarga] = useState<string>("");
	const [stok, setStok] = useState<string>("");
	const [berat, setBerat] = useState<string>("");
	const [alamat, setAlamat] = useState<string>("");

	// ----- Province/City state (from region logic) -----
	const [region, setRegion] = useState<RegionState>({
		province_id: null,
		city_id: null,
	});

	// ----- Photo uploads (up to 3) -----
	const [photos, setPhotos] = useState<File[]>([]);

	// ----- Posting/loading states -----
	const [isPosting, setIsPosting] = useState<boolean>(false);

	// Auth & Next Router
	const { auth } = useAuth(); // if needed
	const router = useRouter();
	const queryClient = useQueryClient();

	// ====== If user already has a region, pre-set it (optional) ======
	useEffect(() => {
		if (auth.profile?.province_id && auth.profile?.city_id) {
			setRegion({
				province_id: auth.profile.province_id,
				city_id: auth.profile.city_id,
			});
		}
	}, [auth]);

	// ===================== Modals for Province & City =====================
	const { show: provinceModalShow, toggle: toggleProvinceModal } = useModal();
	const { show: cityModalShow, toggle: toggleCityModal } = useModal();

	// ===================== useInfiniteQuery for Provinces =====================
	const {
		data: provinces,
		isFetchingNextPage: isFetchingNextProvince,
		fetchNextPage: fetchNextProvince,
		isLoading: provincesLoading,
	} = useInfiniteQuery({
		queryKey: ["provinces"],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }) => {
			// Adjust endpoint to your backend
			const res = await API.get(`/province?page=${pageParam}`);
			if (res.status === 200) {
				return {
					nextPage:
						res.data.next_page_url !== null
							? parseInt(res.data.next_page_url.split("=").pop())
							: undefined,
					data: res.data.data,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	// ===================== useInfiniteQuery for Cities =====================
	const {
		data: cities,
		isFetchingNextPage: isFetchingNextCities,
		fetchNextPage: fetchNextCities,
		isLoading: citiesLoading,
	} = useInfiniteQuery({
		enabled: !!region.province_id && !!cityModalShow,
		queryKey: ["cities", region.province_id],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }) => {
			// Adjust endpoint to your backend
			const res = await API.get(
				`/province/${region.province_id}/city?page=${pageParam}`,
			);
			if (res.status === 200) {
				return {
					nextPage:
						res.data.next_page_url !== null
							? parseInt(res.data.next_page_url.split("=").pop())
							: undefined,
					data: res.data.data,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	// Intersection observers for infinite scroll
	const { inView: provinceInView, ref: provinceRef } = useInView();
	const { inView: cityInView, ref: cityRef } = useInView();

	useEffect(() => {
		if (provinceInView && !isFetchingNextProvince) {
			fetchNextProvince();
		}
	}, [provinceInView, isFetchingNextProvince]);

	useEffect(() => {
		if (cityInView && !isFetchingNextCities) {
			fetchNextCities();
		}
	}, [cityInView, isFetchingNextCities]);

	// Flatten infinite pages data
	const provincesList = provinces?.pages.flatMap((p) => p?.data || []);
	const citiesList = cities?.pages.flatMap((c) => c?.data || []);

	// ============== Photo Selection Logic ==============
	const handleSelectPhoto = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const files = Array.from(e.target.files);
		if (photos.length + files.length > 3) {
			alert("Maksimal unggah 3 foto");
			return;
		}
		setPhotos((prev) => [...prev, ...files]);
	};

	const removePhotoAtIndex = (idx: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== idx));
	};

	// ============== Form Submission (Create Product) ==============
	const handlePost = async () => {
		// Basic validation
		if (!namaProduk.trim()) {
			alert("Nama produk harus diisi!");
			return;
		}
		if (!region.province_id) {
			alert("Provinsi harus dipilih!");
			return;
		}
		if (!region.city_id) {
			alert("Kota harus dipilih!");
			return;
		}

		try {
			setIsPosting(true);

			const formData = new FormData();
			formData.append("nama", namaProduk);
			formData.append("alamat", alamat);
			formData.append("province_id", region.province_id.toString());
			formData.append("city_id", region.city_id.toString());
			formData.append("no_wa", noWa);
			formData.append("deskripsi", deskripsi);
			formData.append("harga", harga);
			formData.append("stok", stok);
			formData.append("berat", berat);

			// Append photos
			photos.forEach((photo, i) => {
				formData.append(`foto_${i + 1}`, photo);
			});

			const response = await API.post("/product", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			alert("Produk berhasil ditambahkan!");
			router.push("/marketplace/produk-saya");
		} catch (error: any) {
			console.error("Error posting product:", error);
			alert("Gagal menambahkan produk");
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Tambah Produk</TopBar>

			{/* MAIN CONTENT */}
			<div className="container mx-auto p-4">
				{/* ========== Photo Upload Section ========== */}
				<h2 className="text-md font-semibold mb-2">Foto Produk (max 3)</h2>
				<div className="flex gap-4 mb-4 flex-wrap">
					{photos.map((photo, idx) => (
						<div
							key={idx}
							className="relative w-24 h-24 border rounded-md">
							<img
								src={URL.createObjectURL(photo)}
								alt={`Foto ${idx + 1}`}
								className="object-cover w-24 h-24 rounded-md"
							/>
							<button
								onClick={() => removePhotoAtIndex(idx)}
								className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1">
								X
							</button>
						</div>
					))}
					{photos.length < 3 && (
						<label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md text-gray-400 cursor-pointer">
							<span className="text-sm">+ Foto</span>
							<input
								type="file"
								multiple
								accept="image/*"
								onChange={handleSelectPhoto}
								className="hidden"
							/>
						</label>
					)}
				</div>

				{/* ========== Nama Produk ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Nama Produk*
					</label>
					<input
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Masukkan Nama Produk"
						value={namaProduk}
						onChange={(e) => setNamaProduk(e.target.value)}
					/>
				</div>

				{/* ========== Pilih Provinsi & Kota via "region" approach ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">Provinsi*</label>
					<div
						className="border border-gray-300 bg-gray-100 p-2 rounded-md cursor-pointer"
						onClick={() => toggleProvinceModal()}>
						{provincesLoading
							? "Memuat..."
							: provincesList?.find((p: any) => p.id === region.province_id)
									?.name || "Pilih Provinsi"}
					</div>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Kota / Kabupaten*
					</label>
					<div
						className={clsx(
							"border border-gray-300 bg-gray-100 p-2 rounded-md",
							!region.province_id ? "opacity-60" : "cursor-pointer",
						)}
						onClick={() => {
							if (!region.province_id) {
								alert("Pilih provinsi terlebih dahulu");
								return;
							}
							toggleCityModal();
						}}>
						{citiesLoading
							? "Memuat..."
							: citiesList?.find((c: any) => c.id === region.city_id)?.name ||
							  "Pilih Kota/Kabupaten"}
					</div>
				</div>

				{/* ========== Detail Alamat Pengirim ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Detail Alamat Pengirim*
					</label>
					<input
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Misal: Jl. Mawar RT 02/03, dsb."
						value={alamat}
						onChange={(e) => setAlamat(e.target.value)}
					/>
				</div>

				{/* ========== Nomor WhatsApp ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Nomor WhatsApp*
					</label>
					<input
						type="tel"
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Masukkan No. WA"
						value={noWa}
						onChange={(e) => setNoWa(e.target.value)}
					/>
				</div>

				{/* ========== Deskripsi Produk ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Deskripsi Produk*
					</label>
					<textarea
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Masukkan Deskripsi Produk"
						value={deskripsi}
						onChange={(e) => setDeskripsi(e.target.value)}
					/>
				</div>

				{/* ========== Harga ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">Harga*</label>
					<input
						type="number"
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Masukkan Harga Produk"
						value={harga}
						onChange={(e) => setHarga(e.target.value)}
					/>
				</div>

				{/* ========== Stok ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">Stok*</label>
					<input
						type="number"
						className="w-full border border-gray-300 p-2 rounded-md"
						placeholder="Masukkan Jumlah Stok"
						value={stok}
						onChange={(e) => setStok(e.target.value)}
					/>
				</div>

				{/* ========== Berat ========== */}
				<div className="mb-4">
					<label className="block text-sm font-semibold mb-1">
						Berat Produk*
					</label>
					<div className="flex items-center">
						<input
							type="number"
							className="flex-1 border border-gray-300 p-2 rounded-md"
							placeholder="Masukkan Berat Produk"
							value={berat}
							onChange={(e) => setBerat(e.target.value)}
						/>
						<span className="ml-2 text-sm">gram</span>
					</div>
				</div>

				{/* ========== Submit Button ========== */}
				<button
					onClick={handlePost}
					disabled={isPosting}
					className="bg-green-600 text-white font-semibold py-3 w-full rounded-md disabled:bg-gray-400">
					{isPosting ? "Posting..." : "Posting Produk"}
				</button>
			</div>

			{/* ======================== Province Modal ======================== */}
			<Modal
				show={provinceModalShow}
				onClose={toggleProvinceModal}
				className="w-full !px-0">
				<div className="flex flex-col items-start text-left pb-3">
					<h1 className="text-base font-medium pb-4 px-5">Pilih Provinsi</h1>
					{provincesLoading ? (
						<div className="h-[10rem] flex justify-center w-full items-center">
							<Loader className="size-10" />
						</div>
					) : (
						<div className="max-h-[20rem] overflow-y-scroll no-scrollbar w-full">
							{provinces?.pages.map((page, i) => (
								<Fragment key={i}>
									{page?.data.map((prov: any, index: number) => (
										<div
											key={index}
											className="py-3 hover:font-medium hover:bg-slate-100 rounded-md px-5 duration-300 ease-in-out text-slate-600 cursor-pointer text-[0.95rem] capitalize"
											onClick={() => {
												setRegion({ province_id: prov.id, city_id: null });
												queryClient.invalidateQueries({
													queryKey: ["cities"],
												});
												toggleProvinceModal();
											}}>
											{prov.name}
										</div>
									))}
								</Fragment>
							))}
							<div ref={provinceRef}></div>
						</div>
					)}
				</div>
			</Modal>

			{/* ======================== City Modal ======================== */}
			<Modal
				show={cityModalShow}
				onClose={toggleCityModal}
				className="w-full !px-0">
				<div className="pb-3">
					<h1 className="text-base text-left pb-4 px-5 font-medium">
						Pilih Kota/Kabupaten
					</h1>
					{citiesLoading ? (
						<div className="h-[10rem] flex justify-center w-full items-center">
							<Loader className="size-10" />
						</div>
					) : (
						<div className="max-h-[20rem] overflow-y-scroll no-scrollbar text-left">
							{cities?.pages.map((page, i) => (
								<Fragment key={i}>
									{page?.data.map((ct: any, index: number) => (
										<div
											key={index}
											className="py-3 hover:font-medium cursor-pointer hover:bg-slate-100 ease-in-out duration-300 px-5 text-slate-600 capitalize text-[0.95rem]"
											onClick={() => {
												setRegion({ ...region, city_id: ct.id });
												toggleCityModal();
											}}>
											{ct.name}
										</div>
									))}
								</Fragment>
							))}
							<div ref={cityRef}></div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
