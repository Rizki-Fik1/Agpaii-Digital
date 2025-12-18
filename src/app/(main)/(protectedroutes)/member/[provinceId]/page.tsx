"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function ProvincePage() {
	const { provinceId } = useParams();
	const searchParams = useSearchParams();
	const filter = searchParams.get("filter"); // bisa null kalau tidak ada

	const { data: province } = useQuery({
		queryKey: ["province", provinceId],
		queryFn: async () => {
			const res = await API.get("province/" + provinceId);
			return res.status == 200 && res.data;
		},
	});

	const {
		data: cities,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteQuery({
		queryKey: ["cities", provinceId],
		queryFn: async ({ pageParam }) => {
			const res = await API.get(
				`province/${provinceId}/city-member?filter=${filter}?page=${pageParam}`,
			);
			if (res.status == 200) {
				return {
					data: res.data.data,
					nextPage:
						res.data.next_page_url !== null
							? parseInt(res.data.next_page_url.split("=")[1])
							: undefined,
				};
			}
		},
		getNextPageParam: (lastPage) => lastPage?.nextPage,
		initialPageParam: 1,
	});

	const { ref, inView } = useInView();

	useEffect(() => {
		console.log(cities);
	}, [cities]);

	useEffect(() => {
		if (inView) fetchNextPage();
	}, [inView]);

	return (
		<div className="pt-[4.21rem]">
			<TopBar withBackButton>Informasi Anggota</TopBar>
			<div className="flex px-4 sm:px-5 py-4 border-b border-b-slate-300">
				<div className="">
					<h1 className="text-sm text-slate-500">Provinsi</h1>
					<h1 className="font-semibold capitalize text-2xl">
						{province?.name.toLowerCase()}
					</h1>
				</div>
			</div>
			<div className="flex flex-col">
				{cities?.pages &&
					cities.pages.length > 0 &&
					cities?.pages.map((page, index) => {
						return (
							<div
								key={index}
								className="flex flex-col">
								{page?.data.map((data: any, i: number) => (
									<Link
										href={
											"/member/" +
											provinceId +
											"/" +
											data.id +
											"?filter=" +
											filter
										}
										key={i}
										className="flex justify-between py-4 px-5 border-b border-b-slate-300">
										<h1 className="capitalize text-sm text-slate-800">
											{data.name.toLowerCase()}
										</h1>

										<p className="text-[0.8rem] text-slate-600 ">
											{data.users_count} Pengguna
										</p>
									</Link>
								))}
							</div>
						);
					})}
				<div
					ref={ref}
					className={clsx(isFetchingNextPage && "px-6 py-4 text-center")}>
					{isFetchingNextPage && "Harap tunggu.."}
				</div>
			</div>
		</div>
	);
}
