"use client";

import { DevTool } from "@hookform/devtools";
import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Bank = {
	id: number; // ID bank sebagai number
	name: string; // Nama bank sebagai string
};

const schema = z.object({
	is_pns: z.string(),
	employment_status: z.string().optional(),
	pendidikan: z.string(),
	jurusan: z.string(),
	kampus: z.string(),
	is_certification: z.string(),
	is_non_pns_inpassing: z.string(),
	pemasukan: z.string(),
	pengeluaran: z.string(),
	kepemilikan_rumah: z.string(),
	bank_id: z.string().optional(),
	is_tpp_received: z.string().optional(),
	thr_tpg_2023_50: z.string().optional(),
	gaji_13_tpg_2023_50: z.string().optional(),
	thr_tpg_2024_100: z.string().optional(),
	gaji_13_tpg_2024_100: z.string().optional(),
	bank_account_no: z
		.string()
		.refine((string) => !isNaN(Number(string)), {
			message: "Rekening Bank invalid",
		})
		.optional(),
});

type Fields = z.infer<typeof schema>;

export default function EditStatus() {
	const { auth: user } = useAuth();
	const {
		formState: { errors, isDirty },
		handleSubmit,
		register,
		reset,
		watch,
	} = useForm<Fields>();
	const queryClient = useQueryClient();
	const router = useRouter();
	const [banks, setBanks] = useState<Bank[]>([]); // banks adalah array dari tipe Bank
	const [isLoading, setIsLoading] = useState(true);
	const [isBankFeatureEnabled, setIsBankFeatureEnabled] = useState(false);

	// Watch fields to dynamically change the form
	const isPns = watch("is_pns");
	const employmentStatus = watch("employment_status");

	useEffect(() => {
		fetch(
			`${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/bank_feature`,
		)
			.then((response) => response.json())
			.then((data) => {
				setIsBankFeatureEnabled(data.is_enabled); // Set the bank feature status
				setIsLoading(false); // Stop loading indicator
			})
			.catch((error) => {
				console.error("Error fetching feature status:", error);
				setIsLoading(false);
			});
		const fetchBanks = async () => {
			try {
				const res = await API.get("/bank");
				if (res.status === 200) {
					// Validasi tipe data
					const banksData: Bank[] = res.data;
					setBanks(banksData);

					// Set bank_id dari data pengguna jika ada
					if (user?.pns_status?.bank_id) {
						reset((prev) => ({
							...prev,
							bank_id: user.pns_status.bank_id.toString(), // Pastikan tipe data sesuai dengan opsi di dropdown
						}));
					}
				}
			} catch (error: any) {
				console.error(error);
			}
		};

		fetchBanks();
		if (!!user && !!user.pns_status)
			reset({
				is_pns: user.pns_status.is_pns?.toString(),
				employment_status: user.pns_status.employment_status,
				pendidikan: user.pns_status.pendidikan,
				jurusan: user.pns_status.jurusan,
				kampus: user.pns_status.kampus,
				is_certification: user.pns_status.is_certification?.toString(),
				is_non_pns_inpassing: user.pns_status.is_non_pns_inpassing?.toString(),
				pemasukan: user.pns_status.pemasukan,
				pengeluaran: user.pns_status.pengeluaran,
				kepemilikan_rumah: user.pns_status.kepemilikan_rumah,
				is_tpp_received: user.pns_status.is_tpp_received?.toString(),
				thr_tpg_2023_50: user.pns_status.thr_tpg_2023_50?.toString(),
				gaji_13_tpg_2023_50: user.pns_status.gaji_13_tpg_2023_50?.toString(),
				thr_tpg_2024_100: user.pns_status.thr_tpg_2024_100?.toString(),
				gaji_13_tpg_2024_100: user.pns_status.gaji_13_tpg_2024_100?.toString(),
				bank_account_no: user.pns_status.bank_account_no,
				bank_id: user.pns_status.bank_id?.toString(),
			});
	}, [user, reset]);

	const { mutate: updateStatus, isPending: updating } = useMutation({
		mutationFn: async (data) => {
			const res = await API.post(`/users/${user.id}/updatestatus`, data);
			if (res.status == 200) return "Data Berhasil di Update";
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			router.push("/profile/edit");
			toast.success("Data Berhasil Di Update");
		},
		onError: (err) => toast.error(err.message),
	});

	// Dynamically construct form fields
	const forms = [
		{
			name: "is_pns",
			label: "Status Guru",
			type: "select",
			options: [
				{ name: "ASN", value: "1" },
				{ name: "Non ASN", value: "0" },
			],
		},
		...(isPns === "1"
			? [
					{
						name: "employment_status",
						label: "Status Kepegawaian",
						type: "select",
						options: [
							{ name: "PNS Pemda", value: "PNS Pemda" },
							{ name: "PNS Kemenag", value: "PNS Kemenag" },
							{ name: "PPPK Pemda", value: "PPPK Pemda" },
							{ name: "PPPK Kemenag", value: "PPPK Kemenag" },
						],
					},
					{
						name: "is_tpp_received",
						label: "Sudah mendapat TPP/TKD/Tamsil/Tunjangan Daerah/Tukin?",
						type: "select",
						options: [
							{ name: "Sudah", value: "1" },
							{ name: "Belum", value: "0" },
						],
					},
			  ]
			: [
					{
						name: "employment_status",
						label: "Status Kepegawaian",
						type: "select",
						options: [
							{ name: "Guru Tetap Yayasan", value: "Guru Tetap Yayasan" },
							{ name: "Honor Yayasan", value: "Honor Yayasan" },
							{ name: "Honor Daerah/KKI/PJLP", value: "Honor Daerah/KKI/PJLP" },
							{
								name: "Honor Murni Sekolah",
								value: "Honor Murni Sekolah",
							},
						],
					},
			  ]),
		...(employmentStatus === "PNS Pemda" || employmentStatus === "PPPK Pemda"
			? [
					{
						name: "thr_tpg_2023_50",
						label: "THR TPG 2023 50%",
						type: "select",
						options: [
							{ name: "Sudah", value: "1" },
							{ name: "Belum", value: "0" },
						],
					},
					{
						name: "gaji_13_tpg_2023_50",
						label: "Gaji 13 TPG 2023 50%",
						type: "select",
						options: [
							{ name: "Sudah", value: "1" },
							{ name: "Belum", value: "0" },
						],
					},
					{
						name: "thr_tpg_2024_100",
						label: "THR TPG 2024 100%",
						type: "select",
						options: [
							{ name: "Sudah", value: "1" },
							{ name: "Belum", value: "0" },
						],
					},
					{
						name: "gaji_13_tpg_2024_100",
						label: "Gaji 13 TPG 2024 100%",
						type: "select",
						options: [
							{ name: "Sudah", value: "1" },
							{ name: "Belum", value: "0" },
						],
					},
			  ]
			: []),
		{
			name: "pendidikan",
			label: "Pendidikan",
			type: "select",
			options: [
				{ name: "S1", value: "S1" },
				{ name: "S2", value: "S2" },
				{ name: "S3", value: "S3" },
			],
		},
		{
			name: "jurusan",
			label: "Program Studi",
			type: "input",
		},
		{
			name: "kampus",
			label: "Universitas/Kampus",
			type: "input",
		},
		{
			name: "is_certification",
			label: "Sudah Sertifikasi?",
			type: "select",
			options: [
				{ name: "Sudah", value: "1" },
				{ name: "Belum", value: "0" },
			],
		},
		{
			name: "is_non_pns_inpassing",
			label: "Sudah Inpassing?",
			type: "select",
			options: [
				{ name: "Sudah", value: "1" },
				{ name: "Belum", value: "0" },
			],
		},
		{
			name: "pemasukan",
			label: "Pemasukan?",
			type: "select",
			options: [
				{ name: "0 - 5 Juta", value: "0 - 5 Juta" },
				{ name: "5 - 10 Juta", value: "5 - 10 Juta" },
				{ name: "Diatas 10 Juta", value: "Diatas 10 Juta" },
			],
		},
		{
			name: "pengeluaran",
			label: "Pengeluaran?",
			type: "select",
			options: [
				{ name: "0 - 5 Juta", value: "0 - 5 Juta" },
				{ name: "5 - 10 Juta", value: "5 - 10 Juta" },
				{ name: "Diatas 10 Juta", value: "Diatas 10 Juta" },
			],
		},
		{
			name: "kepemilikan_rumah",
			label: "Kepemilikan Rumah?",
			type: "select",
			options: [
				{ name: "Milik Sendiri", value: "Milik Sendiri" },
				{ name: "Orang Tua", value: "Orang Tua" },
				{ name: "Sewa", value: "Sewa" },
			],
		},
		...(isBankFeatureEnabled // Kondisi untuk menampilkan field Bank
			? [
					{
						name: "bank_id",
						label: "Bank",
						type: "select",
						options: banks.map((bank) => ({
							name: bank.name,
							value: bank.id, // Gunakan ID bank sebagai value
						})),
					},
					{
						name: "bank_account_no",
						label: "No Rekening",
						type: "input",
					},
			  ]
			: []), // Jika isBankFeatureEnabled false, field tidak ditampilkan
	];

	if (isLoading)
		return (
			<div className="pt-[4.21rem] pb-20">
				<TopBar withBackButton>Edit Status Guru</TopBar>
				<div className="flex justify-center items-center h-64">
					{/* Animasi loading */}
					<div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
				</div>
			</div>
		);

	return (
		<div className="pb-20 pt-[4.21rem]">
			<TopBar withBackButton>Edit Status Guru</TopBar>
			<form
				onSubmit={handleSubmit(updateStatus as any)}
				method="POST"
				className="flex flex-col px-6 pt-8 gap-3">
				{forms.map((field, i) => (
					<div
						className="flex flex-col"
						key={i}>
						<h1 className="text-sm text-slate-700 mb-1">{field.label}</h1>
						<FormControl
							type={field.type}
							register={register}
							name={field.name}
							placeholder={field.label}
							inputType={"text"}
							options={field?.options}
							className="rounded-md overflow-hidden appearance-none"
							error={errors[field.name as keyof Fields]}
						/>
					</div>
				))}
				{updating ? (
					<div className="flex mt-10 justify-center">
						<Loader className="size-8" />
					</div>
				) : (
					<button
						type="submit"
						className="mt-8 px-4 py-2 rounded-md bg-[#009788] text-white">
						Submit{" "}
					</button>
				)}
			</form>
		</div>
	);
}
