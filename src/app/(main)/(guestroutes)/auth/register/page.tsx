"use client";

import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<{ name: string; value: number } | null>(null);

	const roleOptions = [
		{ name: "Guru PAI", value: 2 },
		{ name: "Kepala Sekolah & Guru PAI", value: 11 },
		{ name: "Pengawas PAI", value: 7 },
		{ name: "Anggota Luar Biasa", value: 9 },
		{ name: "Anggota Kehormatan", value: 10 },
	];

	const userSchema = z
		.object({
			name: z.string().min(1, { message: "Nama perlu diisi" }),
			email: z.string().email({ message: "Invalid email" }).min(1),
			no_hp: z.string().min(1, { message: "Nomor Hp perlu diisi" }),
			nik: z
				.string()
				.min(16, { message: "NIK Harus 16 Digit" })
				.max(16, { message: "NIK Harus 16 Digit" })
				.refine((string) => !isNaN(Number(string)), { message: "Invalid NIK" }),
			password: z.string().min(1, { message: "Password perlu diisi" }),
			password_confirmation: z.string(),
			role_id: z.string().refine((string) => parseFloat(string), {
				message: "Anda Harus Memilih",
			}),
		})
		.refine(
			({ password, password_confirmation }) =>
				password == password_confirmation,
			{
				message: "Konfirmasi Password Tidak Sesuai",
				path: ["password_confirmation"],
			},
		);
	type FormFields = z.infer<typeof userSchema>;
	const queryClient = useQueryClient();
	const router = useRouter();
	const { mutate: createAccount, isPending } = useMutation({
		mutationFn: async (data) => {
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
			router.push("/");
		},
		onError: async (err) => toast.error(err.message),
	});
	const {
		register,
		handleSubmit,

		formState: { errors },
	} = useForm<FormFields>({
		resolver: zodResolver(userSchema),
	});
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
			<form onSubmit={handleSubmit(createAccount as any)} className="flex-1 flex flex-col px-6 pt-4">
				<div className="space-y-4">
					{/* Nama Lengkap */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Nama Lengkap
						</label>
						<input
							type="text"
							placeholder="Ardianita"
							{...register("name")}
							className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
						/>
						{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
							className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
						/>
						{errors.no_hp && (
							<p className="text-red-500 text-sm mt-1">{errors.no_hp.message}</p>
						)}
					</div>

					{/* Nomor NIK */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Nomor NIK
						</label>
						<input
							type="text"
							placeholder="Minimal 16 karakter"
							{...register("nik")}
							maxLength={16}
							className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
						/>
						{errors.nik && (
							<p className="text-red-500 text-sm mt-1">{errors.nik.message}</p>
						)}
					</div>

					{/* Alamat Email */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Alamat Email
						</label>
						<input
							type="email"
							placeholder="Ardianita@example.com"
							{...register("email")}
							className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
						/>
						{errors.email && (
							<p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
								className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
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
							<p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
								className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] placeholder-gray-400"
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
							<p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
						)}
					</div>

					{/* Daftar Sebagai - Custom Dropdown */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Daftar Sebagai
						</label>
						<div className="relative">
							{/* Hidden input for form validation */}
							<input
								type="hidden"
								{...register("role_id")}
								value={selectedRole?.value || ""}
							/>
							
							{/* Custom Dropdown Button */}
							<button
								type="button"
								onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
								className="w-full px-4 py-3 border-2 border-[#00AF70] rounded-lg focus:outline-none focus:border-[#00AF70] text-left bg-white flex items-center justify-between"
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

							{/* Dropdown Menu */}
							{isRoleDropdownOpen && (
								<div 
									className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-[#00AF70] rounded-lg shadow-lg max-h-60 overflow-y-auto"
									style={{
										scrollbarWidth: "thin",
										scrollbarColor: "#00AF70 #f1f1f1",
									}}
								>
									<style jsx>{`
										div::-webkit-scrollbar {
											width: 8px;
										}
										div::-webkit-scrollbar-track {
											background: #f1f1f1;
											border-radius: 10px;
										}
										div::-webkit-scrollbar-thumb {
											background: #00AF70;
											border-radius: 10px;
										}
										div::-webkit-scrollbar-thumb:hover {
											background: #008f5f;
										}
									`}</style>
									{roleOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => {
												setSelectedRole(option);
												setIsRoleDropdownOpen(false);
											}}
											className={`w-full px-4 py-3 text-left hover:bg-[#00AF70] hover:bg-opacity-10 transition ${
												selectedRole?.value === option.value ? "bg-[#00AF70] bg-opacity-10 text-[#00AF70] font-medium" : "text-gray-700"
											}`}
										>
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

				<p className="text-md text-slate-500 text-center mt-2">
				Sudah mempunyai akun?{" "}
				<span>
					<Link
						className="text-blue-500"
						href={"/getting-started"}>
						Login
					</Link>
				</span>{" "}
			</p>
				</div>
			</form>
		</div>
	);
}
