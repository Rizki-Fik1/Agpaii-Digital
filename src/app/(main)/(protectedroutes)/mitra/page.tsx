"use client";
import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface KategoriMitraOption {
	id: string;
	kategori_mitra: string;
}

interface SubProgramOption {
	id: string;
	mitra: string;
}

const MitraPage: React.FC = () => {
	const router = useRouter();
	const [kategoriMitra, setKategoriMitra] = useState<string>("");
	const [kategoriMitraOptions, setKategoriMitraOptions] = useState<
		KategoriMitraOption[]
	>([]);
	const [subProgram, setSubProgram] = useState<string>("");
	const [subProgramOptions, setSubProgramOptions] = useState<
		SubProgramOption[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL2 || "";

	useEffect(() => {
		const fetchKategoriMitra = async () => {
			try {
				const response = await axios.get<{
					kategori_mitra: KategoriMitraOption[];
				}>(`${API_URL}/api/mitra`);
				setKategoriMitraOptions(response.data.kategori_mitra);
			} catch (error) {
				console.error("Error fetching kategori mitra:", error);
			}
		};

		fetchKategoriMitra();
	}, [API_URL]);

	useEffect(() => {
		if (kategoriMitra) {
			const fetchSubProgram = async () => {
				try {
					const response = await axios.get<{ mitra: SubProgramOption[] }>(
						`${API_URL}/api/mitra?kategori_mitra=${kategoriMitra}`,
					);
					setSubProgramOptions(response.data.mitra);
				} catch (error) {
					console.error("Error fetching sub program:", error);
				}
			};

			fetchSubProgram();
		} else {
			setSubProgramOptions([]);
		}
	}, [kategoriMitra, API_URL]);

	const handleNavigate = () => {
		const selectedMitra = subProgramOptions.find(
			(opt) => opt.id === subProgram,
		);
		router.push(`/mitra/${subProgram}`);
		// Navigate logic here, for example:
		// router.push(`/program?mitraId=${subProgram}&title=${selectedMitra?.mitra}`);
	};

	return (
		<div className="pt-[4.21rem] bg-white min-h-screen">
			<TopBar withBackButton>MITRA AGPAII</TopBar>
			<div className="p-6">
				<div className="mb-6">
					<img
						src="/img/partner-profile.png"
						alt="Mitra AGPAII"
						className="w-full h-[250px] object-cover rounded"
					/>
				</div>

				<p className="text-gray-600 text-sm mb-8">
					Mitra AGPAII adalah mitra strategis bagi para pendidik Pendidikan
					Agama Islam (PAI) di seluruh Indonesia. Kami hadir untuk mendukung
					guru dalam mencetak generasi berakhlak mulia, berwawasan luas, dan
					siap menghadapi tantangan zaman. Dengan semangat kebersamaan, kami
					percaya bahwa pendidikan adalah kunci untuk masa depan bangsa yang
					lebih baik. 🌟
				</p>

				<div className="mb-6">
					<label
						htmlFor="kategoriMitra"
						className="block text-sm font-bold mb-2">
						Kategori Mitra
					</label>
					<select
						id="kategoriMitra"
						value={kategoriMitra}
						onChange={(e) => setKategoriMitra(e.target.value)}
						className="w-full border border-green-500 rounded px-4 py-2">
						<option value="">Pilih Kategori Mitra</option>
						{kategoriMitraOptions.map((opt) => (
							<option
								key={opt.id}
								value={opt.id}>
								{opt.kategori_mitra}
							</option>
						))}
					</select>
				</div>

				<div className="mb-6">
					<label
						htmlFor="subProgram"
						className="block text-sm font-bold mb-2">
						Mitra
					</label>
					<select
						id="subProgram"
						value={subProgram}
						onChange={(e) => setSubProgram(e.target.value)}
						className="w-full border border-green-500 rounded px-4 py-2">
						<option value="">Pilih Mitra</option>
						{subProgramOptions.map((opt) => (
							<option
								key={opt.id}
								value={opt.id}>
								{opt.mitra}
							</option>
						))}
					</select>
				</div>

				<button
					onClick={handleNavigate}
					className={`w-full bg-green-500 text-white font-bold py-2 px-4 rounded ${
						isLoading ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={isLoading}>
					{isLoading ? "Harap Tunggu..." : "Selanjutnya"}
				</button>
			</div>
		</div>
	);
};

export default MitraPage;
