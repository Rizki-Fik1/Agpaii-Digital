"use client";
import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

/* -----------------------------------------
   Tambahan Field: Pensiun (boolean 0/1)
------------------------------------------ */
const fields = [
	{
		name: "name",
		label: "Nama",
		type: "input",
		inputType: "text",
	},
	{
		name: "nik",
		label: "NIK",
		type: "input",
		inputType: "text",
		valueAsNumber: true,
	},
	{
		name: "nip",
		label: "NIP",
		type: "input",
		inputType: "text",
		valueAsNumber: true,
	},
	{
		name: "birthdate",
		label: "Tanggal Lahir",
		type: "input",
		inputType: "date",
	},
	{
		name: "gender",
		label: "Jenis Kelamin",
		type: "select",
		options: [
			{ name: "Laki - laki", value: "L" },
			{ name: "Perempuan", value: "P" },
		],
	},
	{
		name: "contact",
		label: "Kontak",
		type: "input",
		inputType: "text",
		valueAsNumber: true,
	},
	{
		name: "educational_level_id",
		label: "Jenjang Ajar",
		type: "select",
		valueAsNumber: true,
		options: [
			{ name: "SD", value: 1 },
			{ name: "SMP", value: 2 },
			{ name: "SMA", value: 3 },
			{ name: "SMK", value: 4 },
			{ name: "TK", value: 5 },
			{ name: "SLB", value: 9 },
		],
	},

	/* -----------------------------------------
	   Field Baru: Pensiun (Wajib Ada di User)
	------------------------------------------ */
	{
		name: "pensiun",
		label: "Pensiun",
		type: "select",
		valueAsNumber: true,
		options: [
			{ name: "Tidak", value: 0 },
			{ name: "Ya", value: 1 },
		],
	},

	{
		name: "unit_kerja",
		label: "Unit Kerja",
		type: "input",
		inputType: "text",
	},
	{
		name: "headmaster_name",
		label: "Nama Kepala Sekolah",
		type: "input",
		inputType: "text",
	},
	{
		name: "school_place",
		label: "Tempat tugas",
		type: "input",
		inputType: "text",
	},
	{
		name: "school_status",
		label: "Status sekolah",
		type: "select",
		options: [
			{ name: "Negeri", value: "Negeri" },
			{ name: "Swasta", value: "Swasta" },
		],
	},
	{
		name: "headmaster_nip",
		label: "NIP Kepala Sekolah",
		type: "input",
		inputType: "text",
		valueAsNumber: true,
	},
];

/* -----------------------------------------
   Schema Validation (ZOD)
   FIX: Pensiun sekarang menerima "0"/"1" lalu convert ke number
------------------------------------------ */
const schema = z.object({
	name: z.string(),
	nik: z
		.string()
		.min(16, { message: "NIK Harus 16 Digit" })
		.max(16, { message: "NIK Harus 16 Digit" })
		.refine((string) => !isNaN(Number(string)), { message: "Invalid NIK" }),
	nip: z
		.string()
		.refine((string) => !isNaN(Number(string)), { message: "Invalid NIP" })
		.optional(),
	birthdate: z.string(),
	gender: z.string(),
	contact: z
		.string()
		.min(10, { message: "Kontak minimal mempunyai 10 angka" })
		.refine((string) => !isNaN(Number(string)), {
			message: "Nomor kontak invalid",
		}),
	unit_kerja: z.string(),
	headmaster_name: z.string().optional(),
	school_place: z.string(),
	school_status: z.string(),
	headmaster_nip: z
		.string()
		.refine((string) => !isNaN(Number(string)), { message: "Invalid NIP" })
		.optional(),
	educational_level_id: z.any(),

	// FIXED: terima string dari select dan convert jadi number
	pensiun: z
		.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)])
		.transform((v) => Number(v)),
});

type FormFields = z.infer<typeof schema>;

const defaultValue: FormFields = {
	name: "",
	nik: "",
	gender: "",
	nip: "",
	birthdate: "",
	contact: "",
	unit_kerja: "",
	headmaster_name: "",
	headmaster_nip: "",
	school_place: "",
	school_status: "",
	educational_level_id: "",
	pensiun: 0,
};

export default function InformationProfile() {
	const { auth: user } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		control,
		formState: { errors },
		register,
		reset,
		handleSubmit,
	} = useForm<FormFields>({
		defaultValues: defaultValue,
		resolver: zodResolver(schema),
	});

	/* -----------------------------------------
	   Saat user login, auto set default values
	------------------------------------------ */
	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				nik: user.profile?.nik,
				nip: user.profile?.nip,
				birthdate: user.profile?.birthdate,
				gender: user.profile?.gender,
				contact: user.profile?.contact,
				educational_level_id: user.profile?.educational_level_id,
				unit_kerja: user.profile?.unit_kerja,
				headmaster_name: user.profile?.headmaster_name,
				headmaster_nip: user.profile?.headmaster_nip,
				school_place: user.profile?.school_place,
				school_status: user.profile?.school_status,

				// Tambahan field baru pensiun
				pensiun: user.pensiun ?? 0,
			});
		}
	}, [user]);

	/* -----------------------------------------
	   Submit update
	------------------------------------------ */
	const { mutate: updateProfile, isPending: pendingUpdate } = useMutation({
		mutationFn: async (credentials: any) => {
			try {
				const res = await API.put(`user/${user?.id}/profile`, credentials);
				if (res.status == 200) return res.data;
			} catch (error: any) {
				throw error;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["auth"],
			});
			toast.success("Berhasil Update Profile");
			router.push("/profile/edit");
		},
	});

	return (
		<div className="pt-[4.21rem] pb-20">
			<TopBar withBackButton>Informasi Umum</TopBar>
			<form
				onSubmit={handleSubmit(updateProfile as any)}
				className="flex flex-col px-[5%] sm:px-6 gap-4 mt-8">
				{fields.map((field) => (
					<div key={field.name}>
						<h1 className="mb-1 text-slate-700 text-sm">{field.label}</h1>
						<FormControl
							error={errors[field.name as keyof FormFields]}
							register={register}
							className="rounded-md overflow-hidden appearance-none"
							inputType={field?.inputType as any}
							name={field?.name}
							placeholder={field.label}
							type={field.type}
							options={field?.options}
						/>
					</div>
				))}

				{pendingUpdate ? (
					<div className="mt-8 flex justify-center">
						<Loader className="size-8" />
					</div>
				) : (
					<button
						type="submit"
						className="px-3 py-2 bg-[#009788] text-white rounded-md mt-8">
						Update
					</button>
				)}
			</form>
		</div>
	);
}
