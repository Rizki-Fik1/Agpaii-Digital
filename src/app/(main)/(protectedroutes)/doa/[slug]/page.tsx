"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import { useParams } from "next/navigation";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import doaQuran, { DoaItem } from "@/data/doa/doa-quran";
import doaHadits from "@/data/doa/doa-hadits";
import doaHarian from "@/data/doa/doa-harian";
import doaPilihan from "@/data/doa/doa-pilihan";
import doaIbadah from "@/data/doa/doa-ibadah";
import doaHaji from "@/data/doa/doa-haji";
import doaLainnya from "@/data/doa/doa-lainnya";

// Slugs yang menggunakan data lokal (hardcoded)
const LOCAL_DATA: Record<string, DoaItem[]> = {
  quran: doaQuran,
  hadits: doaHadits,
  harian: doaHarian,
  pilihan: doaPilihan,
  ibadah: doaIbadah,
  haji: doaHaji,
  lainnya: doaLainnya,
};

const DetailDoaPage = () => {
	const { slug } = useParams();
	const slugStr = Array.isArray(slug) ? slug[0] : slug ?? "";
	const [data, setData] = useState<DoaItem[] | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<number | null>(null);

	useEffect(() => {
		if (!slugStr) return;

		// Gunakan data lokal jika tersedia
		if (LOCAL_DATA[slugStr]) {
			setData(LOCAL_DATA[slugStr]);
			setIsLoading(false);
			return;
		}

		// Fallback ke API eksternal
		const fetchDoaDetails = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_DOA_API_URL}/doa/sumber/${slugStr}`,
				);
				setData(response.data.data);
			} catch (err: any) {
				setError(err.response?.data?.message || err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDoaDetails();
	}, [slugStr]);

	if (isLoading) {
		return (
			<div className="pt-[4.2rem]">
				<TopBar withBackButton>Doa {slugStr}</TopBar>
				<div className="p-4">
					<div className="space-y-4">
						{[...Array(3)].map((_, index) => (
							<div key={index} className="bg-white p-4 rounded shadow flex flex-col space-y-2">
								<Skeleton height={24} width="60%" style={{ margin: '0 auto' }} />
								<Skeleton height={80} />
								<Skeleton height={60} />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-500 mt-8">
				<p>Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Doa {slugStr}</TopBar>
			<div className="p-4">
				<ul className="space-y-3">
					{data?.map((item, index) => (
						<li key={index} className="bg-white rounded shadow overflow-hidden">
							<button
								onClick={() => setExpanded(expanded === index ? null : index)}
								className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-teal-50 transition-colors text-left"
							>
								<h2 className="text-base font-semibold text-teal-700 flex-1">
									{item.judul}
								</h2>
								<span className="text-teal-500 text-lg ml-3">
									{expanded === index ? "▲" : "▼"}
								</span>
							</button>
							{expanded === index && (
								<div className="px-4 pb-4 space-y-3 border-t border-slate-100">
									<p className="text-right text-xl text-gray-800 font-serif pt-3 leading-loose">
										{item.arab}
									</p>
									<p className="italic text-gray-600 text-sm">{item.indo}</p>
									{item.sumber && (
										<p className="text-xs text-teal-600 font-medium text-right">
											📖 {item.sumber}
										</p>
									)}
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default DetailDoaPage;
