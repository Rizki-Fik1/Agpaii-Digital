"use client";
import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { cekDanUbahType } from "@/utils/function/function";

interface Grade {
	id: string;
	description: string;
}

interface Content {
	id?: any;
	type: "file" | "youtube";
	name: string;
	file?: File | null;
	youtube_url?: string;
	url?: string;
	format_doc?: string;
	value?: string;
	previewUrl?: string;
}

interface FormData {
	id: string | null;
	topic: string;
	school: string;
	subject: string;
	duration: string;
	grade_id: string;
	type: string;
	description: string;
	contents: Content[];
	image: any;
	bannerImageType: string;
	bannerImageName: string;
	creator_id: string;
}

const EditPerangkatAjar: React.FC = () => {
	const { id: materialId } = useParams();
	const router = useRouter();
	const { auth: user } = useAuth();
	const [grades, setGrades] = useState<Grade[]>([]);
	const [formData, setFormData] = useState<FormData>({
		id: null,
		topic: "",
		school: "",
		subject: "",
		duration: "",
		grade_id: "",
		type: "",
		description: "",
		contents: [],
		image: null,
		bannerImageType: "",
		bannerImageName: "",
		creator_id: user?.id || "",
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	const typeOptions = ["Materi ajar & RPP", "Bahan ajar", "Buku", "LKPD"];

	useEffect(() => {
		fetchGrades();
		loadMaterialData();
	}, [materialId, user?.id]);

	const fetchGrades = async () => {
		try {
			const response = await axios.get(
				"https://2024.agpaiidigital.org/api/bahanajar/grades/list"
			);
			setGrades(response.data || []);
		} catch (error) {
			console.error("Error fetching grades:", error);
		}
	};

	const loadMaterialData = async () => {
			if (!materialId) return;

			try {
				const response = await axios.get(
					`https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
				);
				console.log('Material Data:', response.data.data);
				console.log('Contents:', response.data.data.contents);
				const material = response.data.data;
				setFormData({
					id: material.id || null,
					topic: material.topic || "",
					school: material.school || "",
					subject: material.subject || "",
					duration: material.duration || "",
					grade_id: material.grade_id || "",
					type: material.type || "",
					description: material.description || "",
					contents: (material.contents || []).map((c: any) => {
						const mappedContent = {
							id: c.id,
							type: c.format_doc === "Youtube" ? "youtube" : "file",
							name: c.name || "",
							url: c.url || c.value || "",
							youtube_url: c.url || c.value || "",
							format_doc: c.format_doc || "",
							value: c.value || "",
							file: null,
						};
						console.log('Mapped content:', mappedContent);
						return mappedContent;
					}),
					image: material.image
						? `${process.env.NEXT_PUBLIC_MITRA_URL}/public/${material.image}`
						: null,
					bannerImageType: "",
					bannerImageName: "",
					creator_id: material.creator_id || user?.id || "",
				});
				setIsDataLoaded(true);
			} catch (error) {
				console.error("Error loading material:", error);
				setIsDataLoaded(true);
			}
		};

	const handleAddContent = () => {
		setFormData((prev) => ({
			...prev,
			contents: [
				...prev.contents,
				{ type: "file", name: "", file: null, youtube_url: "" },
			],
		}));
	};

	const handleContentTypeChange = (index: number, type: "file" | "youtube") => {
		const newContents = [...formData.contents];
		newContents[index] = { 
			...newContents[index],
			type, 
			file: null, 
			youtube_url: newContents[index].youtube_url || newContents[index].url || "" 
		};
		setFormData({ ...formData, contents: newContents });
	};

	const handleContentNameChange = (index: number, name: string) => {
		const newContents = [...formData.contents];
		newContents[index].name = name;
		setFormData({ ...formData, contents: newContents });
	};

	const handleContentFileChange = (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const newContents = [...formData.contents];
		const file = e.target.files?.[0] ?? null;
		newContents[index].file = file;
		
		// Create preview URL for the file
		if (file) {
			const previewUrl = URL.createObjectURL(file);
			newContents[index].previewUrl = previewUrl;
		} else {
			newContents[index].previewUrl = undefined;
		}
		
		setFormData({ ...formData, contents: newContents });
	};

	const handleOpenPreview = (content: Content) => {
		if (content.type === "file") {
			if (content.file) {
				// File baru yang belum diupload - buka di tab baru
				const url = URL.createObjectURL(content.file);
				window.open(url, '_blank');
				setTimeout(() => URL.revokeObjectURL(url), 1000);
			} else if (content.url) {
				// File yang sudah ada di server
				const fullUrl = getFullUrl(content.url);
				
				// Jika file Office, buka dengan Google Docs Viewer
				if (isOfficeFile(content.url)) {
					const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}`;
					window.open(viewerUrl, "_blank");
				} else {
					window.open(fullUrl, "_blank");
				}
			}
		} else if (content.type === "youtube" && (content.youtube_url || content.url)) {
			window.open(content.youtube_url || content.url || "", "_blank");
		}
	};

	const getFileIcon = (fileName: string) => {
		const ext = fileName.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'pdf':
				return '📄';
			case 'doc':
			case 'docx':
				return '📝';
			case 'xls':
			case 'xlsx':
				return '📊';
			case 'ppt':
			case 'pptx':
				return '📽️';
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
				return '🖼️';
			case 'mp4':
			case 'avi':
			case 'mov':
				return '🎥';
			default:
				return '📎';
		}
	};

	const isImageFile = (fileName: string) => {
		const ext = fileName.split('.').pop()?.toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
	};

	const isPdfFile = (fileName: string) => {
		const ext = fileName.split('.').pop()?.toLowerCase();
		return ext === 'pdf';
	};

	const getFileExtension = (url: string) => {
		if (!url) return '';
		const parts = url.split('.');
		return parts[parts.length - 1].toLowerCase();
	};

	const isOfficeFile = (fileName: string) => {
		const ext = fileName.split('.').pop()?.toLowerCase();
		return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
	};

	const getFullUrl = (url: string) => {
		if (!url) return '';
		return url.startsWith('http') ? url : `https://2024.agpaiidigital.org/${url}`;
	};

	const getYoutubeEmbedUrl = (url: string) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		const videoId = (match && match[2].length === 11) ? match[2] : null;
		return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
	};

	const handleContentYoutubeChange = (index: number, url: string) => {
		const newContents = [...formData.contents];
		newContents[index].youtube_url = url;
		setFormData({ ...formData, contents: newContents });
	};

	const handleContentChange = (
		index: number,
		field: keyof Content,
		value: string,
	) => {
		const newContents = [...formData.contents];
		(newContents[index] as any)[field] = value;
		setFormData({ ...formData, contents: newContents });
	};

	const handleRemoveContent = (index: number) => {
		const newContents = [...formData.contents];
		newContents.splice(index, 1);
		setFormData({ ...formData, contents: newContents });
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setFormData({
				...formData,
				image: file,
				bannerImageType: file.type,
				bannerImageName: file.name,
			});
		}
	};

	const handleSubmit = async () => {
		if (
			!formData.topic ||
			!formData.school ||
			!formData.subject ||
			!formData.grade_id
		) {
			alert("Pastikan semua field wajib terisi!");
			return;
		}

		const data = new FormData();
		
		// Method spoofing untuk PUT
		data.append("_method", "PUT");
		
		data.append("id", formData.id || "");
		data.append("creator_id", formData.creator_id || "");
		data.append("topic", formData.topic || "");
		data.append("school", formData.school || "");
		data.append("subject", formData.subject || "");
		data.append("duration", formData.duration || "");
		data.append("grade_id", formData.grade_id || "");
		data.append("type", formData.type || "");
		data.append("description", formData.description || "");

		// contents - hanya kirim content yang ada perubahan atau baru
		let contentIndex = 0;
		formData.contents.forEach((content) => {
			console.log(`Processing content:`, content);
			
			// Skip content yang tidak ada perubahan (ada ID, tidak ada file baru)
			if (content.id && !content.file && content.type === "file") {
				console.log(`Skipping unchanged file content with ID: ${content.id}`);
				return; // Skip, tidak kirim ke backend
			}
			
			if (content.id) {
				data.append(`contents[${contentIndex}][id]`, String(content.id));
			}
			
			if (content.type === "file") {
				data.append(`contents[${contentIndex}][name]`, content.name || "");
				data.append(`contents[${contentIndex}][format_doc]`, "File");
				
				// Hanya kirim jika ada file baru
				if (content.file) {
					console.log(`Sending new file for content ${contentIndex}`);
					data.append(`contents[${contentIndex}][file]`, content.file);
					contentIndex++;
				}
			} else if (content.type === "youtube") {
				data.append(`contents[${contentIndex}][name]`, content.name || "Video YouTube");
				data.append(`contents[${contentIndex}][format_doc]`, "Youtube");
				data.append(`contents[${contentIndex}][url]`, content.youtube_url || content.url || "");
				contentIndex++;
			}
		});

		if (formData.image && !formData.image.startsWith("http")) {
			data.append("image", formData.image, formData.bannerImageName || "");
		}

		setLoading(true);

		try {
			const token = localStorage.getItem("access_token");
			
			if (!token) {
				alert("Sesi login habis. Silakan login ulang.");
				return;
			}

			const response = await axios.post(
				`https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
				data,
				{
					headers: {
						"Authorization": `Bearer ${token}`,
						// Jangan set Content-Type, biarkan axios yang handle untuk FormData
					},
				},
			);

			if (response.data) {
				alert("Perangkat ajar berhasil diupdate!");
				router.push("/perangkat-ajar");
			} else {
				alert(response.data.message || "Gagal menyimpan data");
			}
		} catch (error: any) {
			console.error("Error submitting data:", error);
			alert(
				error.response?.data?.message || 
				error.response?.data?.error?.join(", ") ||
					"Terjadi kesalahan saat menyimpan data.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isDataLoaded) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-xl">Loading data...</p>
			</div>
		);
	}

	return (
		<div className="pt-[5.21rem] p-6 bg-white min-h-screen">
			<TopBar withBackButton>Tambah Perangkat Ajar</TopBar>
			<div className="space-y-4">
				<div>
					<label className="block mb-2 text-sm font-medium">Topik</label>
					<input
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Masukkan topik"
						value={formData.topic}
						onChange={(e) =>
							setFormData({ ...formData, topic: e.target.value })
						}
					/>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Sekolah</label>
					<input
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Masukkan nama sekolah"
						value={formData.school}
						onChange={(e) =>
							setFormData({ ...formData, school: e.target.value })
						}
					/>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">
						Mata Pelajaran
					</label>
					<input
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Masukkan mata pelajaran"
						value={formData.subject}
						onChange={(e) =>
							setFormData({ ...formData, subject: e.target.value })
						}
					/>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Tipe</label>
					<select
						className="w-full p-2 border rounded"
						value={formData.type}
						onChange={(e) =>
							setFormData({ ...formData, type: e.target.value })
						}>
						<option value="">Pilih Tipe</option>
						{typeOptions.map((type, index) => (
							<option
								key={index}
								value={type}>
								{cekDanUbahType(type)}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Durasi</label>
					<input
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Masukkan durasi"
						value={formData.duration}
						onChange={(e) =>
							setFormData({ ...formData, duration: e.target.value })
						}
					/>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Kelas</label>
					<select
						className="w-full p-2 border rounded"
						value={formData.grade_id}
						onChange={(e) =>
							setFormData({ ...formData, grade_id: e.target.value })
						}>
						<option value="">Pilih Kelas</option>
						{grades.map((grade) => (
							<option
								key={grade.id}
								value={grade.id}>
								{grade.description}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Deskripsi</label>
					<textarea
						className="w-full p-2 border rounded"
						placeholder="Masukkan deskripsi"
						value={formData.description}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
					/>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">Gambar</label>
					<input
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>

					{formData.image && (
						<img
							src={formData.image}
							alt="Preview"
							className="mt-2"
						/>
					)}
					{formData.image && (
						<div className="mt-2">
							<p className="text-sm text-gray-500">
								{formData.bannerImageName}
							</p>
						</div>
					)}
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-700">Konten</label>
					{formData.contents.map((content, index) => (
						<div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
							{/* Dropdown Tipe Konten */}
							<div>
								<label className="block mb-1 text-xs font-medium text-gray-600">
									Tipe Konten
								</label>
								<select
									className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] bg-white text-sm"
									value={content.type}
									onChange={(e) =>
										handleContentTypeChange(index, e.target.value as "file" | "youtube")
									}
								>
									<option value="file">File</option>
									<option value="youtube">YouTube</option>
								</select>
							</div>

							{/* Input Nama Konten */}
							<div>
								<label className="block mb-1 text-xs font-medium text-gray-600">
									Nama Konten
								</label>
								<input
									type="text"
									className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] text-sm"
									placeholder={content.type === "file" ? "Contoh: Materi Word" : "Contoh: Video Pembahasan"}
									value={content.name}
									onChange={(e) => handleContentNameChange(index, e.target.value)}
								/>
							</div>

							{/* Input berdasarkan tipe */}
							{content.type === "file" ? (
								<div className="space-y-2">
									<label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm inline-block">
										Pilih File
										<input
											type="file"
											accept="*"
											className="hidden"
											onChange={(e) => handleContentFileChange(index, e)}
										/>
									</label>
									<span className="text-sm text-gray-600 ml-3">
										{content.file ? content.file.name : (content.url ? "File sudah ada" : "Tidak ada file")}
									</span>

									{/* Preview File Baru */}
									{content.file && content.previewUrl && (
										<div className="mt-3 border-2 border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
											<div 
												className="p-3 bg-blue-100"
											>
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 flex items-center justify-center bg-white rounded text-2xl flex-shrink-0">
														{getFileIcon(content.file.name)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-800 truncate">{content.file.name}</p>
														<p className="text-xs text-gray-500 mt-1">
															{(content.file.size / 1024).toFixed(2)} KB
														</p>
													</div>
												</div>
											</div>

											{isImageFile(content.file.name) ? (
												<div className="p-3 bg-white">
													<img 
														src={content.previewUrl} 
														alt="Preview" 
														className="w-full max-h-64 object-contain rounded"
													/>
												</div>
											) : isPdfFile(content.file.name) ? (
												<div className="bg-white">
													<iframe
														src={content.previewUrl}
														className="w-full h-96 border-0"
														title="PDF Preview"
													/>
												</div>
											) : null}
										</div>
									)}

									{/* Preview File Lama dari Server */}
									{!content.file && content.url && (
										<div className="mt-3 border-2 border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
											<div 
												className="p-3 cursor-pointer hover:bg-gray-100 transition"
												onClick={() => handleOpenPreview(content)}
											>
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 flex items-center justify-center bg-white rounded text-2xl">
														{getFileIcon(content.url)}
													</div>
													<div className="flex-1">
														<p className="text-sm font-medium text-gray-800">{content.name || "File"}</p>
														<p className="text-xs text-gray-600 mt-1">
															Klik untuk lihat file
														</p>
													</div>
												</div>
											</div>

											{/* Preview untuk file Office menggunakan Google Docs Viewer */}
											{isOfficeFile(content.url) && (
												<div className="bg-white">
													<iframe
														src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFullUrl(content.url))}&embedded=true`}
														className="w-full h-96 border-0"
														title="Office File Preview"
													/>
												</div>
											)}

											{/* Preview untuk PDF */}
											{isPdfFile(content.url) && (
												<div className="bg-white">
													<iframe
														src={getFullUrl(content.url)}
														className="w-full h-96 border-0"
														title="PDF Preview"
													/>
												</div>
											)}
										</div>
									)}
								</div>
							) : (
								<div className="space-y-2">
									<label className="block mb-1 text-xs font-medium text-gray-600">
										URL YouTube
									</label>
									<input
										type="url"
										className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] text-sm"
										placeholder="https://www.youtube.com/watch?v=..."
										value={content.youtube_url || content.url || ""}
										onChange={(e) => handleContentYoutubeChange(index, e.target.value)}
									/>

									{/* Preview YouTube */}
									{(content.youtube_url || content.url) && (
										<div className="mt-3 border-2 border-red-200 rounded-lg bg-red-50 overflow-hidden">
											<div 
												className="p-3 cursor-pointer hover:bg-red-100 transition"
												onClick={() => handleOpenPreview(content)}
											>
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 flex items-center justify-center bg-white rounded text-2xl flex-shrink-0">
														🎥
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-800">Video YouTube</p>
														<p className="text-xs text-gray-500 mt-1 truncate">
															{content.youtube_url || content.url}
														</p>
														<p className="text-xs text-red-600 mt-1">
															Klik untuk buka di YouTube
														</p>
													</div>
												</div>
											</div>

											{getYoutubeEmbedUrl(content.youtube_url || content.url || '') && (
												<div className="bg-white p-3">
													<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
														<iframe
															src={getYoutubeEmbedUrl(content.youtube_url || content.url || '') || ''}
															className="absolute top-0 left-0 w-full h-full rounded"
															title="YouTube Preview"
															frameBorder="0"
															allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
															allowFullScreen
														/>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							)}

							{/* Tombol Hapus */}
							<button
								onClick={() => handleRemoveContent(index)}
								className="w-full px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
							>
								Hapus
							</button>
						</div>
					))}
					<button
						onClick={handleAddContent}
						className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
					>
						Tambah Konten
					</button>
				</div>
				<div>
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="w-full px-4 py-2 bg-green-500 text-white rounded mt-4">
						{loading ? "Menyimpan..." : "Simpan"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditPerangkatAjar;
