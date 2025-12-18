"use client";

import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function Register() {
	const formList = [
		{
			label: "Nama Lengkap",
			name: "name",
			type: "input",
			inputType: "text",
			validate: {
				required: true,
			},
		},
		{
			label: "Email",
			name: "email",
			type: "input",
			inputType: "text",
			validate: {
				required: true,
			},
		},
		{
			label: "Nomor HP",
			name: "no_hp",
			type: "input",
			inputType: "number",
			validate: {
				required: true,
			},
		},
		{
			label: "Nomor NIK",
			name: "nik",
			type: "input",
			inputType: "number",
			validate: {
				required: true,
			},
		},
		{
			label: "Password",
			name: "password",
			type: "input",
			inputType: "password",
			validate: {
				required: true,
			},
		},

		{
			label: "Konfirmasi Password",
			name: "password_confirmation",
			type: "input",
			inputType: "password",
			validate: {
				required: true,
			},
		},
		{
			label: "Daftar Sebagai",
			name: "role_id",
			type: "select",
			options: [
				{
					name: "Guru PAI",
					value: 2,
				},
				{
					name: "Kepala Sekolah & Guru PAI",
					value: 11,
				},
				{
					name: "Pengawas PAI",
					value: 7,
				},
				{
					name: "Anggota Luar Biasa",
					value: 9,
				},
				{
					name: "Anggota Kehormatan",
					value: 10,
				},
			],
		},
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
		<form
			onSubmit={handleSubmit(createAccount as any)}
			className="pt-16 px-[5%] sm:px-8">
            {/* === BUTTON BACK === */}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="absolute top-5 left-5 p-2 rounded-full bg-[#009788]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="size-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
			<div className="flex flex-col items-center mb-16 text-center">
              <img
                src="/svg/agpaii2.svg"
                className="size-20"
                alt="logo"
              />
              <h1 className="text-2xl -mt-2 font-semibold text-[#009788]">
                Daftar Akun
              </h1>
              <p className="text-slate-500">
                Daftarkan akun anda untuk mengakses fitur AGPAII Digital!
              </p>
            </div>

			<div className="flex flex-col gap-3">
				{formList.map((field, i) => (
					<FormControl
						className="rounded-md overflow-hidden appearance-none"
						options={field?.options}
						key={i}
						name={field.name}
						register={register}
						inputType={field?.inputType as any}
						placeholder={field.label}
						type={field.type}
						error={errors[field.name as keyof FormFields]}
					/>
				))}
				{errors && errors.root && (
					<small className="text-sm text-red-400">{errors.root.message}</small>
				)}
			</div>
			{isPending ? (
				<div className="flex justify-center mt-24">
					<Loader className="size-8" />
				</div>
			) : (
				<button
					type="submit"
					className=" px-5 py-2.5 bg-[#009788] w-full rounded-md text-white mt-12">
					{"Register"}
				</button>
			)}
			<p className="text-sm text-slate-500 text-center mt-2">
				Sudah mempunyai akun?{" "}
				<span>
					<Link
						className="text-blue-500"
						href={"/auth/login"}>
						Login
					</Link>
				</span>{" "}
			</p>
		</form>
	);
}
