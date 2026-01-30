"use client";

import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { useModal } from "@/utils/hooks/use_modal";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

export default function RegionEdit() {
	const { auth } = useAuth();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { show: provinceModalShow, toggle: toggleProvinceModal } = useModal();
	const { show: cityModalShow, toggle: toggleCityModal } = useModal();
	const { show: districtModalShow, toggle: toggleDistrictModal } = useModal();
	const { show: changeRegionModalShow, toggle: toggleChangeRegionModal } =
		useModal();
	const [region, setRegion] = useState({
		province_id: "",
		city_id: "",
		district_id: "",
	});
	const [hpAdmin, setHpAdmin] = useState<string | null>(null);

	const userHasRegion = () => {
		return (
			!!auth.profile.district_id &&
			!!auth.profile.province_id &&
			!!auth.profile.city_id
		);
	};

	useEffect(() => {
		async function getNoHpAdmin() {
			try {
				const response = await API.get("/setting");
				const data: any =
					response.data.find(
						(item: { key: any }) => item.key === "admin.no_hp_admin",
					)?.value || null;

				setHpAdmin(data);
			} catch (error) {
				console.log(error);
			}
		}

		if (userHasRegion()) {
			setRegion((r) => ({
				province_id: auth.profile.province_id,
				city_id: auth.profile.city_id,
				district_id: auth.profile.district_id,
			}));
		}

		getNoHpAdmin();
	}, [auth]);

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
		enabled: !!region.district_id,
		queryKey: ["district", region.district_id],
		queryFn: async () => {
			const res = await API.get(
				`/city/${region.city_id}/district/${region.district_id}`,
			);
			return res.data;
		},
	});

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
			if (res.status == 200) {
				return {
					nextPage:
						res.data.next_page_url
							? parseInt(res.data.next_page_url.split("=").pop())
							: undefined,
					data: res.data.data,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const {
		data: cities,
		isFetchingNextPage: isFetchingNextCities,
		fetchNextPage: fetchNextCities,
		isLoading: citiesLoading,
	} = useInfiniteQuery({
		enabled: !!region.province_id && !!cityModalShow,
		queryKey: ["cities", region.province_id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			// Guard: Don't make API call if province_id is empty
			if (!region.province_id) {
				return { nextPage: undefined, data: [] };
			}
			const res = await API.get(
				`/province/${region.province_id}/city?page=${pageParam}`,
			);
			if (res.status == 200) {
				return {
					nextPage:
						res.data.next_page_url
							? parseInt(res.data.next_page_url.split("=").pop())
							: undefined,
					data: res.data.data,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const {
		data: districts,
		isFetchingNextPage: isFetchingNextDistrict,
		fetchNextPage: fetchNextDistrict,
		isLoading: districtsLoading,
	} = useInfiniteQuery({
		enabled: !!region.city_id && districtModalShow,
		queryKey: ["districts", region.city_id],
		initialPageParam: 1, // Mulai dari halaman 1
		queryFn: async ({ pageParam = 1 }) => {
			// Guard: Don't make API call if city_id is empty
			if (!region.city_id) {
				return { nextPage: undefined, data: [] };
			}
			const res = await API.get(
				`/city/${region.city_id}/district?page=${pageParam}`,
			);
			if (res.status === 200) {
				return {
					nextPage:
						res.data.next_page_url
							? parseInt(res.data.next_page_url.split("=").pop())
							: undefined,
					data: res.data.data,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	const regions = [
		{
			name: "Provinsi",
			value: province?.name,
			click: () => toggleProvinceModal(),
			loading: provinceLoading,
		},
		{
			name: "Kota / Kabupaten",
			value: city?.name,
			click: () => {
				!!region.province_id
					? toggleCityModal()
					: toast.info("Harap pilih provinsi terlebih dahulu");
			},
			loading: cityLoading,
		},
		{
			name: "Kecamatan",
			value: district?.name,
			click: () =>
				!!region.city_id
					? toggleDistrictModal()
					: toast.info("Harap pilih kota terlebih dahulu"),
			loading: districtLoading,
		},
	];

	const { inView: provinceInView, ref: provinceRef } = useInView();
	const { inView: cityInView, ref: cityRef } = useInView();
	const { inView: districtInView, ref: districtRef } = useInView();

	const { mutate: updateAndGenerateKta, isPending: updating } = useMutation({
		mutationFn: async () => {
			const res = await API.post(`/kta`, region);
			if (res.status == 200) return region;
		},
		onSuccess: async () => {
			router.push("/profile/edit");
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Berhasil mengupdate profile");
		},
	});

	useEffect(() => {
		if (provinceInView && !isFetchingNextProvince) fetchNextProvince();
	}, [provinceInView]);
	useEffect(() => {
		if (cityInView && !isFetchingNextCities) fetchNextCities();
	}, [cityInView]);
	useEffect(() => {
		if (districtInView && !isFetchingNextDistrict) {
			fetchNextDistrict();
		}
	}, [districtInView, isFetchingNextDistrict]);

	return (
		<>
			<Modal
				show={changeRegionModalShow}
				onClose={toggleChangeRegionModal}>
				<div className="p-6 text-center">
					<h2 className="text-lg font-semibold mb-4">Ingin Merubah Wilayah?</h2>
					<p className="text-sm text-gray-600 mb-6">
						Jika Anda ingin mengubah wilayah kerja, silakan menghubungi admin
						untuk proses lebih lanjut.
					</p>
					<div className="flex justify-center gap-4">
						<a
							href={`https://wa.me/${hpAdmin}`}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
							Hubungi Admin
						</a>
						<button
							onClick={toggleChangeRegionModal}
							className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition">
							Nanti Dulu
						</button>
					</div>
				</div>
			</Modal>
			<Modal
				className=" w-full !px-0"
				show={provinceModalShow}
				onClose={toggleProvinceModal}>
				<div className="flex flex-col items-start text-left pb-3">
					<h1 className="text-base font-medium pb-4 px-5">Provinsi</h1>
					{provincesLoading ? (
						<div className="h-[10rem] flex justify-center w-full items-center">
							<Loader className="size-10" />
						</div>
					) : (
						<div className=" max-h-[20rem] overflow-y-scroll no-scrollbar w-full">
							{provinces?.pages.map((page, i) => (
								<Fragment key={i}>
									{page?.data.map((province: any, index: number) => {
										return (
											<div
												onClick={async () => {
													setRegion((r) => ({
														...r,
														province_id: province.id,
														city_id: "",
														district_id: "",
													}));
													queryClient.invalidateQueries({
														queryKey: ["province"],
													});
													toggleProvinceModal();
												}}
												key={index}
												className="py-3 hover:font-medium hover:bg-slate-100 rounded-md px-5 duration-300 ease-in-out text-slate-600 cursor-default text-[0.95rem] capitalize">
												{province.name}
											</div>
										);
									})}
								</Fragment>
							))}
							<div ref={provinceRef}></div>
						</div>
					)}
				</div>
			</Modal>

			<Modal
				className="w-full !px-0"
				onClose={toggleCityModal}
				show={cityModalShow}>
				<div className="pb-3">
					<h1 className="text-base text-left pb-4 px-5 font-medium">
						Kabupaten/Kota
					</h1>
					{citiesLoading ? (
						<div className="h-[10rem] flex justify-center w-full items-center">
							<Loader className="size-10" />
						</div>
					) : (
						<div className="max-h-[20rem] overflow-scroll  no-scrollbar text-left">
							{cities?.pages.map((page, i) => (
								<Fragment key={i}>
									{page?.data.map((city: any, index: number) => {
										return (
											<div
												onClick={async () => {
													setRegion((r) => ({
														...r,
														city_id: city.id,
														district_id: "",
													}));

													toggleCityModal();
												}}
												key={index}
												className={clsx(
													"py-3 hover:font-medium cursor-default  hover:bg-slate-100 ease-in-out duration-300 px-5 text-slate-600 capitalize text-[0.95rem]",
												)}>
												{city.name}
											</div>
										);
									})}
								</Fragment>
							))}
							<div ref={cityRef}></div>
						</div>
					)}
				</div>
			</Modal>

			<Modal
				show={districtModalShow}
				className="w-full !px-0"
				onClose={toggleDistrictModal}>
				<div className="text-left pb-3">
					<h1 className="pb-5 text-base px-5 font-medium">Kecamatan</h1>
					{districtsLoading ? (
						<div className="h-[10rem] flex justify-center w-full items-center">
							<Loader className="size-10" />
						</div>
					) : (
						<div className="max-h-[20rem] no-scrollbar overflow-y-scroll">
							{districts?.pages.map((page, i) => (
								<Fragment key={i}>
									{page?.data.map((district: any, index: number) => (
										<div
											onClick={() => {
												setRegion((r) => ({
													...r,
													district_id: district.id,
												}));
												toggleDistrictModal();
											}}
											key={index}
											className="py-3 hover:font-medium cursor-default px-5 hover:bg-slate-100 duration-300 ease-in-out text-slate-600 capitalize text-[0.95rem]">
											{district.name}
										</div>
									))}
								</Fragment>
							))}

							<div ref={districtRef}></div>
						</div>
					)}
				</div>
			</Modal>

			<div className="pt-[4.2rem]">
				<TopBar withBackButton>Wilayah Kerja</TopBar>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						updateAndGenerateKta();
					}}
					className="flex flex-col py-8 px-6 gap-4">
					{regions.map((reg, i) => {
						return (
							<div
								key={i}
								className="flex flex-col">
								<label className="text-slate-500 text-sm mb-1">
									{reg.name}
								</label>
								<div
									className={clsx(
										"border border-slate-100 bg-slate-200 text-slate-800 rounded-md py-2 px-4 h-10",
										userHasRegion() ? "!text-slate-600" : "",
									)}
									onClick={() => (userHasRegion() ? null : reg.click())}>
									{reg.loading ? "..." : !!reg.value && reg.value}
								</div>
							</div>
						);
					})}
					{!userHasRegion() && (
						<>
							{updating ? (
								<div className="flex justify-center mt-6">
									<Loader className="size-8 " />
								</div>
							) : (
								<button
									type="submit"
									className="px-5 py-2 bg-[#009788] text-white rounded-md mt-6">
									Update
								</button>
							)}
						</>
					)}
				</form>
				{userHasRegion() && (
					<div className="flex gap-3 px-6 text-sm items-center text-slate-700 mt-1">
						<InformationCircleIcon className="size-5 ml-1" />
						Anda tidak bisa mengubah wilayah kerja anda
					</div>
				)}
				{userHasRegion() && (
					<div className="flex justify-center mt-6">
						<button
							onClick={toggleChangeRegionModal}
							className="px-5 py-2 bg-[#009788] text-white rounded-md hover:bg-red-600 transition">
							Ubah Wilayah
						</button>
					</div>
				)}
			</div>
		</>
	);
}
