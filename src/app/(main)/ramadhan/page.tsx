"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter } from "next/navigation";
import React from "react";

const IndexRamadhan = () => {
	const router = useRouter();

	const handleClick = (item: string) => {
		router.push(`/ramadhan/${item}`);
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">

			{/* TOPBAR DENGAN ICON BACK */}
			<TopBar>
				<div className="flex items-center gap-2">
					<button
						onClick={() => router.back()}
						className="text-xl leading-none"
					>
						&lt;
					</button>
					<span>Ramadhan</span>
				</div>
			</TopBar>

			<img
				src="/img/ramadhan.png"
				alt="ramadhan"
				className="w-full"
			/>

			<div className="grid grid-cols-2 mt-4">
				<button
					onClick={() => handleClick("imsak")}
					className="hover:bg-slate-100 text-white font-bold rounded focus:outline-none focus:shadow-outline"
				>
					<img src="/img/imsak.png" alt="imsak" className="w-full" />
				</button>

				<button
					onClick={() => handleClick("idul-fitri")}
					className="hover:bg-slate-100 text-white font-bold rounded focus:outline-none focus:shadow-outline"
				>
					<img src="/img/idul.png" alt="idul" className="w-full" />
				</button>

				<button
					onClick={() => handleClick("tarawih")}
					className="hover:bg-slate-100 text-white font-bold rounded focus:outline-none focus:shadow-outline"
				>
					<img src="/img/tarawih.png" alt="tarawih" className="w-full" />
				</button>

				<button
					onClick={() => handleClick("doa")}
					className="hover:bg-slate-100 text-white font-bold rounded focus:outline-none focus:shadow-outline"
				>
					<img
						src="/img/doa-ramadan.png"
						alt="doa-ramadan"
						className="w-full"
					/>
				</button>
			</div>
		</div>
	);
};

export default IndexRamadhan;
