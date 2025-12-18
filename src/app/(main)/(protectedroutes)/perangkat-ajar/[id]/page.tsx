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
					`${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/bahanajar/${materialId}`,
				);
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
		if (url) {
			window.open(url, "_blank");
		}
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
				await axios.delete(
					`${process.env.NEXT_PUBLIC_MITRA_URL}/api/bahanajar/${materialId}`,
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

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Detail Perangkat Ajar</TopBar>
			{/* Header */}
			<div className="bg-white border rounded-lg p-4 mb-6 shadow">
				<h1 className="text-2xl font-bold text-gray-800">
					{cekDanUbahType(materialData.type)}
				</h1>
			</div>

			{/* Title and Image Section */}
			<div className="flex flex-col md:flex-row bg-white border rounded-lg p-4 mb-6 shadow">
				<div className="flex-1">
					<h2 className="text-xl font-bold text-gray-800 mb-2">
						{materialData.topic}
					</h2>
					<p className="text-gray-600 mb-2">
						<strong>Ditulis Oleh:</strong> {materialData.user.name}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Kategori:</strong> {cekDanUbahType(materialData.type)}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Jenjang:</strong> {materialData.grade.description}
					</p>
					<p className="text-gray-600 mb-2">
						<strong>Materi:</strong> {materialData.subject}
					</p>
				</div>
				<div className="flex-shrink-0 w-40 h-40 relative">
					<img
						src={`${process.env.NEXT_PUBLIC_MITRA_URL}/public/${materialData.image}`}
						alt={materialData.topic}
						className="rounded-lg"
					/>
				</div>
			</div>

			{/* Description Section */}
			<div className="bg-white border rounded-lg p-4 mb-6 shadow">
				<h3 className="text-lg font-bold text-gray-800 mb-2">Deskripsi</h3>
				<p className="text-gray-600">{materialData.description}</p>
			</div>

			{/* File Section */}
			<div className="bg-white border rounded-lg p-4 shadow">
				<h3 className="text-lg font-bold text-gray-800 mb-4">File</h3>
				<div className="space-y-4">
					{contents.map((content: any) => (
						<div
							key={content.id}
							className="flex items-center bg-gray-100 border rounded-lg p-4 cursor-pointer hover:bg-gray-200"
							onClick={() => handleOpenURL(content.url)}>
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
							<div>
								<p className="text-gray-800 font-bold">{content.name}</p>
								<p className="text-gray-600 text-sm">
									Format: {content.format_doc || "-"}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Edit and Delete Buttons */}
			{materialData.user_id === user.id && (
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
