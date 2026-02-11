"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { FiPlus, FiExternalLink, FiArrowRight, FiInfo, FiSearch, FiCheckCircle } from "react-icons/fi";
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
    // Helper fields for frontend state
    isRegistered?: boolean;
}

const MitraPage: React.FC = () => {
	const router = useRouter();
    const { auth } = useAuth();
	const API_URL = "https://admin.agpaiidigital.org";

	const [mitraList, setMitraList] = useState<MitraItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    // Check Role
    // Handle case where role is object (from API) or string (potential legacy/JWT)
    const roleName = typeof auth?.role === 'object' ? auth?.role?.name : auth?.role;
    
    const isGuru = roleName === "Guru" || roleName === "guru";
    const isMitra = roleName === "Mitra" || roleName === "mitra";

	/* ===============================
	   FETCH ALL MITRA
	================================ */
	useEffect(() => {
		const fetchMitra = async () => {
			setLoading(true);
			try {
				const res = await axios.get<{
					success: boolean;
					data: MitraItem[];
				}>(`${API_URL}/api/mitra`);
                
				setMitraList(res.data.data || []);
			} catch (error) {
				console.error("Gagal mengambil data mitra:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchMitra();
	}, []);

    // Filter Logic
    const filteredList = mitraList.filter(item => 
        (item.mitra.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleItemClick = (item: MitraItem) => {
        router.push(`/mitra/${item.id}`);
    };

    // Button to Go to "Mitra Saya" Page (for Mitra Role)
    const myMitraButton = (
        <button
            onClick={() => router.push('/mitra/me')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
        >
            <span>Mitra Saya</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </button>
    );

	/* ===============================
	   RENDER
	================================ */
	return (
		<div className="pt-[4.21rem] bg-gray-50 min-h-screen">
			<TopBar 
                withBackButton 
                rightContent={isMitra ? myMitraButton : null}
            >
                MITRA AGPAII
            </TopBar>

            {/* Hero Section */}
            <div className="relative bg-[#266565] text-white pb-16 pt-8 -mt-2 px-6 rounded-b-[3rem] shadow-lg mb-20 overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl font-bold"
                    >
                        Mitra Strategis AGPAII
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-green-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
                    >
                         Berkolaborasi untuk memajukan Pendidikan Agama Islam di Indonesia dengan solusi dan layanan terbaik.
                    </motion.p>
                    
                    {/* Search Bar */}
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative max-w-md mx-auto mt-6"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
                            placeholder="Cari mitra..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </motion.div>
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-green-400 opacity-10 blur-2xl"></div>
            </div>


			<div className="px-4 sm:px-6 pb-20 max-w-7xl mx-auto -mt-16 relative z-20">
                
                {/* Action Bar (Title only) */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-600 hidden sm:block bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm">
                        Daftar Mitra
                    </h2>
                </div>

				{/* LOADING */}
				{loading && (
					<div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
					</div>
				)}

				{/* LIST MITRA */}
				{!loading && filteredList.length === 0 && (
					<div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiInfo className="w-8 h-8 text-gray-400" />
                        </div>
						<p className="text-gray-500 font-medium">Belum ada data mitra yang ditemukan.</p>
					</div>
				)}

				{!loading && filteredList.length > 0 && (
					<motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
						{filteredList.map((item) => (
							<motion.div
                                variants={itemAnim}
								key={item.id}
								onClick={() => handleItemClick(item)}
								className="group relative h-64 bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
							>
								{/* Image Section (Top ~75%) */}
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
                                    
                                    {/* Gradient at bottom of image for blending */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                                    {/* Floating Category Badge */}
                                    {item.kategori?.nama && (
                                        <div className="absolute top-3 left-3">
                                            <div className="bg-white/90 backdrop-blur-md text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                {item.kategori.nama}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section (Bottom ~25%) */}
                                <div className="flex-1 flex flex-col justify-center px-5 py-3 bg-white relative">
                                    {/* Action Icon Floating Button */}
                                    <div className="absolute -top-5 right-4 p-2.5 rounded-full shadow-lg bg-green-500 text-white group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300 z-10 flex items-center justify-center">
                                        <FiArrowRight className="w-4 h-4" />
                                    </div>

                                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1 group-hover:text-green-600 transition-colors">
    									{item.mitra}
    								</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                                        <span>
                                            {isMitra && !item.isRegistered 
                                                ? "Info Mitra" 
                                                : "Lihat Detail"
                                            }
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
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

export default MitraPage;
