"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CityPage() {
	const { cityId, provinceId } = useParams();
	const searchParams = useSearchParams();
	const filter = searchParams.get("filter"); // bisa null kalau tidak ada

	const fetchDistricts = async ({ pageParam }: { pageParam: number }) => {
		const res = await API.get(
			`/city/${cityId}/district-member?page=${pageParam}?filter=${filter}`,
		);
		return {
			data: res.data.data,
			nextPage:
				res.data.next_page_url !== null
					? parseInt(res.data.next_page_url.split("=")[1])
					: undefined,
		};
	};

	const { data: city } = useQuery({
		queryKey: ["city", cityId],
		queryFn: async () => {
			const res = await API.get("city/" + cityId);
			return res.status === 200 && res.data;
		},
	});

	const { data: districts } = useInfiniteQuery({
		queryKey: ["districts", cityId],
		queryFn: fetchDistricts,
		initialPageParam: 1,
		getNextPageParam: (lastPage: any) => lastPage?.nextPage,
	});

	useEffect(() => {
		console.log(districts);
	}, [districts]);

	return (
		<div className="pt-[4.21rem]">
			<TopBar withBackButton>Informasi Anggota</TopBar>
			<div className="px-6 py-4 border-b border-b-slate-300">
				<h1 className="text-sm text-slate-500">Kabupaten</h1>
				<h1 className="text-xl font-semibold capitalize">
					{city?.name.toLowerCase()}
				</h1>
			</div>
			<div className="flex flex-col">
				{districts?.pages &&
					districts.pages.map((page, index) => (
						<div
							key={index}
							className="flex flex-col">
							{page.data.map((district: any, i: number) => (
								<Link
									href={`/member/${provinceId}/${cityId}/${district.id}?filter=${filter}`}
									key={i}
									className="flex py-4 px-6 border-b border-b-slate-300">
									<h1 className=" text-sm capitalize">
										{district.name.toLowerCase()}
									</h1>
									<p className="ms-auto text-sm text-slate-600">
										{district.users_count} Pengguna
									</p>
								</Link>
							))}
						</div>
					))}
			</div>
		</div>
	);
}
