"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import { cekDanUbahType } from "@/utils/function/function";

const DetailPerangkatAjarPage: React.FC = () => {
	const { id: materialId } = useParams();
	const { auth: user } = useAuth();
	const [materialData, setMaterialData] = useState<any>(null);
	const [contents, setContents] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchMaterialData = async () => {
			if (!materialId) return;

			try {
				const response = await axios.get(
					`https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
				);
				console.log('Material Data:', response.data.data);
				console.log('Contents:', response.data.data.contents);
				setMaterialData(response.data.data);
				setContents(response.data.data.contents || []);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching material data:", error);
				setLoading(false);
			}
		};

		fetchMaterialData();
	}, [materialId]);

	const handleOpenURL = (url: string) => {
		console.log('Opening URL:', url);
		if (url) {
			const fullUrl = url.startsWith('http') 
				? url 
				: `https://2024.agpaiidigital.org/${url}`;
			console.log('Full URL:', fullUrl);
			
			// Jika file Office, buka dengan Google Docs Viewer
			if (isOfficeFile(url)) {
				const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}`;
				window.open(viewerUrl, "_blank");
			} else {
				// File lain (PDF, gambar, dll) buka langsung
				window.open(fullUrl, "_blank");
			}
		} else {
			console.error('URL is empty or undefined');
			alert('URL file tidak tersedia');
		}
	};

	const getFullUrl = (url: string) => {
		if (!url) return '';
		return url.startsWith('http') ? url : `https://2024.agpaiidigital.org/${url}`;
	};

	const getFileExtension = (url: string) => {
		if (!url) return '';
		const parts = url.split('.');
		return parts[parts.length - 1].toLowerCase();
	};

	const isOfficeFile = (url: string) => {
		const ext = getFileExtension(url);
		return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
	};

	const isPdfFile = (url: string) => {
		const ext = getFileExtension(url);
		return ext === 'pdf';
	};

	const isYoutubeVideo = (formatDoc: string) => {
		const format = formatDoc?.toLowerCase() || '';
		return format === 'youtube';
	};

	const getYoutubeEmbedUrl = (url: string) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		const videoId = (match && match[2].length === 11) ? match[2] : null;
		return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
	};

	const handleEdit = () => {
		if (materialId) {
			window.location.href = `/perangkat-ajar/${materialId}/edit`;
		}
	};

	const handleDelete = async () => {
		if (!materialId) return;

		if (confirm("Apakah Anda yakin ingin menghapus perangkat ajar ini?")) {
			try {
				const token = localStorage.getItem("access_token");
				
				await axios.delete(
					`https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
					}
				);
				alert("Perangkat ajar berhasil dihapus.");
				window.location.href = "/perangkat-ajar";
			} catch (error) {
				console.error("Error deleting material:", error);
				alert("Gagal menghapus perangkat ajar.");
			}
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-xl">Loading...</div>
			</div>
		);
	}

	if (!materialData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-xl">Data tidak ditemukan</div>
			</div>
		);
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Detail Perangkat Ajar</TopBar>
			{/* Header */}
			<div className="bg-white border rounded-lg p-4 mb-6 shadow">
				<h1 className="text-2xl font-bold text-gray-800">
					{cekDanUbahType(materialData?.type || "")}
				</h1>
			</div>

			{/* Title and Image Section */}
			<div className="flex flex-col md:flex-row bg-white border rounded-lg p-4 mb-6 shadow">
				<div className="flex-1">
					<h2 className="text-xl font-bold text-gray-800 mb-2">
						{materialData?.topic || ""}
					</h2>
					<p className="text-gray-600 mb-2">
						<strong>Ditulis Oleh:</strong> {materialData?.user?.name || "-"}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Kategori:</strong> {cekDanUbahType(materialData?.type || "")}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Jenjang:</strong> {materialData?.grade?.description || "-"}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Materi:</strong> {materialData?.subject || "-"}
					</p>
				</div>
				<div className="flex-shrink-0 w-40 h-40 relative">
					<img
						src={`${process.env.NEXT_PUBLIC_MITRA_URL}/public/${materialData?.image || ""}`}
						alt={materialData?.topic || ""}
						className="rounded-lg"
					/>
				</div>
			</div>

			{/* Description Section */}
			<div className="bg-white border rounded-lg p-4 mb-6 shadow">
				<h3 className="text-lg font-bold text-gray-800 mb-2">Deskripsi</h3>
				<p className="text-gray-600">{materialData?.description || "-"}</p>
			</div>

			{/* File Section */}
			<div className="bg-white border rounded-lg p-4 shadow mb-6">
				<h3 className="text-lg font-bold text-gray-800 mb-4">File</h3>
				<div className="space-y-4">
					{contents.map((content: any) => (
						<div key={content.id} className="border rounded-lg overflow-hidden">
							{/* File Info Header */}
							<div
								className="flex items-center bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition"
								onClick={() => handleOpenURL(content.url || content.value)}>
								<div className="w-10 h-10 flex-shrink-0 mr-4">
									<img
										src={
											content.format_doc === "Pdf"
												? "/icons/pdf.png"
												: content.format_doc === "Youtube"
												? "/icons/youtube.png"
												: content.format_doc === "Doc" ||
												  content.format_doc === "Word"
												? "/icons/word.png"
												: content.format_doc === "PowerPoint" ||
												  content.format_doc === "Ppt" ||
												  content.format_doc === "Pptx"
												? "/icons/powerpoint.png"
												: content.format_doc === "Excel" ||
												  content.format_doc === "Xls" ||
												  content.format_doc === "Xlsx"
												? "/icons/excel.png"
												: "https://via.placeholder.com/40?text=?"
										}
										alt={content.format_doc}
										height={40}
										className="rounded-md"
									/>
								</div>
								<div className="flex-1">
									<p className="text-gray-800 font-bold">{content.name}</p>
									<p className="text-gray-600 text-sm">
										Format: {content.format_doc || "-"}
									</p>
								</div>
								<div className="text-blue-600 text-sm">
									Klik untuk buka di tab baru →
								</div>
							</div>

							{/* Preview Section */}
							{isYoutubeVideo(content.format_doc) && getYoutubeEmbedUrl(content.url || content.value) && (
								<div className="bg-white p-4">
									<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
										<iframe
											src={getYoutubeEmbedUrl(content.url || content.value) || ''}
											className="absolute top-0 left-0 w-full h-full rounded"
											title={content.name}
											frameBorder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
										/>
									</div>
								</div>
							)}

							{isPdfFile(content.url || content.value) && (
								<div className="bg-white p-4">
									<iframe
										src={getFullUrl(content.url || content.value)}
										className="w-full h-[600px] border-0 rounded"
										title={content.name}
									/>
								</div>
							)}

							{isOfficeFile(content.url || content.value) && (
								<div className="bg-white p-4">
									<iframe
										src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFullUrl(content.url || content.value))}&embedded=true`}
										className="w-full h-[600px] border-0 rounded"
										title={content.name}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Edit and Delete Buttons */}
			{materialData?.user_id === user?.id && (
				<div className="mt-6 flex space-x-4">
					<button
						onClick={handleEdit}
						className="px-4 py-2 bg-blue-500 text-white rounded shadow">
						Edit
					</button>
					<button
						onClick={handleDelete}
						className="px-4 py-2 bg-red-500 text-white rounded shadow">
						Hapus
					</button>
				</div>
			)}
		</div>
	);
};

export default DetailPerangkatAjarPage;
