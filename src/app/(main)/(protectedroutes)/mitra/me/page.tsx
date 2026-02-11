"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { FiExternalLink, FiArrowRight, FiInfo, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "@/utils/context/auth_context";

/* ===============================
   INTERFACE
================================ */
interface MitraItem {
	id: number;
	mitra: string;
	deskripsi: string;
	external_url: string;
	gambar: string | null;
	kategori: {
		id: number | null;
		nama: string | null;
	};
    isRegistered?: boolean;
}

const MyMitraPage: React.FC = () => {
	const router = useRouter();
    const { auth } = useAuth();
	const API_URL = "https://admin.agpaiidigital.org";

    const [myMitraList, setMyMitraList] = useState<MitraItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

    /* ===============================
       FETCH MY MITRA
    ================================ */
	useEffect(() => {
		const fetchMyMitra = async () => {
			setLoading(true);
			try {
                // 1. Get All Mitra first
				const res = await axios.get<{ data: MitraItem[] }>(`${API_URL}/api/mitra`);
                const allMitra = res.data.data || [];

                // 2. Filter for Registered Only
                const registered: MitraItem[] = [];
                await Promise.all(allMitra.map(async (item) => {
                    try {
                        const checkRes = await axios.get(
                            `${API_URL}/api/mitra/checklistdata?user_id=${auth?.id}&mitra_id=${item.id}`
                        );
                        if (checkRes.data > 0) {
                            registered.push({ ...item, isRegistered: true });
                        }
                    } catch (err) {
                        console.error(`Error checking status for mitra ${item.id}`, err);
                    }
                }));

				setMyMitraList(registered);
			} catch (error) {
				console.error("Gagal mengambil data mitra:", error);
			} finally {
				setLoading(false);
			}
		};

        if (auth?.id) {
		    fetchMyMitra();
        }
	}, [auth?.id]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

	return (
		<div className="pt-[4.21rem] bg-gray-50 min-h-screen pb-20">
			<TopBar 
                withBackButton 
                tambahButton="/mitra/new" // Direct link
            >
                Mitra Saya
            </TopBar>

			<div className="px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
				{/* LOADING */}
				{loading && (
					<div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
					</div>
				)}

				{/* EMPTY STATE */}
				{!loading && myMitraList.length === 0 && (
					<div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiInfo className="w-8 h-8 text-gray-400" />
                        </div>
						<p className="text-gray-500 font-medium">Anda belum mendaftar pada mitra manapun.</p>
                        <button 
                            onClick={() => router.push('/mitra/new')}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
                        >
                            Tambah Mitra Baru
                        </button>
					</div>
				)}

				{/* LIST */}
				{!loading && myMitraList.length > 0 && (
					<motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
						{myMitraList.map((item) => (
							<motion.div
                                variants={itemAnim}
								key={item.id}
								onClick={() => router.push(`/mitra/${item.id}`)}
								className="group relative h-64 bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
							>
                                {/* Image Section */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    {item.gambar ? (
    									<img
    										src={item.gambar?.startsWith('http') ? item.gambar : `https://file.agpaiidigital.org/${item.gambar}`}
    										alt={item.mitra}
    										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    									/>
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-slate-400 font-medium text-sm">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    
                                    {/* Registered Badge */}
                                    <div className="absolute top-3 right-3">
                                        <div className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            <FiCheckCircle />
                                            Terdaftar
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-center px-5 py-3 bg-white relative">
                                    <div className="absolute -top-5 right-4 bg-green-500 text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300 z-10 flex items-center justify-center">
                                        <FiArrowRight className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1 group-hover:text-green-600 transition-colors">
    									{item.mitra}
    								</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                                        <span>Lihat Detail</span>
                                    </div>
                                </div>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default MyMitraPage;
