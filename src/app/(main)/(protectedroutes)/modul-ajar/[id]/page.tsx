"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Dummy data untuk detail (fallback)
const DUMMY_DETAIL = {
	id: "modul-1",
	topic: "Implementasi Fikih Mu'amalah",
	type: "Materi ajar & RPP",
	category: "Kegiatan Intrakurikuler",
	grade: { id: 4, description: "Kelas 10" },
	subject: "Pendidikan Agama Islam dan Budi Pekerti",
	fase: "Fase E",
	image: "/img/thumbnailmodul.png",
	created_at: "2025-12-10",
	downloads: 89,
	likes_count: 85,
	description: "Penerapan prinsip-prinsip syariat Islam dalam seluruh aspek interaksi sosial dan transaksi ekonomi antarmanusia",
	about: "Ajak Murid memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial).",
	tujuan: "Memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial).",
	atp_link: "#",
	user_id: 1,
	user: { 
		id: 1, 
		name: "Ardianita S.Pd", 
		avatar: null,
		school: "SMA Negeri 1 Boja"
	},
	contents: [
		{ id: 1, name: "Fikih Mu'amalah", format_doc: "Pdf", size: "321 KB", url: "/files/ModulAjar.pdf" },
		{ id: 2, name: "Fikih Mu'amalah", format_doc: "Pdf", size: "321 KB", url: "/files/ModulAjar.pdf" },
		{ id: 3, name: "Fikih Mu'amalah", format_doc: "Pdf", size: "321 KB", url: "/files/ModulAjar.pdf" },
	]
};

const DetailModulAjarPage: React.FC = () => {
	const { id: materialId } = useParams();
	const router = useRouter();
	const { auth: user } = useAuth();
	
	// API URL with fallback
	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL2 || '';
	
	const [materialData, setMaterialData] = useState<any>(null);
	const [contents, setContents] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likesCount, setLikesCount] = useState<number>(0);
	const [downloading, setDownloading] = useState<boolean>(false);
	const [showAllFiles, setShowAllFiles] = useState<boolean>(false);
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

	useEffect(() => {
		const fetchMaterialData = async () => {
			if (!materialId) return;

			// If no API URL, use dummy data directly
			if (!API_URL) {
				setMaterialData(DUMMY_DETAIL);
				setContents(DUMMY_DETAIL.contents);
				setLikesCount(DUMMY_DETAIL.likes_count);
				setLoading(false);
				return;
			}

			try {
				const response = await axios.get(
					`${API_URL}/api/bahanajar/${materialId}`,
				);
				setMaterialData(response.data.data);
				setContents(response.data.data.contents || []);
				setLikesCount(response.data.data.likes_count || 0);
				setIsLiked(response.data.data.is_liked || false);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching material data:", error);
				// Use dummy data as fallback
				setMaterialData(DUMMY_DETAIL);
				setContents(DUMMY_DETAIL.contents);
				setLikesCount(DUMMY_DETAIL.likes_count);
				setLoading(false);
			}
		};

		fetchMaterialData();
	}, [materialId, API_URL]);

	const handleLike = async () => {
		if (!user) {
			showToast('Silakan login terlebih dahulu', 'error');
			return;
		}

		// Save previous state for rollback
		const previousIsLiked = isLiked;
		const previousLikesCount = likesCount;
		const willLike = !isLiked; // This is the new state

		// Optimistic update
		setIsLiked(willLike);
		setLikesCount(willLike ? likesCount + 1 : likesCount - 1);

		// If API URL is not configured, just keep the optimistic update
		if (!API_URL) {
			showToast(willLike ? 'Berhasil menyukai' : 'Batal menyukai', 'success');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await axios.post(
				`${API_URL}/api/bahanajar/${materialId}/like`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log('Like response:', response.data);
			showToast(willLike ? 'Berhasil menyukai' : 'Batal menyukai', 'success');
		} catch (error) {
			console.error('Error liking material:', error);
			// Keep optimistic update even on error for demo purposes
			showToast(willLike ? 'Berhasil menyukai' : 'Batal menyukai', 'success');
		}
	};

	const handleDownload = async (content?: any) => {
		setDownloading(true);
		
		// Try to track download in API (optional, don't block download if it fails)
		if (API_URL) {
			try {
				const token = localStorage.getItem('token');
				await axios.post(
					`${API_URL}/api/bahanajar/${materialId}/download`,
					{},
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
					}
				);
			} catch (error) {
				console.log('API tracking skipped:', error);
			}
		}

		// Download file if URL exists
		try {
			if (content?.url) {
				const fileUrl = content.url.startsWith('http') 
					? content.url 
					: content.url.startsWith('/') 
						? content.url 
						: `/${content.url}`;

				// Create a temporary link and trigger download
				const link = document.createElement('a');
				link.href = fileUrl;
				link.download = content.name || 'download';
				link.target = '_blank';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				
				showToast('File sedang diunduh', 'success');
			} else {
				showToast('URL file tidak ditemukan', 'error');
			}
		} catch (error) {
			console.error("Error downloading:", error);
			showToast('Gagal mengunduh file', 'error');
		} finally {
			setDownloading(false);
		}
	};

	// Download all files from Materi and Asesmen as a single ZIP
	const handleDownloadAll = async () => {
		setDownloading(true);
		
		// Try to track download in API (optional)
		if (API_URL) {
			try {
				const token = localStorage.getItem('token');
				await axios.post(
					`${API_URL}/api/bahanajar/${materialId}/download`,
					{},
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
					}
				);
			} catch (error) {
				console.log('API tracking skipped:', error);
			}
		}

		// Create ZIP file with all documents
		try {
			if (contents && contents.length > 0) {
				showToast(`Menyiapkan ${contents.length} file...`, 'success');
				
				const zip = new JSZip();
				const moduleName = materialData?.topic || 'Modul-Ajar';
				
				// Create folders for organization
				const materiFolder = zip.folder("Materi");
				const asesmenFolder = zip.folder("Asesmen");
				
				// Fetch and add each file to the ZIP
				for (let i = 0; i < contents.length; i++) {
					const content = contents[i];
					if (content?.url) {
						const fileUrl = content.url.startsWith('http') 
							? content.url 
							: content.url.startsWith('/') 
								? content.url 
								: `/${content.url}`;
						
						try {
							// Fetch the file as blob
							const response = await fetch(fileUrl);
							const blob = await response.blob();
							
							// Determine file extension
							const fileName = content.name || `file-${i + 1}`;
							const extension = content.format_doc?.toLowerCase() || 'pdf';
							const fullFileName = fileName.endsWith(`.${extension}`) 
								? fileName 
								: `${fileName}.${extension}`;
							
							// Add to appropriate folder (first half to Materi, second half to Asesmen)
							if (i < Math.ceil(contents.length / 2)) {
								materiFolder?.file(fullFileName, blob);
							} else {
								asesmenFolder?.file(fullFileName, blob);
							}
						} catch (fetchError) {
							console.error(`Error fetching file ${content.name}:`, fetchError);
						}
					}
				}
				
				// Generate and download the ZIP file
				const zipBlob = await zip.generateAsync({ type: "blob" });
				const zipFileName = `${moduleName.replace(/[^a-zA-Z0-9]/g, '_')}_Perangkat_Ajar.zip`;
				saveAs(zipBlob, zipFileName);
				
				showToast('Semua file berhasil diunduh dalam satu paket!', 'success');
			} else {
				showToast('Tidak ada file untuk diunduh', 'error');
			}
		} catch (error) {
			console.error("Error creating ZIP file:", error);
			showToast('Gagal membuat paket unduhan', 'error');
		} finally {
			setDownloading(false);
		}
	};

	const handleShare = async () => {
		const shareUrl = `${window.location.origin}/modul-ajar/${materialId}`;
		const shareText = `Lihat modul ajar "${materialData?.topic}" di AGPAII Digital`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: materialData?.topic || 'Modul Ajar',
					text: shareText,
					url: shareUrl,
				});
				showToast('Berhasil membagikan', 'success');
			} catch (error: any) {
				// User cancelled or error occurred
				if (error.name !== 'AbortError') {
					console.error("Error sharing:", error);
					// Fallback to clipboard
					copyToClipboard(shareUrl);
				}
			}
		} else {
			// Fallback for browsers that don't support Web Share API
			copyToClipboard(shareUrl);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			showToast('Link berhasil disalin!', 'success');
		} catch (error) {
			console.error('Error copying to clipboard:', error);
			showToast('Gagal menyalin link', 'error');
		}
	};

	const showToast = (message: string, type: 'success' | 'error') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-white">
				<div className="text-xl text-gray-500">Loading...</div>
			</div>
		);
	}

	if (!materialData) {
		return (
			<div className="flex flex-col justify-center items-center h-screen bg-white">
				<div className="text-xl text-gray-600 mb-4">Modul tidak ditemukan</div>
				<button
					onClick={() => router.push("/modul-ajar")}
					className="px-4 py-2 bg-[#006557] text-white rounded-lg">
					Kembali
				</button>
			</div>
		);
	}

	const displayedContents = showAllFiles ? contents : contents.slice(0, 3);

	return (
		<div className="bg-white min-h-screen pt-[5.21rem] pb-28">
			{/* Toast Notification */}
			{toast && (
				<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
					<div className={`px-6 py-3 rounded-lg shadow-lg ${
						toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					} text-white font-medium`}>
						{toast.message}
					</div>
				</div>
			)}

			{/* TopBar */}
			<TopBar withBackButton>
				<div className="flex flex-col">
					<span className="text-sm font-medium line-clamp-1">{materialData.subject || "Pendidikan Agama Islam dan Budi Pekerti"}</span>
					<span className="text-xs opacity-80">{materialData.fase || "Fase E"} - {materialData.grade?.description || "Kelas 10"}</span>
				</div>
			</TopBar>

			<div className="px-4 py-4">
				{/* Category Badge */}
				<span className="inline-block bg-[#006557] text-white text-xs px-3 py-1.5 rounded-full mb-4">
					{materialData.category || "Kegiatan Intrakurikuler"}
				</span>

				{/* Header Section */}
				<div className="flex gap-4 mb-6">
					<div className="flex-1">
						<h1 className="text-xl font-bold text-gray-900 mb-2">
							{materialData.topic}
						</h1>
						<p className="text-sm text-gray-600 leading-relaxed">
							{materialData.description}
						</p>
					</div>
					<div className="flex-shrink-0">
						<img
							src={materialData.image?.startsWith('/') ? materialData.image : `${process.env.NEXT_PUBLIC_MITRA_URL}/public/${materialData.image}`}
							alt={materialData.topic}
							className="w-24 h-32 object-cover rounded-lg"
							onError={(e) => {
								(e.target as HTMLImageElement).src = '/img/thumbnailmodul.png';
							}}
						/>
					</div>
				</div>

				{/* Author Section */}
				<div className="flex items-center gap-3 mb-6">
					<img
						src={materialData.user?.avatar 
							? `${process.env.NEXT_PUBLIC_MITRA_URL}/public/${materialData.user.avatar}`
							: "https://avatar.iran.liara.run/public"
						}
						alt={materialData.user?.name}
						className="w-10 h-10 rounded-full object-cover"
					/>
					<div>
						<p className="font-semibold text-gray-900">{materialData.user?.name || "Ardianita S.Pd"}</p>
						<p className="text-sm text-gray-500">{materialData.user?.school || "SMA Negeri 1 Boja"}</p>
					</div>
				</div>

				{/* Pilihan Guru Badge */}
				<div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
							<img src="/svg/ikon guru.svg" alt="Pilihan Guru" className="w-8 h-8" />
						</div>
						<p className="text-sm text-gray-700">
							Salah satu perangkat ajar yang paling disukai<br/>
							di AGPAII Digital, menurut pengajar.
						</p>
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold text-[#006557]">{likesCount}</p>
						<p className="text-xs text-gray-500">Menyukai</p>
					</div>
				</div>

				{/* Tentang Perangkat Ajar */}
				<div className="mb-6">
					<h2 className="text-lg font-bold text-gray-900 mb-3">Tentang Perangkat Ajar</h2>
					<p className="text-sm text-gray-600 leading-relaxed">
						{materialData.about || materialData.description || "Ajak Murid memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial)."}
					</p>
			</div>

			{/* Tujuan dan Alur */}
			<div className="mb-6">
				<h2 className="text-lg font-bold text-gray-900 mb-3">Tujuan dan Alur Tujuan Pembelajaran</h2>
				<p className="text-sm text-gray-600 leading-relaxed mb-3">
					"{materialData.tujuan || "Memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial)."}"
				</p>
				<button 
					onClick={() => window.open("/files/SMP.D.ISL.MUA.1.pdf", "_blank")}
					className="flex items-center gap-2 text-[#006557] text-sm font-medium hover:underline">
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
					</svg>
					Lihat dokumen ATP (Alur Tujuan Pembelajaran)
				</button>
			</div>

			{/* Stats Section */}
			<div className="flex gap-4 mb-6">
				<div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
					<div className="flex items-center justify-center gap-2 mb-1">
						<svg className="w-5 h-5 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
						</svg>
						<span className="text-2xl font-bold text-[#006557]">{likesCount}</span>
					</div>
					<p className="text-xs text-gray-500">Menyukai</p>
				</div>
				<div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
					<div className="flex items-center justify-center gap-2 mb-1">
						<svg className="w-5 h-5 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span className="text-2xl font-bold text-[#006557]">{materialData.downloads || 89}</span>
					</div>
					<p className="text-xs text-gray-500">Diunduh</p>
				</div>
			</div>

			{/* Materi Section */}
			<div className="mb-6">
				<h2 className="text-lg font-bold text-gray-900 mb-3">Materi</h2>
				<p className="text-sm text-gray-600 mb-4">
					Materi Pembelajaran yang mencakup fikih mu'amalah, al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial).
				</p>
				
				{/* Materi File List */}
				<div className="space-y-3">
					{displayedContents.map((content: any, index: number) => (
						<div
							key={`materi-${content.id || index}`}
							className="flex items-center gap-3 p-2 rounded-lg">
							<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium text-[#006557]">Materi - {content.name}</p>
								<p className="text-xs text-gray-400">{content.size || "842.08 KB"}</p>
							</div>
							{/* Eye/View Button */}
							<button
								onClick={() => handleDownload(content)}
								className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors">
								<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							</button>
						</div>
					))}
				</div>

				{/* Show More Button */}
				{contents.length > 3 && (
					<button 
						onClick={() => setShowAllFiles(!showAllFiles)}
						className="flex items-center justify-center w-full mt-3 text-gray-400">
						<svg 
							className={`w-6 h-6 transition-transform ${showAllFiles ? 'rotate-180' : ''}`} 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				)}
			</div>

			{/* Asesmen Section */}
			<div className="mb-6">
				<h2 className="text-lg font-bold text-gray-900 mb-3">Asesmen</h2>
				<p className="text-sm text-gray-600 mb-4">
					Instrumen penilaian untuk mengukur pemahaman peserta didik terhadap materi yang telah dipelajari.
				</p>
				
				{/* Asesmen File List */}
				<div className="space-y-3">
					{displayedContents.map((content: any, index: number) => (
						<div
							key={`asesmen-${content.id || index}`}
							className="flex items-center gap-3 p-2 rounded-lg">
							<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium text-[#006557]">Asesmen - {content.name}</p>
								<p className="text-xs text-gray-400">{content.size || "842.08 KB"}</p>
							</div>
							{/* Eye/View Button */}
							<button
								onClick={() => handleDownload(content)}
								className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors">
								<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Additional Info */}
			<p className="text-sm text-gray-600 mb-6">
				Peserta didik diminta mengisi lembar penilaian diri dengan cara membubuhkan tanda centang (✓) pada kolom yang sesuai.
			</p>

				{/* CTA Banner */}
				<div className="bg-[#006557] rounded-2xl p-4 flex items-center gap-4 mb-6">
					<div className="flex-1">
						<h3 className="text-white font-bold text-lg mb-1">
							Merasa Terbantu Dengan<br/>Perangkat Ajar ini?
						</h3>
						<p className="text-white/80 text-sm">Beri tanda suka</p>
					</div>
					<img 
						src="/img/image-12.png" 
						alt="Mascot" 
						className="w-24 h-24 object-contain"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
						}}
					/>
				</div>
			</div>

			{/* Fixed Bottom Action Bar */}
			<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-[480px] mx-auto">
				<div className="flex items-center gap-3">
					{/* Share Button */}
					<button
						onClick={handleShare}
						className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl">
						<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
					</button>

					{/* Like Button */}
					<button
						onClick={handleLike}
						className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-colors ${
							isLiked ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
						}`}>
						<svg 
							className={`w-5 h-5 ${isLiked ? 'text-blue-500' : 'text-gray-600'}`} 
							fill={isLiked ? "currentColor" : "none"} 
							stroke="currentColor" 
							viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
						</svg>
					</button>

					{/* Download Button */}
					<button
						onClick={() => handleDownloadAll()}
						disabled={downloading}
						className="flex-1 py-3 bg-[#006557] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						{downloading ? "Mengunduh..." : "Unduh Perangkat Ajar"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DetailModulAjarPage;
