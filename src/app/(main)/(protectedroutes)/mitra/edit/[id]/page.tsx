"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiLink,
  FiAlignLeft,
  FiImage,
  FiUploadCloud,
  FiCheckCircle,
  FiBriefcase,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/utils/context/auth_context";

const API_URL = "https://admin.agpaiidigital.org";

/* ===============================
   INTERFACE
================================ */
interface KategoriMitra {
  id: number;
  kategori_mitra: string;
}

export default function EditMitraPage() {
  const router = useRouter();
  const { id } = useParams();
  const { auth } = useAuth();

  /* ===============================
     FORM STATE
  ================================= */
  const [form, setForm] = useState({
    brand_name: "", // Autofill
    judul_campaign: "", // Judul Campaign
    kategori_mitra_id: "",
    deskripsi: "",
    external_url: "",
    is_approved: 0,
    approved_at: null as string | null, // Init
  });

  const [gambars, setGambars] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // For existing images
  const [kategoriList, setKategoriList] = useState<KategoriMitra[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ===============================
     FETCH DATA
  ================================= */
  useEffect(() => {
    // 1. Fetch Kategori
    const fetchKategori = async () => {
      try {
        const res = await axios.get<{
          success: boolean;
          data: KategoriMitra[];
        }>(`${API_URL}/api/mitra/kategori`);
        setKategoriList(res.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil kategori mitra:", error);
      }
    };

    // 2. Fetch Existing Data
    const fetchExistingData = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${API_URL}/api/mitra/getdata/${id}`);
        const data = res.data;
        console.log(
          "DEBUG: Edit Mitra Data (Full):",
          JSON.stringify(data, null, 2),
        );

        // Fetch list to get category if auth exists (since getdata is missing it)
        let categoryIdFromList = null;
        let approvalStatusFromList = null; // Variable for status
        let approvedAtVal = null; // Var for approved_at

        if (auth?.id) {
          try {
            // Add timestamp to avoid caching
            const resList = await axios.get(
              `${API_URL}/api/mitra/by-user?user_id=${auth.id}&t=${new Date().getTime()}`,
            );
            const listData = resList.data.data || [];
            const myItem = listData.find((item: any) => item.id == id);

            if (myItem) {
              console.log(
                "DEBUG: Found Item in List:",
                JSON.stringify(myItem, null, 2),
              );
              categoryIdFromList = myItem?.kategori?.id;
              approvalStatusFromList = myItem?.is_approved;
              approvedAtVal = myItem?.approved_at || null; // Capture here while myItem is in scope
            } else {
              console.log("DEBUG: Item NOT found in list for ID:", id);
            }
          } catch (e) {
            console.error("Failed to fetch list for category/status", e);
          }
        }

        // Normalize status: Ensure it's 1 or 0
        // If API returns boolean true or string "1", treat as 1.
        let normalizedStatus = 0;

        if (
          approvalStatusFromList !== null &&
          approvalStatusFromList !== undefined
        ) {
          if (
            approvalStatusFromList === true ||
            approvalStatusFromList == 1 ||
            approvalStatusFromList === "1"
          ) {
            normalizedStatus = 1;
          } else {
            normalizedStatus = 0; // false, 0, "0"
          }
        } else {
          // Fallback to data.is_approved if list didn't have it (though data usually doesn't have it)
          normalizedStatus =
            data.is_approved == 1 || data.is_approved === true ? 1 : 0;
        }
        console.log("DEBUG: Normalized Status to set:", normalizedStatus);
        console.log("DEBUG: Approved At:", approvedAtVal);

        setForm({
          brand_name: data.mitra || "",
          judul_campaign: data.judul_campaign || "",
          // Use list data as primary source for category if available
          kategori_mitra_id:
            categoryIdFromList ||
            data.kategori_mitra_id ||
            data.kategori_id ||
            (data.kategori_mitra ? data.kategori_mitra.id : "") ||
            "",
          deskripsi: data.deskripsi || "",
          external_url: data.external_url || "",
          is_approved: normalizedStatus,
          approved_at: approvedAtVal, // Add to form
        });

        // Parse existing images
        let images: string[] = [];

        if (Array.isArray(data.images)) {
          images = data.images;
        } else if (typeof data.images === "string") {
          images = [data.images];
        }

        setExistingImages(images);
      } catch (error) {
        console.error("Gagal mengambil detail mitra:", error);
        Swal.fire("Error", "Gagal memuat data campaign", "error");
      } finally {
        setFetching(false);
      }
    };

    fetchKategori();
    fetchExistingData();
  }, [id, auth]); // Added auth dependency

  // Autofill Brand Name if not set (fallback)
  useEffect(() => {
    if (auth && !form.brand_name) {
      const brand = auth.brand_name || auth.instansi_name || auth.name || "";
      setForm((prev) => ({ ...prev, brand_name: brand }));
    }
  }, [auth]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setGambars((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setGambars((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    // Logic to track deleted existing images if API supports selective delete
    // For now, simpler approach: Just remove from UI state
    // Note: Backend logic for partial update of images might be complex. Usually replace all or append.
    // Often better to re-upload everything or sending IDs to keep.
    // Given typical Laravel update:
    // If we don't send new images, it keeps old ones? Or we might need to handle this carefully.
    // Let's assume we just remove from view for now.
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper for image URL
  const getValidImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `https://file.agpaiidigital.org/${url}`;
  };

  /* ===============================
     SUBMIT HANDLER (UPDATE)
  ================================= */
  const handleSubmit = async () => {
    if (
      !form.brand_name.trim() ||
      !form.judul_campaign.trim() ||
      !form.kategori_mitra_id ||
      !form.deskripsi.trim() ||
      !form.external_url.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Semua field wajib diisi",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);

    const fd = new FormData();
    // Required fields
    fd.append("mitra", form.brand_name.trim());
    fd.append("judul_campaign", form.judul_campaign.trim());
    fd.append("brand_name", form.brand_name.trim());
    fd.append("kategori_mitra_id", String(form.kategori_mitra_id));
    fd.append("deskripsi", form.deskripsi.trim());
    fd.append("external_url", form.external_url.trim());
    fd.append("created_by", auth?.id ? auth.id.toString() : "0");
    // EXPLICITLY Send status 1 or 0 (normalized)
    fd.append("is_approved", String(form.is_approved));
    // Try sending approved_at to prevent reset
    if (form.approved_at) {
      fd.append("approved_at", form.approved_at);
    }

    // Images
    // Strategy: Send new images. Backend logic dictates if it appends or replaces.
    // Usually 'update' replaces. If we want to keep existing, we might need to send them again?
    // Or maybe the backend only updates if file is present.
    // Let's try sending new images if any.
    gambars.forEach((file) => {
      fd.append("gambar[]", file);
      fd.append("images[]", file); // Add duplicate for compatibility
    });

    // DEBUG: Log FormData
    console.log("DEBUG: Submitting FormData:");
    for (let [key, value] of fd.entries()) {
      console.log(`${key}:`, value);
    }

    // If we want to keep existing images and delete some, we might need a separate field like 'kept_images[]' or 'deleted_images[]'.
    // Without backend insight, a safe bet is often difficult.
    // Let's try standard update. If `gambar` is present, it might overwrite.

    try {
      // POST to /api/mitra/update/{id}
      await axios.post(`${API_URL}/api/mitra/update/${id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data campaign berhasil diperbarui",
        confirmButtonColor: "#10B981",
      }).then(() => {
        router.push("/mitra/me");
      });
    } catch (err: any) {
      console.error("Error updating mitra:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui data.";
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  ================================= */
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[6rem] px-4 pb-20">
      <TopBar withBackButton>Edit Mitra</TopBar>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-8 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 mix-blend-overlay"></div>
          <h2 className="text-3xl font-bold mb-2 relative z-10">
            Edit Campaign
          </h2>
          <p className="text-blue-50 text-base relative z-10 font-medium">
            Perbarui informasi campaign Anda.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Nama Brand (Autofill) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiBriefcase className="text-blue-600 text-lg" /> Nama Brand
            </label>
            <input
              className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              placeholder="Nama Brand"
              value={form.brand_name}
              readOnly
            />
          </div>

          {/* Judul Campaign / Mitra */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiUser className="text-blue-600 text-lg" /> Judul Campaign /
              Mitra
            </label>
            <input
              className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
              placeholder="Contoh: Beasiswa Pendidikan AGPAII 2024"
              value={form.judul_campaign}
              onChange={(e) =>
                setForm({ ...form, judul_campaign: e.target.value })
              }
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiCheckCircle className="text-blue-600 text-lg" /> Kategori
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 px-4 py-3.5 rounded-xl appearance-none bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-gray-800"
                value={form.kategori_mitra_id}
                onChange={(e) =>
                  setForm({ ...form, kategori_mitra_id: e.target.value })
                }
              >
                <option value="">Pilih Kategori...</option>
                {kategoriList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.kategori_mitra}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiLink className="text-blue-600 text-lg" /> Link External
            </label>
            <input
              className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
              placeholder="https://example.com/daftar"
              value={form.external_url}
              onChange={(e) =>
                setForm({ ...form, external_url: e.target.value })
              }
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiAlignLeft className="text-blue-600 text-lg" /> Deskripsi
            </label>
            <textarea
              className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
              placeholder="Jelaskan detail campaign Anda..."
              rows={5}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {/* Upload Gambar (Multiple) */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiImage className="text-blue-600 text-lg" /> Galeri Campaign
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
              <AnimatePresence>
                {/* Existing Images */}
                {existingImages.map((src, index) => (
                  <motion.div
                    key={`existing-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-blue-200 group"
                  >
                    <img
                      src={getValidImageUrl(src)}
                      alt={`Existing ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs text-center p-2">
                      Existing
                    </div>
                  </motion.div>
                ))}

                {/* New Previews */}
                {previews.map((src, index) => (
                  <motion.div
                    key={`new-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200 group"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {/* Upload Button Block */}
                <div className="aspect-square border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer relative flex flex-col items-center justify-center text-blue-600 hover:text-blue-700 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="group-hover:scale-110 transition duration-300 mb-2">
                    <FiUploadCloud className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-semibold">Tambah Foto</span>
                </div>
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-400">
              Upload gambar baru untuk mengganti/menambah gambar yang sudah ada.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
