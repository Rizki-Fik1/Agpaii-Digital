"use client";

import React from "react";
import TopBar from "@/components/nav/topbar";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import axios from "axios";
import { useCachedData } from "@/utils/hooks/useDataCache";

const DoaPage = () => {
	const { data, isLoading, error } = useCachedData<string[]>({
		fetchFn: async () => {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_DOA_API_URL}/doa/sumber`,
			);
			return response.data.data;
		},
		cacheKey: "doa-list",
	});

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton href="/">Doa</TopBar>

			<div className="p-4">
				{isLoading && (
					<div className="space-y-4">
						{[...Array(5)].map((_, index) => (
							<div key={index} className="bg-white p-4 rounded shadow flex items-center justify-between">
								<div className="flex-grow">
									<Skeleton height={24} width="60%" />
								</div>
								<Skeleton height={20} width={100} />
							</div>
						))}
					</div>
				)}

				{!isLoading && error && (
					<div className="text-red-500 text-center">
						<p>Error: {error}</p>
					</div>
				)}

				{!isLoading && data && (
					<ul className="space-y-4">
						{data.map((name, index) => (
							<li key={index}>
								<a
									href={`/doa/${name}`}
									className="bg-white p-4 rounded shadow flex items-center justify-between cursor-pointer hover:bg-teal-50 transition-colors">
									<div className="flex-grow">
										<p className="text-lg font-medium capitalize text-teal-700">Doa {name}</p>
									</div>
									<span className="text-teal-500 text-sm font-medium">Lihat Detail →</span>
								</a>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default DoaPage;
