"use client";

import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import Modal from "@/components/modal/modal";
import Loader from "@/components/loader/loader";
import { useParams, useRouter } from "next/navigation";
import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useModal } from "@/utils/hooks/use_modal";
import { useInView } from "react-intersection-observer";
import clsx from "clsx";
import { toast } from "sonner";

// --- Dropdown Options ---
const EDUCATIONAL_LEVEL_OPTIONS = [
	{ name: "SD", value: 1 },
	{ name: "SMP", value: 2 },
	{ name: "SMA", value: 3 },
	{ name: "SMK", value: 4 },
	{ name: "TK", value: 5 },
	{ name: "SLB", value: 9 },
];

const SCHOOL_STATUS_OPTIONS = [
	{ name: "Negeri", value: "Negeri" },
	{ name: "Swasta", value: "Swasta" },
];

const GENDER_OPTIONS = [
	{ name: "Laki - laki", value: "L" },
	{ name: "Perempuan", value: "P" },
];

const PNS_STATUS_OPTIONS = [
	{ name: "PNS", value: 1 },
	{ name: "Non PNS", value: 0 },
];

// --- Tipe Data ---
interface UserProfile {
	id: number;
	user_id: number;
	nip: string | null;
	nik: string | null;
	contact: string;
	school_place: string;
	home_address: string;
	educational_level_id: number | null;
	unit_kerja: string | null;
	nama_kepala_satuan_pendidikan: string | null;
	nip_kepala_satuan_pendidikan: string | null;
	gender: string | null;
	birthdate: string;
	created_at: string;
	updated_at: string;
	province_id: number;
	city_id: number;
	district_id: number;
	short_bio: string | null;
	long_bio: string | null;
	headmaster_name: string | null;
	headmaster_nip: string | null;
	grade_id: number | null;
	school_status: string | null;
}

interface PnsStatus {
	id: number;
	user_id: number;
	is_pns: number;
	is_tpp_received: number;
	thr_tpg_2023_50: number;
	gaji_13_tpg_2023_50: number;
	thr_tpg_2024_100: number;
	gaji_13_tpg_2024_100: number;
	is_certification: number;
	is_non_pns_inpassing: number;
	non_pns_fee: number;
	salary: number;
	bank_account_no: string;
	bank_id: number;
	bank_name: string;
	employment_status: string;
	pendidikan: string;
	jurusan: string;
	kampus: string;
	pemasukan: string;
	pengeluaran: string;
	kepemilikan_rumah: string;
	created_at: string;
	updated_at: string;
}

interface User {
	id: number;
	kta_id: number | null;
	role_id: number;
	name: string;
	email: string;
	avatar: string;
	email_verified_at: string;
	user_activated_at: string;
	point: number;
	settings: any[];
	session_id: string | null;
	is_login_google: number;
	user_level: number;
	created_at: string;
	updated_at: string;
	expired_at: string;
	deleted_at: string | null;
	age: number;
	profile: UserProfile;
	pns_status?: PnsStatus;
}

interface EditableField {
	section: string;
	label: string;
	key: string;
	value: any;
	type?: "text" | "select" | "password";
	options?: { name: string; value: any }[];
}

// --- Komponen Utama DetailEditUser ---
const DetailEditUser: React.FC = () => {
	const { id } = useParams(); // misal /detail/123
	const router = useRouter();
	const queryClient = useQueryClient();
	const [userData, setUserData] = useState<User | null>(null);
	const [fieldSearch, setFieldSearch] = useState<string>("");
	const [saving, setSaving] = useState<boolean>(false);

	// State region untuk wilayah (dari profile)
	const [region, setRegion] = useState({
		province_id: "",
		city_id: "",
		district_id: "",
	});

	// Modal untuk pemilihan wilayah
	const { show: provinceModalShow, toggle: toggleProvinceModal } = useModal();
	const { show: cityModalShow, toggle: toggleCityModal } = useModal();
	const { show: districtModalShow, toggle: toggleDistrictModal } = useModal();

	// --- Fetch detail user ---
	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await API.get(`/users/detail/${id}`);
				setUserData(res.data);
				if (res.data.profile) {
					setRegion({
						province_id: res.data.profile.province_id || "",
						city_id: res.data.profile.city_id || "",
						district_id: res.data.profile.district_id || "",
					});
				}
			} catch (error) {
				console.error("Error fetching user details", error);
			}
		}
		fetchUser();
	}, [id]);

	// --- Editable Fields ---
	const editableFields: EditableField[] = useMemo(() => {
		if (!userData) return [];
		const fields: EditableField[] = [];
		// User fields
		fields.push({
			section: "User",
			label: "Nama User",
			key: "name",
			value: userData.name,
		});
		fields.push({
			section: "User",
			label: "Email",
			key: "email",
			value: userData.email,
		});
		// fields.push({
		// 	section: "User",
		// 	label: "Nomor KTA",
		// 	key: "kta_id",
		// 	value: userData.kta_id ?? "",
		// });
		// fields.push({
		// 	section: "User",
		// 	label: "Role ID",
		// 	key: "role_id",
		// 	value: userData.role_id,
		// });
		fields.push({
			section: "User",
			label: "Password",
			key: "password",
			value: "",
		});
		// Profile fields
		const prof = userData.profile;
		fields.push({
			section: "Profile",
			label: "NIP",
			key: "nip",
			value: prof.nip ?? "",
		});
		fields.push({
			section: "Profile",
			label: "NIK",
			key: "nik",
			value: prof.nik ?? "",
		});
		fields.push({
			section: "Profile",
			label: "Nomor HP",
			key: "contact",
			value: prof.contact,
		});
		fields.push({
			section: "Profile",
			label: "Tempat Sekolah",
			key: "school_place",
			value: prof.school_place,
		});
		// fields.push({
		// 	section: "Profile",
		// 	label: "Home Address",
		// 	key: "home_address",
		// 	value: prof.home_address,
		// });
		// Dropdown: Jenjang Ajar (Educational Level)
		fields.push({
			section: "Profile",
			label: "Jenjang Ajar",
			key: "educational_level_id",
			value: prof.educational_level_id ?? "",
			type: "select",
			options: EDUCATIONAL_LEVEL_OPTIONS,
		});
		fields.push({
			section: "Profile",
			label: "Unit Kerja",
			key: "unit_kerja",
			value: prof.unit_kerja ?? "",
		});
		fields.push({
			section: "Profile",
			label: "Nama Kepala Satuan Pendidikan",
			key: "nama_kepala_satuan_pendidikan",
			value: prof.nama_kepala_satuan_pendidikan ?? "",
		});
		fields.push({
			section: "Profile",
			label: "NIP Kepala Satuan Pendidikan",
			key: "nip_kepala_satuan_pendidikan",
			value: prof.nip_kepala_satuan_pendidikan ?? "",
		});
		// Dropdown: Jenis Kelamin
		fields.push({
			section: "Profile",
			label: "Jenis Kelamin",
			key: "gender",
			value: prof.gender ?? "",
			type: "select",
			options: GENDER_OPTIONS,
		});
		fields.push({
			section: "Profile",
			label: "Birthdate",
			key: "birthdate",
			value: prof.birthdate,
		});
		// Wilayah (province_id, city_id, district_id) dikelola via modal sehingga tidak dimasukkan di sini.
		fields.push({
			section: "Profile",
			label: "Long Bio",
			key: "long_bio",
			value: prof.long_bio ?? "",
		});
		// fields.push({
		// 	section: "Profile",
		// 	label: "Short Bio",
		// 	key: "short_bio",
		// 	value: prof.short_bio ?? "",
		// });
		fields.push({
			section: "Profile",
			label: "Headmaster Name",
			key: "headmaster_name",
			value: prof.headmaster_name ?? "",
		});
		fields.push({
			section: "Profile",
			label: "Headmaster NIP",
			key: "headmaster_nip",
			value: prof.headmaster_nip ?? "",
		});
		// fields.push({
		// 	section: "Profile",
		// 	label: "Grade ID",
		// 	key: "grade_id",
		// 	value: prof.grade_id ?? "",
		// });
		// Dropdown: Status Sekolah
		fields.push({
			section: "Profile",
			label: "Status Sekolah",
			key: "school_status",
			value: prof.school_status ?? "",
			type: "select",
			options: SCHOOL_STATUS_OPTIONS,
		});
		// PNS Status (jika ada)
		if (userData.pns_status) {
			const pns = userData.pns_status;
			fields.push({
				section: "PNS Status",
				label: "Status PNS",
				key: "is_pns",
				value: pns.is_pns,
				type: "select",
				options: PNS_STATUS_OPTIONS,
			});
		}
		return fields;
	}, [userData]);

	const filteredFields = useMemo(() => {
		if (!fieldSearch.trim()) return editableFields;
		return editableFields.filter((f) =>
			f.label.toLowerCase().includes(fieldSearch.toLowerCase()),
		);
	}, [fieldSearch, editableFields]);

	// Update nilai field saat terjadi perubahan
	const handleFieldChange = (section: string, key: string, newValue: any) => {
		if (!userData) return;
		const updated = { ...userData };
		if (section === "User") {
			(updated as any)[key] = newValue;
		} else if (section === "Profile") {
			updated.profile = { ...updated.profile, [key]: newValue };
		} else if (section === "PNS Status" && updated.pns_status) {
			updated.pns_status = { ...updated.pns_status, [key]: newValue };
		}
		setUserData(updated);
	};

	// --- Region Selector Section ---
	const userHasRegion = () => {
		return (
			region.province_id !== "" &&
			region.city_id !== "" &&
			region.district_id !== ""
		);
	};

	const { data: province, isLoading: provinceLoading } = useQuery({
		enabled: !!region.province_id,
		queryKey: ["province", region.province_id],
		queryFn: async () => {
			const res = await API.get(`/province/${region.province_id}`);
			return res.data;
		},
	});
	const { data: city, isLoading: cityLoading } = useQuery({
		enabled: !!region.city_id,
		queryKey: ["city", region.city_id],
		queryFn: async () => {
			const res = await API.get(`/city/${region.city_id}`);
			return res.data;
		},
	});
	const { data: district, isLoading: districtLoading } = useQuery({
		enabled: !!region.district_id && !!region.city_id,
		queryKey: ["district", region.district_id],
		queryFn: async () => {
			const res = await API.get(
				`/city/${region.city_id}/district/${region.district_id}`,
			);
			return res.data;
		},
	});

	// Infinite query untuk provinsi, kota, kecamatan (modal)
	const {
		data: provinces,
		isFetchingNextPage: isFetchingNextProvince,
		fetchNextPage: fetchNextProvince,
		isLoading: provincesLoading,
	} = useInfiniteQuery({
		queryKey: ["provinces"],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const res = await API.get("/province?page=" + pageParam);
			return {
				nextPage: res.data.next_page_url
					? parseInt(res.data.next_page_url.split("=").pop())
					: undefined,
				data: res.data.data,
			};
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const {
		data: cities,
		isFetchingNextPage: isFetchingNextCities,
		fetchNextPage: fetchNextCities,
		isLoading: citiesLoading,
	} = useInfiniteQuery({
		enabled: !!region.province_id,
		queryKey: ["cities", region.province_id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const res = await API.get(
				`/province/${region.province_id}/city?page=${pageParam}`,
			);
			return {
				nextPage: res.data.next_page_url
					? parseInt(res.data.next_page_url.split("=").pop())
					: undefined,
				data: res.data.data,
			};
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const {
		data: districts,
		isFetchingNextPage: isFetchingNextDistrict,
		fetchNextPage: fetchNextDistrict,
		isLoading: districtsLoading,
	} = useInfiniteQuery({
		enabled: !!region.city_id,
		queryKey: ["districts", region.city_id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const res = await API.get(
				`/city/${region.city_id}/district?page=${pageParam}`,
			);
			return {
				nextPage: res.data.next_page_url
					? parseInt(res.data.next_page_url.split("=").pop())
					: undefined,
				data: res.data.data,
			};
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const { inView: provinceInView, ref: provinceRef } = useInView();
	const { inView: cityInView, ref: cityRef } = useInView();
	const { inView: districtInView, ref: districtRef } = useInView();

	useEffect(() => {
		if (provinceInView && !isFetchingNextProvince) {
			fetchNextProvince();
		}
	}, [provinceInView, isFetchingNextProvince, fetchNextProvince]);

	useEffect(() => {
		if (cityInView && !isFetchingNextCities) {
			fetchNextCities();
		}
	}, [cityInView, isFetchingNextCities, fetchNextCities]);

	useEffect(() => {
		if (districtInView && !isFetchingNextDistrict) {
			fetchNextDistrict();
		}
	}, [districtInView, isFetchingNextDistrict, fetchNextDistrict]);

	// --- Handler simpan update user (termasuk wilayah) ---
	const handleSave = async () => {
		if (!userData) return;
		setSaving(true);
		try {
			const payload = {
				// Data User & Profile
				name: userData.name,
				email: userData.email,
				kta_id: userData.kta_id,
				role_id: userData.role_id,
				point: userData.point,
				// Password update jika diisi
				password: (userData as any).password,
				nip: userData.profile.nip,
				nik: userData.profile.nik,
				contact: userData.profile.contact,
				school_place: userData.profile.school_place,
				home_address: userData.profile.home_address,
				educational_level_id: userData.profile.educational_level_id,
				unit_kerja: userData.profile.unit_kerja,
				nama_kepala_satuan_pendidikan:
					userData.profile.nama_kepala_satuan_pendidikan,
				nip_kepala_satuan_pendidikan:
					userData.profile.nip_kepala_satuan_pendidikan,
				gender: userData.profile.gender,
				birthdate: userData.profile.birthdate,
				long_bio: userData.profile.long_bio,
				short_bio: userData.profile.short_bio,
				headmaster_name: userData.profile.headmaster_name,
				headmaster_nip: userData.profile.headmaster_nip,
				grade_id: userData.profile.grade_id,
				school_status: userData.profile.school_status,
				// Wilayah (dari modal)
				province_id: region.province_id,
				city_id: region.city_id,
				district_id: region.district_id,
				// PNS Status jika ada
				pns_status: userData.pns_status || null,
			};
			const res = await API.put(`/users/${userData.id}`, payload);
			toast.success("Update success");
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			router.push("/edit-user");
		} catch (error) {
			console.error("Error updating user", error);
			toast.error("Error updating user");
		}
		setSaving(false);
	};

	if (!userData) {
		return (
			<div className="pb-20 pt-[4.21rem]">
				<TopBar withBackButton>Detail & Edit User</TopBar>
				<p className="text-center">Loading user details...</p>
			</div>
		);
	}

	return (
		<div className="pb-20 pt-[4.21rem]">
			<TopBar withBackButton>Detail & Edit User</TopBar>
			<div className="container mx-auto p-4 space-y-6">
				<h2 className="text-xl font-bold">Edit User: {userData.name}</h2>
				{/* Form Field untuk User & Profile */}
				<div>
					<input
						type="text"
						placeholder="Cari field yang ingin diedit..."
						value={fieldSearch}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setFieldSearch(e.target.value)
						}
						className="border p-2 w-full mb-4"
					/>
					<div className="space-y-4">
						{filteredFields.map((field, index) => (
							<div
								key={`${field.section}-${field.key}-${index}`}
								className="flex flex-col">
								<label className="font-semibold">
									{field.section} - {field.label}
								</label>
								{field.type === "select" ? (
									<select
										value={field.value}
										onChange={(e) =>
											handleFieldChange(
												field.section,
												field.key,
												e.target.value,
											)
										}
										className="border p-2">
										<option value="">Pilih {field.label}</option>
										{field.options?.map((opt, idx) => (
											<option
												key={idx}
												value={opt.value}>
												{opt.name}
											</option>
										))}
									</select>
								) : field.type === "password" ? (
									<input
										type="text"
										value={field.value}
										onChange={(e) =>
											handleFieldChange(
												field.section,
												field.key,
												e.target.value,
											)
										}
										className="border p-2"
									/>
								) : (
									<input
										type="text"
										value={field.value}
										onChange={(e) =>
											handleFieldChange(
												field.section,
												field.key,
												e.target.value,
											)
										}
										className="border p-2"
									/>
								)}
							</div>
						))}
					</div>
				</div>
				{/* Region Selector Section */}
				<div className="border p-4 rounded-md">
					<h3 className="font-semibold mb-2">Wilayah Kerja</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="text-sm text-gray-600">Provinsi</label>
							<div
								className="border p-2 bg-slate-200 rounded-md cursor-pointer hover:bg-slate-300 transition"
								onClick={toggleProvinceModal}>
								{provinceLoading
									? "Loading..."
									: province?.name || "Pilih Provinsi"}
							</div>
						</div>
						<div>
							<label className="text-sm text-gray-600">Kota/Kabupaten</label>
							<div
								className="border p-2 bg-slate-200 rounded-md cursor-pointer hover:bg-slate-300 transition"
								onClick={() =>
									region.province_id
										? toggleCityModal()
										: toast.info("Harap pilih provinsi terlebih dahulu")
								}>
								{cityLoading
									? "Loading..."
									: city?.name || "Pilih Kota/Kabupaten"}
							</div>
						</div>
						<div>
							<label className="text-sm text-gray-600">Kecamatan</label>
							<div
								className="border p-2 bg-slate-200 rounded-md cursor-pointer hover:bg-slate-300 transition"
								onClick={() =>
									region.city_id
										? toggleDistrictModal()
										: toast.info("Harap pilih kota terlebih dahulu")
								}>
								{districtLoading
									? "Loading..."
									: district?.name || "Pilih Kecamatan"}
							</div>
						</div>
					</div>
				</div>
				<button
					onClick={handleSave}
					disabled={saving}
					className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
					{saving ? "loading..." : "Simpan Perubahan"}
				</button>
			</div>

			{/* Modal Provinsi */}
			<Modal
				show={provinceModalShow}
				onClose={toggleProvinceModal}
				className="w-full !px-0">
				<div className="p-5">
					<h3 className="text-lg font-semibold mb-4">Pilih Provinsi</h3>
					{provincesLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader className="size-8" />
						</div>
					) : (
						<div className="max-h-80 overflow-y-scroll">
							{provinces?.pages.map((page, i) => (
								<React.Fragment key={i}>
									{page.data.map((prov: any, idx: number) => (
										<div
											key={idx}
											onClick={() => {
												setRegion((prev) => ({
													...prev,
													province_id: prov.id,
													city_id: "",
													district_id: "",
												}));
												toggleProvinceModal();
											}}
											className="py-2 px-4 hover:bg-slate-100 cursor-pointer">
											{prov.name}
										</div>
									))}
								</React.Fragment>
							))}
							<div ref={provinceRef}></div>
						</div>
					)}
				</div>
			</Modal>

			{/* Modal Kota */}
			<Modal
				show={cityModalShow}
				onClose={toggleCityModal}
				className="w-full !px-0">
				<div className="p-5">
					<h3 className="text-lg font-semibold mb-4">Pilih Kota/Kabupaten</h3>
					{citiesLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader className="size-8" />
						</div>
					) : (
						<div className="max-h-80 overflow-y-scroll">
							{cities?.pages.map((page, i) => (
								<React.Fragment key={i}>
									{page.data.map((ct: any, idx: number) => (
										<div
											key={idx}
											onClick={() => {
												setRegion((prev) => ({
													...prev,
													city_id: ct.id,
													district_id: "",
												}));
												toggleCityModal();
											}}
											className="py-2 px-4 hover:bg-slate-100 cursor-pointer">
											{ct.name}
										</div>
									))}
								</React.Fragment>
							))}
							<div ref={cityRef}></div>
						</div>
					)}
				</div>
			</Modal>

			{/* Modal Kecamatan */}
			<Modal
				show={districtModalShow}
				onClose={toggleDistrictModal}
				className="w-full !px-0">
				<div className="p-5">
					<h3 className="text-lg font-semibold mb-4">Pilih Kecamatan</h3>
					{districtsLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader className="size-8" />
						</div>
					) : (
						<div className="max-h-80 overflow-y-scroll">
							{districts?.pages.map((page, i) => (
								<React.Fragment key={i}>
									{page.data.map((dist: any, idx: number) => (
										<div
											key={idx}
											onClick={() => {
												setRegion((prev) => ({
													...prev,
													district_id: dist.id,
												}));
												toggleDistrictModal();
											}}
											className="py-2 px-4 hover:bg-slate-100 cursor-pointer">
											{dist.name}
										</div>
									))}
								</React.Fragment>
							))}
							<div ref={districtRef}></div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
};

export default DetailEditUser;
