"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import API from "@/utils/api/config"; // Your axios instance
import TopBar from "@/components/nav/topbar";

interface Product {
	id: number | string;
	nama: string;
	alamat: string;
	province_id: number | null;
	city_id: number | null;
	no_wa: string;
	deskripsi: string;
	harga: number;
	stok: number;
	berat: number;
	foto?: string; // main photo
	foto_2?: string; // second photo
	foto_3?: string; // third photo
}

interface PhotoItem {
	file?: File; // for new local uploads
	uri?: string; // remote URI for existing images
	isRemote?: boolean;
}

// If you store images on a server or S3
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

export default function EditProductPage() {
	const router = useRouter();
	const { id } = useParams();
	// e.g. your route might be /edit-product?productId=123

	// Loading states
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);

	// Product
	const [product, setProduct] = useState<Product | null>(null);

	// Local form fields
	const [nama, setNama] = useState("");
	const [alamat, setAlamat] = useState("");
	const [provinceId, setProvinceId] = useState<number | null>(null);
	const [cityId, setCityId] = useState<number | null>(null);
	const [noWa, setNoWa] = useState("");
	const [deskripsi, setDeskripsi] = useState("");
	const [harga, setHarga] = useState("");
	const [stok, setStok] = useState("");
	const [berat, setBerat] = useState("");

	// Photos array (up to 3)
	const [photos, setPhotos] = useState<PhotoItem[]>([]);

	console.log(product);

	// ====== 1) FETCH PRODUCT ======
	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				setLoading(true);
				// <Product> is your TS type
				const response = await API.get<Product>(`/product/${id}`);
				const prod = response.data;
				setProduct(prod);
				console.log(response.data);

				// Populate form fields
				setNama(prod.nama ?? "");
				setAlamat(prod.alamat ?? "");
				setProvinceId(prod.province_id ?? null);
				setCityId(prod.city_id ?? null);
				setNoWa(prod.no_wa ?? "");
				setDeskripsi(prod.deskripsi ?? "");
				setHarga(String(prod.harga ?? ""));
				setStok(String(prod.stok ?? ""));
				setBerat(String(prod.berat ?? ""));

				// Convert existing photos to local PhotoItem array
				const loadedPhotos: PhotoItem[] = [];
				if (prod.foto) {
					loadedPhotos.push({
						uri: `${STORAGE_URL}/${prod.foto}`,
						isRemote: true,
					});
				}
				if (prod.foto_2) {
					loadedPhotos.push({
						uri: `${STORAGE_URL}/${prod.foto_2}`,
						isRemote: true,
					});
				}
				if (prod.foto_3) {
					loadedPhotos.push({
						uri: `${STORAGE_URL}/${prod.foto_3}`,
						isRemote: true,
					});
				}
				setPhotos(loadedPhotos);
			} catch (error) {
				console.error("Error fetching product detail:", error);
				alert("Gagal memuat data produk");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	// ====== 2) SELECT / REPLACE PHOTOS ======
	const handleSelectPhoto = (index?: number) => {
		// Programmatically create a file input
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = (e: Event) => {
			const target = e.target as HTMLInputElement;
			if (!target.files || target.files.length === 0) return;
			const file = target.files[0];
			if (!file) return;

			// If user clicked on existing photo => replace
			if (index !== undefined) {
				const newPhotos = [...photos];
				newPhotos[index] = { file };
				setPhotos(newPhotos);
			} else {
				// Add new photo if < 3
				if (photos.length < 3) {
					setPhotos([...photos, { file }]);
				} else {
					alert("Maksimal unggah 3 foto.");
				}
			}
		};
		input.click();
	};

	// ====== 3) UPDATE PRODUCT ======
	const handleUpdate = async () => {
		if (!id) {
			alert("Tidak ada Product ID");
			return;
		}
		setUpdating(true);

		// Build FormData
		const formData = new FormData();
		formData.append("nama", nama);
		formData.append("alamat", alamat);
		formData.append("province_id", provinceId ? String(provinceId) : "");
		formData.append("city_id", cityId ? String(cityId) : "");
		formData.append("no_wa", noWa);
		formData.append("deskripsi", deskripsi);
		formData.append("harga", harga);
		formData.append("stok", stok);
		formData.append("berat", berat);

		// Append new files (skip remote URIs)
		photos.forEach((photoItem, idx) => {
			if (photoItem.file) {
				const fieldName = idx === 0 ? "foto" : `foto_${idx + 1}`;
				formData.append(fieldName, photoItem.file);
			}
		});

		// Some backends do PUT, others do POST + _method=PUT
		try {
			await API.post(`/product/${id}?_method=PUT`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			alert("Produk berhasil diperbarui!");
			router.back(); // or router.push("/somewhere");
		} catch (err) {
			console.error("Error updating product:", err);
			alert("Gagal memperbarui produk");
		} finally {
			setUpdating(false);
		}
	};

	// ====== 4) RENDER ======


	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Edit Produk</TopBar>
			<div className="container mx-auto p-4">
				<h1 className="text-lg font-semibold mb-4">Edit Produk</h1>

				{/* Photos list */}
				<div className="flex gap-2 overflow-x-auto mb-4">
					{photos.map((photo, idx) => (
						<div
							key={idx}
							className="relative w-24 h-24 border rounded-md cursor-pointer"
							onClick={() => handleSelectPhoto(idx)}>
							{photo.file ? (
								<img
									src={URL.createObjectURL(photo.file)}
									alt={`Foto ${idx + 1}`}
									className="object-cover w-24 h-24 rounded-md"
								/>
							) : photo.uri ? (
								<img
									src={photo.uri}
									alt={`Foto ${idx + 1}`}
									className="object-cover w-24 h-24 rounded-md"
								/>
							) : (
								<div className="w-24 h-24 flex items-center justify-center text-gray-400">
									No Image
								</div>
							)}
						</div>
					))}

					{photos.length < 3 && (
						<div
							className="border border-green-600 w-24 h-24 flex items-center justify-center cursor-pointer"
							onClick={() => handleSelectPhoto()}>
							<span className="text-green-600 text-xl">+</span>
						</div>
					)}
				</div>

				{/* If no photos at all, placeholder */}
				{photos.length === 0 && (
					<div
						className="w-full h-48 border border-dashed border-gray-400 flex flex-col items-center justify-center mb-4 cursor-pointer"
						onClick={() => handleSelectPhoto()}>
						<span className="text-gray-400 text-2xl mb-2">📷</span>
						<p className="text-gray-400">Tambah Foto Produk</p>
					</div>
				)}

				{/* Form */}
				<label className="block text-sm font-semibold mb-1">Nama Produk</label>
				<input
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={nama}
					onChange={(e) => setNama(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">
					Alamat Pengirim
				</label>
				<input
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={alamat}
					onChange={(e) => setAlamat(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">
					Nomor WhatsApp
				</label>
				<input
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={noWa}
					onChange={(e) => setNoWa(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">
					Deskripsi Produk
				</label>
				<textarea
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={deskripsi}
					onChange={(e) => setDeskripsi(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">Harga</label>
				<input
					type="number"
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={harga}
					onChange={(e) => setHarga(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">Stok</label>
				<input
					type="number"
					className="border border-gray-300 rounded-md p-2 w-full mb-3"
					value={stok}
					onChange={(e) => setStok(e.target.value)}
				/>

				<label className="block text-sm font-semibold mb-1">
					Berat Produk (gram)
				</label>
				<input
					type="number"
					className="border border-gray-300 rounded-md p-2 w-full mb-4"
					value={berat}
					onChange={(e) => setBerat(e.target.value)}
				/>

				<button
					onClick={handleUpdate}
					disabled={updating}
					className="bg-green-600 text-white font-semibold py-3 w-full rounded-md disabled:bg-gray-400">
					{updating ? "Updating..." : "Update Produk"}
				</button>
			</div>
		</div>
	);
}
