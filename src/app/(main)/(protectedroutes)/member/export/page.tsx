"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";

interface Province {
	id: number;
	name: string;
}

interface City {
	id: number;
	name: string;
	province_id: number;
}

export default function ExportMembers() {
	/* ===============================
	   STATE
	================================ */
	const [exportMode, setExportMode] = useState<"user" | "iuran">("user");

	const [dataType, setDataType] = useState("");
	const [regionType, setRegionType] = useState("national");

	const [provinces, setProvinces] = useState<Province[]>([]);
	const [cities, setCities] = useState<City[]>([]);

	const [provinceId, setProvinceId] = useState("");
	const [cityId, setCityId] = useState("");

	const [iuranType, setIuranType] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	/* ===============================
	   FETCH MASTER PROVINCE
	================================ */
	useEffect(() => {
		async function fetchProvinces() {
			try {
				const res = await fetch(
					"https://admin.agpaiidigital.org/api/master/provinces"
				);
				const json = await res.json();
				setProvinces(json.data || []);
			} catch (err) {
				console.error("Gagal fetch provinsi", err);
			}
		}

		fetchProvinces();
	}, []);

	/* ===============================
	   FETCH CITY BY PROVINCE
	================================ */
	useEffect(() => {
		if (!provinceId) {
			setCities([]);
			return;
		}

		async function fetchCities() {
			try {
				const res = await fetch(
					`https://admin.agpaiidigital.org/api/master/provinces/${provinceId}/cities`
				);
				const json = await res.json();
				setCities(json.data || []);
			} catch (err) {
				console.error("Gagal fetch kota", err);
			}
		}

		fetchCities();
	}, [provinceId]);

	/* ===============================
	   VALIDATION HELPER
	================================ */
	function canProceedExport(): string | null {
		if (exportMode === "user" && !dataType) {
			return "Pilih jenis data terlebih dahulu";
		}

		if (exportMode === "iuran") {
			if (!iuranType) return "Pilih jenis iuran";
			if (!startDate || !endDate) return "Pilih rentang tanggal";
		}

		if (regionType === "province" && !provinceId) {
			return "Pilih provinsi terlebih dahulu";
		}

		if (regionType === "city" && (!provinceId || !cityId)) {
			return "Pilih provinsi dan kota terlebih dahulu";
		}

		return null;
	}

	/* ===============================
	   SUBMIT FORM (DOWNLOAD)
	================================ */
	function submitExportForm(payload: Record<string, any>) {
		const form = document.createElement("form");
		form.method = "POST";
		form.action = "https://admin.agpaiidigital.org/api/admin/users/export";

		Object.entries(payload).forEach(([key, value]) => {
			if (value === null || value === "") return;

			const input = document.createElement("input");
			input.type = "hidden";
			input.name = key;
			input.value = String(value);
			form.appendChild(input);
		});

		document.body.appendChild(form);
		form.submit();
		form.remove();
	}

	/* ===============================
	   HANDLE EXPORT
	================================ */
	async function handleExport() {
		if (!password) {
			alert("Password wajib diisi");
			return;
		}

		const error = canProceedExport();
		if (error) {
			alert(error);
			return;
		}

		setLoading(true);

		try {
			// 1. VALIDASI PASSWORD
			const validateRes = await fetch(
				"https://admin.agpaiidigital.org/api/export-user/validate-password",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ password }),
				}
			);

			const validateJson = await validateRes.json();

			if (!validateRes.ok || !validateJson.success) {
				throw new Error(validateJson.message || "Password salah");
			}

			// 2. SUBMIT EXPORT
			submitExportForm({
				data_type: exportMode === "user" ? dataType : "iuran",
				region_type: regionType,
				province_id: regionType !== "national" ? provinceId : "",
				city_id: regionType === "city" ? cityId : "",
				password,

				// KHUSUS IURAN
				iuran_type: exportMode === "iuran" ? iuranType : "",
				start_date: exportMode === "iuran" ? startDate : "",
				end_date: exportMode === "iuran" ? endDate : "",
			});

			setShowPassword(false);
			setPassword("");
		} catch (err: any) {
			alert(err.message || "Password salah atau server error");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="pt-[4.21rem] px-6">
			<TopBar withBackButton>Export Data</TopBar>

			<div className="mt-6 space-y-6">

				{/* MODE EXPORT */}
				<div>
					<h3 className="font-semibold mb-2">Mode Export</h3>
					<div className="space-y-2">
						<label className="flex items-center gap-2">
							<input
								type="radio"
								checked={exportMode === "user"}
								onChange={() => setExportMode("user")}
							/>
							<span>Export Data User</span>
						</label>

						<label className="flex items-center gap-2">
							<input
								type="radio"
								checked={exportMode === "iuran"}
								onChange={() => setExportMode("iuran")}
							/>
							<span>Export Data Iuran</span>
						</label>
					</div>
				</div>

				{/* PILIH DATA USER */}
				{exportMode === "user" && (
					<div>
						<h3 className="font-semibold mb-2">Pilih Data</h3>
						<div className="space-y-2">
							{[
								{ key: "active", label: "User Aktif" },
								{ key: "expired", label: "User Expired" },
								{ key: "asn", label: "User ASN" },
								{ key: "non_asn", label: "User Non ASN" },
							].map((item) => (
								<label key={item.key} className="flex items-center gap-2">
									<input
										type="radio"
										checked={dataType === item.key}
										onChange={() => setDataType(item.key)}
									/>
									<span>{item.label}</span>
								</label>
							))}
						</div>
					</div>
				)}

				{/* WILAYAH */}
				<div>
					<h3 className="font-semibold mb-2">Pilih Wilayah</h3>

					<select
						value={regionType}
						onChange={(e) => {
							setRegionType(e.target.value);
							setProvinceId("");
							setCityId("");
						}}
						className="w-full border rounded-md px-3 py-2 mb-3">
						<option value="national">Nasional</option>
						<option value="province">Provinsi</option>
						<option value="city">Kota</option>
					</select>

					{regionType !== "national" && (
						<select
							value={provinceId}
							onChange={(e) => setProvinceId(e.target.value)}
							className="w-full border rounded-md px-3 py-2 mb-3">
							<option value="">Pilih Provinsi</option>
							{provinces.map((prov) => (
								<option key={prov.id} value={prov.id}>
									{prov.name}
								</option>
							))}
						</select>
					)}

					{regionType === "city" && provinceId && (
						<select
							value={cityId}
							onChange={(e) => setCityId(e.target.value)}
							className="w-full border rounded-md px-3 py-2">
							<option value="">Pilih Kota</option>
							{cities.map((city) => (
								<option key={city.id} value={city.id}>
									{city.name}
								</option>
							))}
						</select>
					)}
				</div>

				{/* KHUSUS IURAN */}
				{exportMode === "iuran" && (
					<div className="space-y-4">
						<div>
							<h3 className="font-semibold mb-2">Jenis Iuran</h3>
							<select
								value={iuranType}
								onChange={(e) => setIuranType(e.target.value)}
								className="w-full border rounded-md px-3 py-2">
								<option value="">Pilih Jenis Iuran</option>
								<option value="pendaftaran">Iuran Pendaftaran</option>
								<option value="perpanjangan">Iuran Perpanjangan</option>
							</select>
						</div>

						<div>
							<h3 className="font-semibold mb-2">Rentang Tanggal</h3>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="border rounded-md px-3 py-2"
								/>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="border rounded-md px-3 py-2"
								/>
							</div>
						</div>
					</div>
				)}

				{/* EXPORT */}
				<div>
					<button
						onClick={() => {
							const error = canProceedExport();
							if (error) return alert(error);
							setShowPassword(true);
							setPassword("");
						}}
						className="w-full bg-blue-600 text-white py-2 rounded-md">
						Export Data
					</button>
				</div>

				{/* PASSWORD */}
				{showPassword && (
					<div className="border rounded-md p-4">
						<h4 className="font-semibold mb-2">Konfirmasi Password</h4>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full border rounded-md px-3 py-2 mb-3"
						/>
						<button
							onClick={handleExport}
							disabled={!password || loading}
							className={`w-full py-2 rounded-md text-white ${
								password && !loading
									? "bg-green-600"
									: "bg-gray-400"
							}`}>
							{loading ? "Memproses..." : "Proses Export"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
