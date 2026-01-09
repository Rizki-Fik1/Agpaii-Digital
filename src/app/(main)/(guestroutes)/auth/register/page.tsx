"use client";

import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronLeftIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error-handler";
import { searchSchools, School, STUDENT_ROLE_ID } from "@/constants/student-data";

export default function Register() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<{ name: string; value: number } | null>(null);
	
	// Student-specific states
	const [schoolSearch, setSchoolSearch] = useState("");
	const [schoolResults, setSchoolResults] = useState<School[]>([]);
	const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
	const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
	const [nisn, setNisn] = useState("");

	const roleOptions = [
		{ name: "Siswa", value: STUDENT_ROLE_ID },
		{ name: "Guru PAI", value: 2 },
		{ name: "Kepala Sekolah & Guru PAI", value: 11 },
		{ name: "Pengawas PAI", value: 7 },
		{ name: "Anggota Luar Biasa", value: 9 },
		{ name: "Anggota Kehormatan", value: 10 },
	];

	// Check if student role is selected
	const isSiswaSelected = selectedRole?.value === STUDENT_ROLE_ID;

	// Search schools when typing
	useEffect(() => {
		if (schoolSearch.length >= 2) {
			const results = searchSchools(schoolSearch);
			setSchoolResults(results);
			setShowSchoolDropdown(results.length > 0);
		} else {
			setSchoolResults([]);
			setShowSchoolDropdown(false);
		}
	}, [schoolSearch]);

	const userSchema = z
		.object({
			name: z.string().min(3, { message: "Nama Anda harus berisi setidaknya 3 karakter." }),
			email: z.string().email({ message: "Format email tidak valid" }).min(1, { message: "Email wajib diisi" }),
			no_hp: z.string().min(12, { message: "Nomor HP Anda harus berisi setidaknya 12 angka." }),
			nik: z.string().optional().or(z.literal("")),
			password: z.string().min(8, { message: "Password Anda harus berisi setidaknya 8 huruf, angka atau simbol." }),
			password_confirmation: z.string(),
			role_id: z.string().min(1, {
				message: "Anda harus memilih role",
			}).refine((value) => !isNaN(Number(value)), {
				message: "Anda harus memilih role",
			}),
		})
		.refine(
			({ password, password_confirmation }) =>
				password == password_confirmation,
			{
				message: "Konfirmasi password tidak sesuai",
				path: ["password_confirmation"],
			},
		)
		.refine(
			(data) => {
				// NIK required only for non-students
				if (data.role_id !== STUDENT_ROLE_ID.toString()) {
					return data.nik && data.nik.length === 16 && !isNaN(Number(data.nik));
				}
				return true;
			},
			{
				message: "NIK harus berisi 16 angka",
				path: ["nik"],
			}
		);
	type FormFields = z.infer<typeof userSchema>;
	const queryClient = useQueryClient();
	const router = useRouter();
	const { mutate: createAccount, isPending } = useMutation({
		mutationFn: async (data: any) => {
			// For student demo mode, skip API and just store locally
			if (data.role_id === STUDENT_ROLE_ID.toString()) {
				// Set demo student mode
				localStorage.setItem("demo_student_mode", "true");
				localStorage.setItem("demo_student_data", JSON.stringify({
					name: data.name,
					email: data.email,
					school: selectedSchool?.name || "",
					nisn: nisn,
					role_id: STUDENT_ROLE_ID,
					isRegisteredToClass: false, // Not registered by teacher yet
				}));
				return { access_token: "demo_student_token" };
			}
			
			try {
				const res = await API.post("/register", data);
				if (res.status == 200) return res.data;
			} catch (error: any) {
				if (error.response && error.response.data) throw error.response.data;
				else throw error;
			}
		},
		onSuccess: async (data) => {
			localStorage.setItem("access_token", data.access_token);
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			
			// Redirect to student home if siswa
			if (isSiswaSelected) {
				router.push("/beranda");
			} else {
				router.push("/");
			}
		},
		onError: async (err: any) => {
			const errorMessage = getErrorMessage(err);
			toast.error(errorMessage);
		},
	});
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<FormFields>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			email: "",
			no_hp: "",
			nik: "",
			password: "",
			password_confirmation: "",
			role_id: "",
		},
	});

	const onSubmit = (data: FormFields) => {
		// Validate student-specific fields
		if (isSiswaSelected) {
			if (!selectedSchool) {
				toast.error("Pilih nama sekolah terlebih dahulu");
				return;
			}
			if (!nisn || nisn.length < 10) {
				toast.error("NISN harus minimal 10 digit");
				return;
			}
		}
		createAccount(data as any);
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex items-center gap-4 px-6 py-6">
				<button onClick={() => router.back()} className="p-1">
					<ChevronLeftIcon className="w-6 h-6 text-gray-700" />
				</button>
				<h1 className="text-xl font-medium text-gray-700">Daftar</h1>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col px-6 pt-4">
				<div className="space-y-4">
					{/* Daftar Sebagai - MOVED TO TOP */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Daftar Sebagai
						</label>
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
								className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-left bg-white flex items-center justify-between transition ${
									errors.role_id 
										? "border-red-500 focus:border-red-500" 
										: "border-[#00AF70] focus:border-[#00AF70]"
								}`}
							>
								<span className={selectedRole ? "text-gray-700" : "text-gray-400"}>
									{selectedRole ? selectedRole.name : "Pilih Role"}
								</span>
								<svg
									className={`w-5 h-5 text-[#00AF70] transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{isRoleDropdownOpen && (
								<div 
									className="absolute z-50 w-full mt-2 bg-white border-2 border-[#00AF70] rounded-lg shadow-lg max-h-60 overflow-y-auto"
								>
									{roleOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => {
												setSelectedRole(option);
												setValue("role_id", option.value.toString(), { 
													shouldValidate: true,
													shouldDirty: true 
												});
												setIsRoleDropdownOpen(false);
											}}
											className={`w-full px-4 py-3 text-left hover:bg-[#00AF70] hover:bg-opacity-10 transition flex items-center gap-3 ${
												selectedRole?.value === option.value ? "bg-[#00AF70] bg-opacity-10 text-[#00AF70] font-medium" : "text-gray-700"
											}`}
										>
											{option.value === STUDENT_ROLE_ID && (
												<AcademicCapIcon className="w-5 h-5" />
											)}
											{option.name}
										</button>
									))}
								</div>
							)}
						</div>
						{errors.role_id && (
							<p className="text-red-500 text-sm mt-1">{errors.role_id.message}</p>
						)}
					</div>

					{/* Student-specific fields */}
					{isSiswaSelected && (
						<>
							{/* Nama Sekolah - Search */}
							<div>
								<label className="block text-gray-700 font-medium mb-2">
									Nama Sekolah
								</label>
								<div className="relative">
									<div className="relative">
										<MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											placeholder="Cari nama sekolah..."
											value={selectedSchool ? selectedSchool.name : schoolSearch}
											onChange={(e) => {
												setSchoolSearch(e.target.value);
												setSelectedSchool(null);
											}}
											onFocus={() => schoolSearch.length >= 2 && setShowSchoolDropdown(true)}
											className="w-full pl-12 pr-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none placeholder-gray-400"
										/>
									</div>
									
									{showSchoolDropdown && schoolResults.length > 0 && (
										<div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#00AF70] rounded-lg shadow-lg max-h-48 overflow-y-auto">
											{schoolResults.map((school) => (
												<button
													key={school.id}
													type="button"
													onClick={() => {
														setSelectedSchool(school);
														setSchoolSearch("");
														setShowSchoolDropdown(false);
													}}
													className="w-full px-4 py-3 text-left hover:bg-[#00AF70] hover:bg-opacity-10 transition"
												>
													<p className="font-medium text-gray-700">{school.name}</p>
													<p className="text-xs text-gray-500">{school.city} • {school.type}</p>
												</button>
											))}
										</div>
									)}
								</div>
								{!selectedSchool && schoolSearch.length > 0 && schoolSearch.length < 2 && (
									<p className="text-gray-500 text-sm mt-1">Ketik minimal 2 karakter untuk mencari</p>
								)}
							</div>

							{/* NISN */}
							<div>
								<label className="block text-gray-700 font-medium mb-2">
									NISN (Nomor Induk Siswa Nasional)
								</label>
								<input
									type="text"
									placeholder="Contoh: 0012345678"
									value={nisn}
									onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
									maxLength={10}
									className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none placeholder-gray-400"
								/>
								<p className="text-gray-500 text-xs mt-1">NISN terdiri dari 10 digit angka</p>
							</div>
						</>
					)}

					{/* Nama Lengkap */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Nama Lengkap
						</label>
						<input
							type="text"
							placeholder="Ardianita"
							{...register("name")}
							className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
								errors.name 
									? "border-red-500 focus:border-red-500" 
									: "border-[#00AF70] focus:border-[#00AF70]"
							}`}
						/>
						{errors.name && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
								<p className="text-red-500 text-sm">{errors.name.message}</p>
							</div>
						)}
					</div>

					{/* Nomor HP */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Nomor HP
						</label>
						<input
							type="tel"
							placeholder="Minimal 12 karakter"
							{...register("no_hp")}
							className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
								errors.no_hp 
									? "border-red-500 focus:border-red-500" 
									: "border-[#00AF70] focus:border-[#00AF70]"
							}`}
						/>
						{errors.no_hp && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
								<p className="text-red-500 text-sm">{errors.no_hp.message}</p>
							</div>
						)}
					</div>

					{/* Nomor NIK - only for non-students */}
					{!isSiswaSelected && (
						<div>
							<label className="block text-gray-700 font-medium mb-2">
								Nomor NIK
							</label>
							<input
								type="text"
								placeholder="Minimal 16 karakter"
								{...register("nik")}
								maxLength={16}
								className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
									errors.nik 
										? "border-red-500 focus:border-red-500" 
										: "border-[#00AF70] focus:border-[#00AF70]"
								}`}
							/>
							{errors.nik && (
								<div className="flex items-center gap-2 mt-2">
									<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
									<p className="text-red-500 text-sm">{errors.nik.message}</p>
								</div>
							)}
						</div>
					)}

					{/* Alamat Email */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Alamat Email
						</label>
						<input
							type="email"
							placeholder="Ardianita@example.com"
							{...register("email")}
							className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
								errors.email 
									? "border-red-500 focus:border-red-500" 
									: "border-[#00AF70] focus:border-[#00AF70]"
							}`}
						/>
						{errors.email && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
								<p className="text-red-500 text-sm">{errors.email.message}</p>
							</div>
						)}
					</div>

					{/* Tetapkan kata sandi Anda */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Tetapkan kata sandi Anda
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Minimal 8 karakter"
								{...register("password")}
								className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
									errors.password 
										? "border-red-500 focus:border-red-500" 
										: "border-[#00AF70] focus:border-[#00AF70]"
								}`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2"
							>
								{showPassword ? (
									<EyeSlashIcon className="w-5 h-5 text-gray-400" />
								) : (
									<EyeIcon className="w-5 h-5 text-gray-400" />
								)}
							</button>
						</div>
						{errors.password && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
								<p className="text-red-500 text-sm">{errors.password.message}</p>
							</div>
						)}
					</div>

					{/* Konfirmasi kata sandi Anda */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Konfirmasi kata sandi Anda
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Minimal 8 karakter"
								{...register("password_confirmation")}
								className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none placeholder-gray-400 ${
									errors.password_confirmation 
										? "border-red-500 focus:border-red-500" 
										: "border-[#00AF70] focus:border-[#00AF70]"
								}`}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2"
							>
								{showConfirmPassword ? (
									<EyeSlashIcon className="w-5 h-5 text-gray-400" />
								) : (
									<EyeIcon className="w-5 h-5 text-gray-400" />
								)}
							</button>
						</div>
						{errors.password_confirmation && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-red-500 text-xl flex-shrink-0">⚠</span>
								<p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
							</div>
						)}
					</div>
				</div>

				{/* Bottom Button */}
				<div className="mt-8 pb-8">
					<button
						type="submit"
						disabled={isPending}
						className="w-full py-4 bg-[#00DB81] text-white font-medium rounded-full hover:bg-[#00c573] transition disabled:opacity-50"
					>
						{isPending ? "Loading..." : "Bergabung Sekarang"}
					</button>
				</div>
			</form>
		</div>
	);
}