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
	name: string;
	value: string;
	format_doc: string;
	url: string;
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
		const loadMaterialData = async () => {
			if (!materialId) return;

			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/bahanajar/${materialId}`,
				);
				console.log(response.data.data);
				const material = response.data.data; // Periksa struktur data API
				setFormData({
					id: material.id || null,
					topic: material.topic || "",
					school: material.school || "",
					subject: material.subject || "",
					duration: material.duration || "",
					grade_id: material.grade_id || "",
					type: material.type || "",
					description: material.description || "",
					contents: material.contents || [],
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
				setIsDataLoaded(true); // Tetap tampilkan form meskipun gagal
			}
		};

		loadMaterialData();
	}, [materialId, user?.id]);

	const handleAddContent = () => {
		setFormData((prev) => ({
			...prev,
			contents: [
				...prev.contents,
				{ name: "", value: "", format_doc: "Pdf", url: "" },
			],
		}));
	};

	const handleContentChange = (
		index: number,
		field: keyof Content,
		value: string,
	) => {
		const newContents = [...formData.contents];
		newContents[index][field] = value;
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

		data.append("id", formData.id || "");
		data.append("creator_id", formData.creator_id || "");
		data.append("topic", formData.topic || "");
		data.append("school", formData.school || "");
		data.append("subject", formData.subject || "");
		data.append("duration", formData.duration || "");
		data.append("grade_id", formData.grade_id || "");
		data.append("type", formData.type || "");
		data.append("description", formData.description || "");

		formData.contents.forEach((content, index) => {
			data.append(`contents[id][${index}]`, content.id ? content.id : "");
			data.append(`contents[name][${index}]`, content.name || "");
			data.append(`contents[value][${index}]`, content.value || "");
			data.append(`contents[format_doc][${index}]`, content.format_doc || "");
			data.append(`contents[url][${index}]`, content.url || "");
		});

		if (formData.image && !formData.image.startsWith("http")) {
			data.append("image", formData.image, formData.bannerImageName || "");
		}

		setLoading(true);

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_MITRA_URL}/api/bahanajar`,
				data,
				{
					headers: {
						"Accept": "application/json",
						"Content-Type": "multipart/form-data",
					},
				},
			);

			if (response.data.success) {
				router.push("/perangkat-ajar");
			} else {
				alert(response.data.message || "Gagal menyimpan data");
			}
		} catch (error: any) {
			console.error("Error submitting data:", error);
			alert(
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
					<label className="block mb-2 text-sm font-medium">Konten</label>
					{formData.contents.map((content, index) => (
						<div
							key={index}
							className="mb-4 p-4 border rounded space-y-2">
							<input
								type="text"
								placeholder="Nama Konten"
								className="w-full p-2 border rounded"
								value={content.name}
								onChange={(e) =>
									handleContentChange(index, "name", e.target.value)
								}
							/>
							<input
								type="text"
								placeholder="Nilai Konten"
								className="w-full p-2 border rounded"
								value={content.value}
								onChange={(e) =>
									handleContentChange(index, "value", e.target.value)
								}
							/>
							<select
								className="w-full p-2 border rounded"
								value={content.format_doc}
								onChange={(e) =>
									handleContentChange(index, "format_doc", e.target.value)
								}>
								<option value="Pdf">Pdf</option>
								<option value="Youtube">Youtube</option>
								<option value="Doc">Doc</option>
								<option value="PowerPoint">Power Point</option>
								<option value="Excel">Excel</option>
							</select>
							<input
								type="text"
								placeholder="URL Konten"
								className="w-full p-2 border rounded"
								value={content.url}
								onChange={(e) =>
									handleContentChange(index, "url", e.target.value)
								}
							/>
							<button
								onClick={() => handleRemoveContent(index)}
								className="px-4 py-2 bg-red-500 text-white rounded">
								Hapus
							</button>
						</div>
					))}
					<button
						onClick={handleAddContent}
						className="px-4 py-2 bg-blue-500 text-white rounded">
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
