"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiArrowRight,
  FiInfo,
  FiCheckCircle,
  FiEdit,
  FiTrash,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "@/utils/context/auth_context";

/* ===============================
   INTERFACE
================================ */
interface MitraItem {
  id: number;
  mitra: string;
  judul_campaign?: string;
  deskripsi: string;
  external_url: string;
  gambar: string | null;
  created_by?: number;
  kategori: {
    id: number | null;
    nama: string | null;
  };
  isRegistered?: boolean;
  isOwner?: boolean;
  is_approved?: number | string; // 0, 1, or 2
  approved_at?: string | null;
}

// Helper to safely parse image URL
const getValidImageUrl = (gambar: string | null) => {
  if (!gambar) return "";
  let url = gambar;
  try {
    if (gambar.startsWith("[") || gambar.startsWith("{")) {
      const parsed = JSON.parse(gambar);
      if (Array.isArray(parsed) && parsed.length > 0) {
        url = parsed[0];
      }
    }
  } catch (e) {}

  if (url.startsWith("http")) return url;
  return `https://file.agpaiidigital.org/${url}`;
};

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
        // 1. Fetch "Created By Me" using the new endpoint
        // This endpoint returns all created items (approved or pending)
        const resCreated = await axios.get<{ data: any[] }>(
          `${API_URL}/api/mitra/by-user`,
          {
            params: { user_id: auth?.id },
          },
        );

        // Map response to MitraItem
        const createdByMe = (resCreated.data.data || []).map((item: any) => ({
          ...item,
          gambar: item.images && item.images.length > 0 ? item.images[0] : null,
          isRegistered: true, // Mark as mine
          isOwner: true, // Helper to distinguish owner vs joined
        }));

        // 2. Fetch "Registered" (Joined) Mitra
        // We still need to check global list for items I joined but didn't create
        // Optimization: Just fetch all approved and check status, OR if we had a "my-joined-mitra" endpoint
        // For now, let's keep the existing logic for "joined" items but merge with "created"

        const resAll = await axios.get<{ data: MitraItem[] }>(
          `${API_URL}/api/mitra`,
        );
        const allMitra = resAll.data.data || [];

        const joined: MitraItem[] = [];
        await Promise.all(
          allMitra.map(async (item) => {
            // Skip if already in createdByMe
            if (createdByMe.find((c: any) => c.id === item.id)) return;

            try {
              const checkRes = await axios.get(
                `${API_URL}/api/mitra/checklistdata?user_id=${auth?.id}&mitra_id=${item.id}`,
              );
              if (checkRes.data > 0) {
                joined.push({ ...item, isRegistered: true, isOwner: false });
              }
            } catch (err: any) {
              // Silent fail for check status (avoid console spam especially if 404)
              if (err.response && err.response.status !== 404) {
                console.warn(`Error checking status for mitra ${item.id}`, err);
              }
            }
          }),
        );

        // Merge lists
        setMyMitraList([...createdByMe, ...joined]);
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: number,
    created_by?: number,
  ) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Campaign yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/mitra/delete/${id}`, {
          data: {
            created_by: created_by,
          },
        });

        setMyMitraList((prev) => prev.filter((item) => item.id !== id));

        Swal.fire("Terhapus!", "Campaign berhasil dihapus.", "success");
      } catch (error) {
        console.error("Gagal menghapus mitra:", error);
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
      }
    }
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
            <p className="text-gray-500 font-medium">
              Anda belum mendaftar pada mitra manapun.
            </p>
            <button
              onClick={() => router.push("/mitra/new")}
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
                      src={
                        getValidImageUrl(item.gambar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra || "Mitra")}&background=random`
                      }
                      alt={item.mitra}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mitra || "Mitra")}&background=random`;
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

                  {/* Registered Badge */}
                  {/* Badges */}
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-20">
                    {item.isOwner && Number(item.is_approved) === 0 && (
                      <div className="bg-yellow-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>⏳</span>
                        Menunggu Verifikasi
                      </div>
                    )}

                    {item.isOwner && Number(item.is_approved) === 1 && (
                      <div className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        Disetujui
                      </div>
                    )}

                    {item.isOwner && Number(item.is_approved) === 2 && (
                      <div className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <FiXCircle className="w-3 h-3" />
                        Ditolak
                      </div>
                    )}

                    {item.isRegistered && !item.isOwner && (
                      <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        Terdaftar
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center px-5 py-3 bg-white relative">
                  <div className="absolute -top-5 right-4 bg-green-500 text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300 z-10 flex items-center justify-center">
                    <FiArrowRight className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg pb-4 truncate group-hover:text-green-600 transition-colors">
                    {item.judul_campaign || item.mitra}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                    <span>Lihat Detail</span>
                  </div>

                  {/* Action Buttons for Owner */}
                  {item.isOwner && (
                    <div className="absolute bottom-2 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/mitra/edit/${item.id}`);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition shadow-sm"
                        title="Edit Campaign"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) =>
                          handleDelete(e, item.id, item.created_by)
                        }
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition shadow-sm"
                        title="Hapus Campaign"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
