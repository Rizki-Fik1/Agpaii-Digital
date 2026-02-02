"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api/config";
import TopBar from "@/components/nav/topbar";

interface Credential {
	id: string;
	name: string;
	nik: string;
	nip: string;
	birthdate: string;
	gender: string;
	contact: string;
	educational_level_id: string;
	unit_kerja: string;
	headmaster_name: string;
	headmaster_nip: string;
	school_place: string;
	school_status: string;
}

const PartnerConfirmData: React.FC = () => {
	const router = useRouter();
	const { id: mitraId } = useParams();

	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingEdu, setIsLoadingEdu] = useState(true);
	const [eduLevel, setEduLevel] = useState<{ id: string; name: string }[]>([]);
	const [credential, setCredential] = useState<Credential>({
		id: "",
		name: "",
		nik: "",
		nip: "",
		birthdate: "",
		gender: "",
		contact: "",
		educational_level_id: "",
		unit_kerja: "",
		headmaster_name: "",
		headmaster_nip: "",
		school_place: "",
		school_status: "",
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await API.get("/me"); // Sesuaikan endpoint API
				const userData = response.data.profile;

				setCredential({
					id: response.data.id,
					name: response.data.name,
					nik: userData.nik || "",
					nip: userData.nip || "",
					birthdate: userData.birthdate || "",
					gender: userData.gender || "",
					contact: userData.contact || "",
					educational_level_id: userData.educational_level_id || "",
					unit_kerja: userData.unit_kerja || "",
					headmaster_name: userData.headmaster_name || "",
					headmaster_nip: userData.headmaster_nip || "",
					school_place: userData.school_place || "",
					school_status: userData.school_status || "",
				});

				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching user data:", error);
				setIsLoading(false);
			}
		};

		const fetchEducationLevels = async () => {
			try {
				const response = await API.get("/educational-level"); // Sesuaikan endpoint API
				setEduLevel(response.data);
				setIsLoadingEdu(false);
			} catch (error) {
				console.error("Error fetching education levels:", error);
				setIsLoadingEdu(false);
			}
		};

		fetchUserData();
		fetchEducationLevels();
	}, []);

	const handleSave = async () => {
		try {
			const postData = {
				user_id: credential.id,
				mitra_id: mitraId,
				nama: credential.name,
				nik: credential.nik,
				tanggal_lahir: credential.birthdate,
				jenis_kelamin: credential.gender,
				no_hp: credential.contact,
				education_level_id: credential.educational_level_id,
				tempat_tugas: credential.school_place,
			};

			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/mitra/savemitra`,
				postData,
			);
			console.log("Data berhasil disimpan:", response.data);

			router.back();
		} catch (error: any) {
			setErrorMessage(
				error.response ? error.response.data.message : error.message,
			);
		}
	};

	const closeModal = () => {
		setErrorMessage(null);
	};



	return (
		<div className="p-6 bg-white min-h-screen">
			{/* Modal for Error */}
			{errorMessage && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
					<div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
						<h2 className="text-lg font-bold text-red-500 mb-4">Error</h2>
						<p className="text-gray-700 mb-4">{errorMessage}</p>
						<button
							className="bg-red-500 text-white px-4 py-2 rounded"
							onClick={closeModal}>
							Close
						</button>
					</div>
				</div>
			)}
			<TopBar withBackButton>Data Diri</TopBar>
			<h1 className="text-xl font-bold mb-4">Cek Data Diri Anda</h1>
			<p className="mb-6 text-gray-600">
				Jika ada data yang tidak sesuai, dapat Anda edit terlebih dahulu di
				bagian profile.
			</p>

			<form>
				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">Nama</label>
					<input
						type="text"
						value={credential.name}
						onChange={(e) =>
							setCredential({ ...credential, name: e.target.value })
						}
						className="w-full border rounded px-4 py-2"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">NIK</label>
					<input
						type="text"
						value={credential.nik}
						onChange={(e) =>
							setCredential({ ...credential, nik: e.target.value })
						}
						className="w-full border rounded px-4 py-2"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">Tanggal Lahir</label>
					<input
						type="date"
						value={moment(credential.birthdate).format("YYYY-MM-DD")}
						onChange={(e) =>
							setCredential({ ...credential, birthdate: e.target.value })
						}
						className="w-full border rounded px-4 py-2"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">Jenis Kelamin</label>
					<select
						value={credential.gender}
						onChange={(e) =>
							setCredential({ ...credential, gender: e.target.value })
						}
						className="w-full border rounded px-4 py-2">
						<option value="">Pilih Jenis Kelamin</option>
						<option value="L">Laki-laki</option>
						<option value="P">Perempuan</option>
					</select>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">No. HP</label>
					<input
						type="text"
						value={credential.contact}
						onChange={(e) =>
							setCredential({ ...credential, contact: e.target.value })
						}
						className="w-full border rounded px-4 py-2"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">Jenjang Ajar</label>
					{isLoadingEdu ? (
						<div>Loading...</div>
					) : (
						<select
							value={credential.educational_level_id}
							onChange={(e) =>
								setCredential({
									...credential,
									educational_level_id: e.target.value,
								})
							}
							className="w-full border rounded px-4 py-2">
							<option value="">Pilih Jenjang Ajar</option>
							{eduLevel.map((level) => (
								<option
									key={level.id}
									value={level.id}>
									{level.name}
								</option>
							))}
						</select>
					)}
				</div>

				<div className="mb-4">
					<label className="block text-sm font-bold mb-2">Tempat Tugas</label>
					<input
						type="text"
						value={credential.school_place}
						onChange={(e) =>
							setCredential({ ...credential, school_place: e.target.value })
						}
						className="w-full border rounded px-4 py-2"
					/>
				</div>

				<button
					type="button"
					onClick={handleSave}
					className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full">
					Simpan
				</button>
			</form>
		</div>
	);
};

export default PartnerConfirmData;
