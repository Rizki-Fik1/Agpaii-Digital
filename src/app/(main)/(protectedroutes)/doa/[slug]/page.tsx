"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import { useParams } from "next/navigation";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface DoaDetail {
	id: number;
	judul: string;
	arab: string;
	indo: string;
}

const DetailDoaPage = () => {
	const { slug } = useParams();
	const [data, setData] = useState<DoaDetail[] | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDoaDetails = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_DOA_API_URL}/doa/sumber/${slug}`,
				);
				setData(response.data.data);
			} catch (err: any) {
				setError(err.response?.data?.message || err.message);
			} finally {
				setIsLoading(false);
			}
		};

		if (slug) fetchDoaDetails();
	}, [slug]);

	if (isLoading) {
		return (
			<div className="pt-[4.2rem]">
				<TopBar withBackButton>Doa {slug}</TopBar>
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
			<TopBar withBackButton>Doa {slug}</TopBar>
			<div className="p-4">
				<ul className="space-y-4">
					{data?.map((item, index) => (
						<li
							key={index}
							className="bg-white p-4 rounded shadow flex flex-col space-y-2">
							<h2 className="text-lg font-bold text-teal-600 text-center">
								{item.judul}
							</h2>
							<p className="text-right text-xl text-gray-800 font-serif">
								{item.arab}
							</p>
							<p className="italic text-gray-600">{item.indo}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default DetailDoaPage;
