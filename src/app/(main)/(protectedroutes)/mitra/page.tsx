"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiExternalLink,
  FiArrowRight,
  FiInfo,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";
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
  judul_campaign?: string;
  // Helper fields for frontend state
  isRegistered?: boolean;
}

// Helper to safely parse image URL
const getValidImageUrl = (gambar: string | null) => {
  if (!gambar) return "";

  let url = gambar;

  // Try to parse if it's a JSON string (for multiple images)
  try {
    if (gambar.startsWith("[") || gambar.startsWith("{")) {
      const parsed = JSON.parse(gambar);
      if (Array.isArray(parsed) && parsed.length > 0) {
        url = parsed[0]; // Take first image
      } else if (typeof parsed === "string") {
        url = parsed;
      }
    }
  } catch (e) {
    // Not JSON, treat as string
  }

  if (url.startsWith("http")) return url;
  return `https://file.agpaiidigital.org/${url}`;
};

const MitraPage: React.FC = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const API_URL = "https://admin.agpaiidigital.org";

  const [mitraList, setMitraList] = useState<MitraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Check Role
  // Handle case where role is object (from API) or string (potential legacy/JWT)
  const roleName =
    typeof auth?.role === "object" ? auth?.role?.name : auth?.role;

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
        }>(`${API_URL}/api/mitra?t=${new Date().getTime()}`);

        const initialList = res.data.data || [];

        // Fetch details for each item to get judul_campaign
        const detailedList = await Promise.all(
          initialList.map(async (item) => {
            try {
              const detailRes = await axios.get(
                `${API_URL}/api/mitra/getdata/${item.id}?t=${new Date().getTime()}`,
              );
              return {
                ...item,
                judul_campaign:
                  detailRes.data.judul_campaign || item.judul_campaign, // Use detail if available
              };
            } catch (err) {
              console.error(`Failed to fetch detail for mitra ${item.id}`, err);
              return item;
            }
          }),
        );

        setMitraList(detailedList);
      } catch (error) {
        console.error("Gagal mengambil data mitra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMitra();
  }, []);

  // Filter Logic
  const filteredList = mitraList.filter(
    (item) =>
      item.mitra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.judul_campaign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleItemClick = (item: MitraItem) => {
    router.push(`/mitra/${item.id}`);
  };

  // Button to Go to "Mitra Saya" Page (for Mitra Role)
  const myMitraButton = (
    <button
      onClick={() => router.push("/mitra/me")}
      className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
    >
      <span>Mitra Saya</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </button>
  );

  /* ===============================
	   RENDER
	================================ */
  return (
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden pt-[4.21rem] bg-gray-50 min-h-screen">
        <TopBar
          withBackButton={!isMitra}
          rightContent={isMitra ? myMitraButton : null}
        >
          MITRA AGPAII
        </TopBar>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#006557] to-[#009788] text-white pb-16 pt-8 -mt-2 px-6 rounded-b-[3rem] shadow-lg mb-20 overflow-hidden">
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
              Berkolaborasi untuk memajukan Pendidikan Agama Islam di Indonesia
              dengan solusi dan layanan terbaik.
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
          {/* Action Bar */}
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
              <p className="text-gray-500 font-medium">
                Belum ada data mitra yang ditemukan.
              </p>
            </div>
          )}

          {!loading && filteredList.length > 0 && (
            <motion.div
              key={filteredList.map((i) => i.id).join(",")}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6"
            >
              {filteredList.map((item) => (
                <motion.div
                  variants={itemAnim}
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group relative h-64 bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {item.gambar ? (
                      <img
                        src={
                          getValidImageUrl(item.gambar) ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra)}&background=random`
                        }
                        alt={item.mitra}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-slate-400 font-medium text-sm">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    {item.kategori?.nama && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-white/90 backdrop-blur-md text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          {item.kategori.nama}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col justify-center px-5 py-3 bg-white relative">
                    <div className="absolute -top-5 right-4 p-2.5 rounded-full shadow-lg bg-green-500 text-white group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300 z-10 flex items-center justify-center">
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-green-600 transition-colors">
                      {item.judul_campaign || item.mitra}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                      <span>
                        {isMitra && !item.isRegistered
                          ? "Info Mitra"
                          : "Lihat Detail"}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block min-h-screen bg-transparent pt-[4.5rem]">
        {/* Desktop Header */}
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mitra Strategis AGPAII</h1>
              <p className="text-slate-500 text-sm mt-1">Berkolaborasi untuk memajukan Pendidikan Agama Islam di Indonesia</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar Desktop */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiSearch className="text-slate-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-4 py-2.5 rounded-xl leading-5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 border border-slate-200 transition-all text-sm"
                  placeholder="Cari mitra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isMitra && (
                <button
                  onClick={() => router.push("/mitra/me")}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 shadow-sm"
                >
                  Mitra Saya
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Count Label */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 font-medium">Menampilkan {filteredList.length} mitra</p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          )}

          {/* EMPTY */}
          {!loading && filteredList.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiInfo className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                Belum ada data mitra yang ditemukan.
              </p>
            </div>
          )}

          {/* GRID */}
          {!loading && filteredList.length > 0 && (
            <motion.div
              key={filteredList.map((i) => i.id).join(",")}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredList.map((item) => (
                <motion.div
                  variants={itemAnim}
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md hover:border-teal-200 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-40 w-full overflow-hidden">
                    {item.gambar ? (
                      <img
                        src={
                          getValidImageUrl(item.gambar) ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra)}&background=random`
                        }
                        alt={item.mitra}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-slate-400 font-medium text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent"></div>

                    {item.kategori?.nama && (
                      <div className="absolute top-2.5 left-2.5">
                        <div className="bg-white/90 backdrop-blur-md text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          {item.kategori.nama}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-4 py-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-teal-600 transition-colors">
                        {item.judul_campaign || item.mitra}
                      </h3>
                      {item.deskripsi && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-teal-600 mt-2.5 font-semibold">
                      <span>Lihat Detail</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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
    </>
  );
};

export default MitraPage;
