// components/tasbih/HistoryTasbih.tsx
"use client";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useEffect, useState } from "react";

const HistoryTasbihList = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadData = async () => {
		try {
			const response = await API.get("/tasbih");
			setData(response.data);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const formatDate = (dateString: any) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Riwayat Tasbih</TopBar>
			{/* <div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-bold text-[#009788]"></h1>
				<button
					onClick={() => {
						setRefreshing(true);
						loadData();
					}}
					className="rounded bg-[#009788] px-3 py-1 text-white">
					{refreshing ? "Memuat..." : "Segarkan"}
				</button>
			</div> */}

			{data.length === 0 ? (
				<p className="mt-8 text-center text-[#009788]">
					Tidak ada data tasbih tersimpan
				</p>
			) : (
				<div className="space-y-3">
					{data.map((item: any) => (
						<div
							key={item.id}
							className="rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg">
							<div className="mb-2 flex items-center justify-between">
								<h3 className="flex-1 text-base font-semibold text-[#009788]">
									{item.name}
								</h3>
								<span className="text-sm text-[#009788]">
									Jumlah: {item.count}
								</span>
							</div>
							<p className="text-xs italic text-gray-600">
								{formatDate(item.created_at)}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default HistoryTasbihList;
