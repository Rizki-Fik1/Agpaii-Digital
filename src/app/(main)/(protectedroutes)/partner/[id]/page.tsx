"use client";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import Select from "@/components/select/select";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import { useModal } from "@/utils/hooks/use_modal";
import { CheckIcon } from "@heroicons/react/16/solid";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const forms = [
	{
		name: "name",
		label: "Nama",
		formType: "input",
	},
	{
		name: "nik",
		label: "NIK",
		formType: "input",
	},
	{
		name: "birthdate",
		label: "Tanggal Lahir",
		formType: "input",
		inputType: "date",
	},
	{
		name: "gender",
		label: "Jenis Kelamin",
		formType: "select",
		options: [
			{
				name: "Laki - laki",
				value: "L",
			},
			{
				name: "Perempuan",
				value: "P",
			},
		],
	},
	{
		name: "contact",
		label: "No HP",
		formType: "input",
	},
	{
		name: "educational_level_id",
		label: "Jenjang Ajar",
		formType: "select",
		options: [
			{
				name: "Laki - laki",
				value: "L",
			},
			{
				name: "Perempuan",
				value: "P",
			},
		],
	},
	{
		name: "educational_level_id",
		label: "Jenjang Kelas",
		formType: "input",
	},
	{
		name: "school_place",
		label: "Tempat Tugas",
		formType: "input",
	},
];

export default function Partner() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { show, toggle } = useModal();
	const { show: subpartnerModalShow, toggle: toggleSubPartnerModal } =
		useModal();
	const [selected, setSelected] = useState<any>(null);
	const { id } = useParams();
	const { auth } = useAuth();
	const [data, setData] = useState<any>({
		name: "",
		nik: "",
		birthdate: "",
		gender: "",
		contact: "",
		educational_level_id: "",
		grade_id: "",
		school_place: "",
	});
	const { data: partner, isLoading } = useQuery({
		queryKey: ["partner", id],
		queryFn: async () => {
			const res = await API.get(`/partner/${id}`);
			if (res.status == 200) return res.data;
		},
	});

	const { data: subpartners } = useQuery({
		queryKey: ["subpartners", id],
		queryFn: async () => {
			try {
				const res = await API.get(`/partner/${id}/subpartners`);
				if (res.status == 200) return res.data;
				else return null;
			} catch (error) {
				return null;
			}
		},
	});

	const { mutate: saveUser, isPending: isSaving } = useMutation({
		mutationFn: async (id: string) => {
			const res = await API.post(`/partner/${id}/user`, { user_id: auth.id });
			if (res.status == 200) return res.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["partner-user", auth?.id],
			});
			if (subpartnerModalShow) toggleSubPartnerModal();
			toggle();
		},
	});

	const { data: registeredUser, isLoading: loading } = useQuery({
		enabled: !!auth.id,
		queryKey: ["partner-user", auth.id],
		queryFn: async () => {
			try {
				const res = await API.get(`/partner/${id}/user/${auth.id}`);
				if (res.status == 200) return res.data;
				else return null;
			} catch (error) {
				return null;
			}
		},
	});

	useEffect(() => {
		setData({
			name: auth.name,
			birthdate: auth.profile.birthdate,
			contact: auth.profile.contact,
			educational_level_id: auth.profile.educational_level_id,
			gender: auth.profile.gender,
			grade_id: auth.profile.grade_id,
			nik: auth.profile.nik,
			school_place: auth.profile.school_place,
		});
	}, [auth]);

	useEffect(() => {
		if (!!partner && !!partner?.has_subpartners) setSelected(partner);
	}, [partner]);

	useEffect(() => {
		if (!!registeredUser) setSelected(registeredUser?.partner);
	}, [registeredUser]);

	if (isLoading || loading) return null;
      
	return (
		<div className="py-[4.21rem]">
			{/* Modal Confirm Data */}
			{show && (
				<div className="fixed border-x border-x-slate-300  max-w-[480px] mx-auto left-0 right-0 bg-white h-screen overflow-y-scroll z-[99999] top-0 px-6 py-8">
					<div className="flex justify-between">
						<h1 className="font-medium text-lg">Konfirmasi Data Diri anda</h1>
						<XMarkIcon
							className="size-6 text-slate-500"
							onClick={toggle}
						/>
					</div>
					<p className="text-sm mt-4 text-slate-700">
						Cek data diri Anda! Jika ada data yang tidak sesuai, dapat Anda edit
						terlebih dahulu di bagian profile.
					</p>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (!!!selected) return toggleSubPartnerModal();
							else saveUser(selected.id);
						}}
						className="flex flex-col mt-8 gap-3">
						{forms.map((form, i) => {
							return (
								<div
									className="flex flex-col text-sm gap-1.5"
									key={i}>
									<label
										className="text-slate-700"
										htmlFor={form.name}>
										{form.label}
									</label>
									{form.formType == "input" ? (
										<input
											readOnly
											value={data[form.name] || ""}
											type={form.inputType ?? "text"}
											className="px-4 py-2 border border-[#009788] rounded-md"></input>
									) : (
										form.formType == "select" && (
											<input
												readOnly
												value={data[form.name] || ""}
												placeholder={form.label}
											/>
										)
									)}
								</div>
							);
						})}
						{isSaving ? (
							<div className="flex justify-center mt-8">
								<Loader className="size-8" />
							</div>
						) : (
							<button
								className="text-sm text-white bg-[#009788] rounded-md py-3 px-3 mt-8"
								type="submit">
								Simpan
							</button>
						)}
					</form>
				</div>
			)}

			{subpartnerModalShow && (
				<div className="fixed border-x border-x-slate-300  max-w-[480px] mx-auto left-0 right-0 bg-white h-screen overflow-y-scroll z-[99999] top-0 px-6 py-8">
					<div className="flex justify-between">
						<h1 className="font-medium text-lg">
							Silahkan pilih mitra yang tersedia
						</h1>

						<XMarkIcon
							className="size-6 text-slate-500"
							onClick={() => {
								toggleSubPartnerModal();
								setSelected(null);
							}}
						/>
					</div>

					<div className="flex flex-col gap-2.5 mt-8">
						<h1 className="font-medium "> Pilih Mitra</h1>
						<Select
							onChange={(e) => {
								const subpartner = subpartners.find(
									(p: any) => p.id == e.target.value,
								);
								setSelected(subpartner);
							}}
							value={selected?.id || ""}
							placeholder=""
							className=""
							options={subpartners.map((p: any) => ({
								name: p.name,
								value: p.id,
							}))}
						/>
					</div>

					<div className="mt-8 flex gap-3 justify-end items-center">
						<div className="px-5 py-2 text-sm bg-gray-100 text-slate-600 rounded-md">
							Batal
						</div>
						{isSaving ? (
							<div className="fle justify-center">
								<Loader className="size-6" />
							</div>
						) : (
							<div
								onClick={() => {
									saveUser(selected.id);
								}}
								className="px-5 py-2 text-sm bg-[#009788] cursor-pointer text-white rounded-md">
								Simpan
							</div>
						)}
					</div>
				</div>
			)}

			{/* End Modal Confirm Data */}
			<TopBar withBackButton>{!isLoading ? partner?.name : " "}</TopBar>
			{isLoading ? null : (
				<div className="px-6 mt-6">
					<div className="aspect-[16/10] overflow-hidden rounded-md">
						{!!partner.cover_image ? (
							<img
								src={getImage(partner.cover_image)}
								className="size-full object-cover object-center"
								alt=""
							/>
						) : (
							<img
								src="https://picsum.photos/4320"
								className="size-full object-cover object-center"
								alt=""
							/>
						)}
					</div>
					<h1 className="text-2xl text-slate-500 font-semibold mt-3">
						{partner.name}
					</h1>
					<div className="py-6">
						<h1 className="relative w-fit before:absolute before:w-[140%] before:-bottom-1/2 before:py-[0.180rem]  before:bg-[#009788]">
							Deskripsi
						</h1>
						<p className="mt-6 text-slate-600">{partner.description}</p>
					</div>
					<div className="fixed max-w-[480px] py-4 gap-3 bg-[#009788] bottom-0 left-0 right-0 mx-auto flex flex-col px-4 sm:px-6">
						<button
							disabled={!!registeredUser}
							onClick={toggle}
							className="flex disabled:bg-gray-400 disabled:text-white items-center gap-3 bg-white py-2 px-3 rounded-lg">
							<div
								className={clsx(
									"p-1 rounded-full",
									!!registeredUser
										? "bg-white *:fill-gray-400"
										: "bg-[#009788] *:fill-white",
								)}>
								<CheckIcon className="size-4" />
							</div>
							<h1 className="text-sm">Konfirmasi data diri</h1>
						</button>
						<button
							onClick={() => window.open(selected.url, "_blank")}
							disabled={!!!registeredUser}
							className={clsx(
								"flex disabled:bg-gray-400 disabled:text-white items-center gap-3 bg-white py-2 px-3 rounded-lg",
								!!!registeredUser ? "*:fill-white" : "*:fill-[#009788]",
							)}>
							<PencilSquareIcon className="size-6 " />
							<h1 className="text-sm">Isi Form Sekarang</h1>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
