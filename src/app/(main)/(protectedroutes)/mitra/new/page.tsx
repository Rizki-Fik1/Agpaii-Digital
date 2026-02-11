'use client';

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLink, FiAlignLeft, FiImage, FiUploadCloud, FiCheckCircle, FiBriefcase, FiX } from "react-icons/fi";
import { useAuth } from "@/utils/context/auth_context";

const API_URL = "https://admin.agpaiidigital.org";

/* ===============================
   INTERFACE
================================ */
interface KategoriMitra {
  id: number;
  kategori_mitra: string;
}

export default function CreateMitraPage() {
  const router = useRouter();
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
  });
  
  const [gambars, setGambars] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriMitra[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     AUTOFILL & FETCH DATA
  ================================= */
  useEffect(() => {
    // Fetch Kategori
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
    fetchKategori();

    // Autofill Brand Name
    if (auth) {
        const brand = auth.brand_name || auth.instansi_name || auth.name || "";
        setForm(prev => ({ ...prev, brand_name: brand }));
    }
  }, [auth]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setGambars(prev => [...prev, ...newFiles]);
        
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setGambars(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* ===============================
     SUBMIT HANDLER
  ================================= */
  const handleSubmit = async () => {
    if (
      !form.brand_name.trim() ||
      !form.judul_campaign.trim() ||
      !form.kategori_mitra_id ||
      !form.deskripsi.trim() ||
      !form.external_url.trim() ||
      gambars.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Semua field wajib diisi dan minimal 1 gambar",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);

    const fd = new FormData();
    // MAPPING SESUAI DB SCHEMA
    fd.append("mitra", form.brand_name.trim()); // Column 'mitra' = Nama Brand/Instansi
    fd.append("judul_campaign", form.judul_campaign.trim()); // Column 'judul_campaign' = Judul
    
    // Kirim brand_name juga just in case controller butuh
    fd.append("brand_name", form.brand_name.trim());
    
    fd.append("kategori_mitra_id", form.kategori_mitra_id);
    fd.append("deskripsi", form.deskripsi.trim());
    fd.append("external_url", form.external_url.trim());
    fd.append("created_by", auth?.id ? auth.id.toString() : "0");

    // Append multiple images
    // Note: User confirmed backend logic is adjusted for multiple images
    gambars.forEach((file) => {
        fd.append("gambar[]", file); 
    });

    try {
      await axios.post(`${API_URL}/api/mitra/store`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Mitra berhasil ditambahkan dan menunggu approval admin",
        confirmButtonColor: "#10B981",
      }).then(() => {
        router.push("/mitra/me");
      });
    } catch (err: any) {
      console.error("Error submitting mitra:", err);
      console.log("Error details:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat menyimpan mitra.";
      const validationErrors = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join('\n')
        : '';

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: validationErrors || errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  ================================= */
  return (
    <div className="min-h-screen bg-gray-50 pt-[6rem] px-4 pb-20">
      <TopBar withBackButton>Tambah Mitra</TopBar>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-8 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 mix-blend-overlay"></div>
             <h2 className="text-3xl font-bold mb-2 relative z-10">Campaign Baru</h2>
             <p className="text-green-50 text-base relative z-10 font-medium">Buat campaign atau program kemitraan baru.</p>
        </div>
        
        <div className="p-8 space-y-6">
            {/* Nama Brand (Autofill) */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiBriefcase className="text-green-600 text-lg" /> Nama Brand
                </label>
                <input
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                    placeholder="Nama Brand"
                    value={form.brand_name}
                    readOnly
                />
                <p className="text-xs text-gray-400 ml-1">*Diambil dari data profil Anda</p>
            </div>

            {/* Judul Campaign / Mitra */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUser className="text-green-600 text-lg" /> Judul Campaign / Mitra
                </label>
                <input
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Contoh: Beasiswa Pendidikan AGPAII 2024"
                    value={form.judul_campaign}
                    onChange={(e) => setForm({ ...form, judul_campaign: e.target.value })}
                />
            </div>

            {/* Kategori */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                   <FiCheckCircle className="text-green-600 text-lg" /> Kategori
                </label>
                <div className="relative">
                    <select
                        className="w-full border border-gray-200 px-4 py-3.5 rounded-xl appearance-none bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition text-gray-800"
                        value={form.kategori_mitra_id}
                        onChange={(e) => setForm({ ...form, kategori_mitra_id: e.target.value })}
                    >
                        <option value="">Pilih Kategori...</option>
                        {kategoriList.map((item) => (
                            <option key={item.id} value={item.id}>
                            {item.kategori_mitra}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

             {/* External URL */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiLink className="text-green-600 text-lg" /> Link External
                </label>
                <input
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="https://example.com/daftar"
                    value={form.external_url}
                    onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                />
            </div>

            {/* Deskripsi */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiAlignLeft className="text-green-600 text-lg" /> Deskripsi
                </label>
                <textarea
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Jelaskan detail campaign Anda..."
                    rows={5}
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
            </div>

            {/* Upload Gambar (Multiple) */}
            <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiImage className="text-green-600 text-lg" /> Galeri Campaign (Bisa lebih dari 1)
                </label>
                
                {/* Image Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                    <AnimatePresence>
                        {previews.map((src, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200 group"
                            >
                                <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                        
                        {/* Upload Button Block */}
                        <div className="aspect-square border-2 border-dashed border-green-300 rounded-xl bg-green-50/50 hover:bg-green-50 transition cursor-pointer relative flex flex-col items-center justify-center text-green-600 hover:text-green-700 group">
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
                <p className="text-xs text-gray-400">Format: PNG, JPG, JPEG (Maks. 5MB per file)</p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                >
                    {loading ? (
                        <>
                        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Menyimpan...</span>
                        </>
                    ) : (
                        "Simpan Campaign"
                    )}
                </button>
            </div>

        </div>
      </motion.div>
    </div>
  );
}