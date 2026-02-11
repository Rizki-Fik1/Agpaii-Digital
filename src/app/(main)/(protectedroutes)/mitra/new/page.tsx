'use client';

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FiUser, FiLink, FiAlignLeft, FiImage, FiUploadCloud, FiCheckCircle } from "react-icons/fi";

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

  /* ===============================
     FORM STATE
  ================================= */
  const [form, setForm] = useState({
    mitra: "",
    kategori_mitra_id: "",
    deskripsi: "",
    external_url: "",
  });
  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [kategoriList, setKategoriList] = useState<KategoriMitra[]>([]);
  const [loading, setLoading] = useState(false);
  const CREATED_BY = 1; // nanti dari auth user

  /* ===============================
     FETCH KATEGORI MITRA
  ================================= */
  useEffect(() => {
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
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setGambar(file);
        setPreview(URL.createObjectURL(file));
    }
  }

  /* ===============================
     SUBMIT HANDLER
  ================================= */
  const handleSubmit = async () => {
    if (
      !form.mitra.trim() ||
      !form.kategori_mitra_id ||
      !form.deskripsi.trim() ||
      !form.external_url.trim() ||
      !gambar
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
    fd.append("mitra", form.mitra.trim());
    fd.append("kategori_mitra_id", form.kategori_mitra_id);
    fd.append("deskripsi", form.deskripsi.trim());
    fd.append("external_url", form.external_url.trim());
    fd.append("gambar", gambar);
    fd.append("created_by", CREATED_BY.toString());

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
        router.push("/mitra");
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan mitra. Silakan coba lagi.",
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
    <div className="min-h-screen bg-gray-50 pt-[6rem] px-4 pb-10">
      <TopBar withBackButton>Tambah Mitra</TopBar>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-8 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 mix-blend-overlay"></div>
             <h2 className="text-3xl font-bold mb-2 relative z-10">Daftarkan Mitra Baru</h2>
             <p className="text-green-50 text-base relative z-10 font-medium">Lengkapi formulir di bawah ini untuk menambahkan mitra baru ke dalam ekosistem AGPAII.</p>
        </div>
        
        <div className="p-8 space-y-6">
            {/* Nama Mitra */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUser className="text-green-600 text-lg" /> Nama Mitra
                </label>
                <input
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Masukkan nama mitra..."
                    value={form.mitra}
                    onChange={(e) => setForm({ ...form, mitra: e.target.value })}
                />
            </div>

            {/* Kategori */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                   <FiCheckCircle className="text-green-600 text-lg" /> Kategori Mitra
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
                    <FiLink className="text-green-600 text-lg" /> Website / URL Eksternal
                </label>
                <input
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="https://example.com"
                    value={form.external_url}
                    onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                />
            </div>

            {/* Deskripsi */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiAlignLeft className="text-green-600 text-lg" /> Deskripsi Singkat
                </label>
                <textarea
                    className="w-full border border-gray-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Jelaskan secara singkat tentang mitra ini..."
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
            </div>

            {/* Upload Gambar */}
            <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiImage className="text-green-600 text-lg" /> Logo / Gambar Mitra
                </label>
                <div className="border-2 border-dashed border-green-200 rounded-2xl p-6 text-center hover:bg-green-50 transition cursor-pointer relative group bg-green-50/30">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {preview ? (
                        <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition">
                             <img src={preview} alt="Preview" className="w-full h-full object-contain bg-gray-100" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <p className="text-white font-medium flex items-center gap-2"><FiUploadCloud /> Ganti Gambar</p>
                             </div>
                        </div>
                    ) : (
                         <div className="text-gray-500 flex flex-col items-center py-4">
                            <div className="bg-green-100 p-4 rounded-full mb-3 text-green-600 group-hover:scale-110 transition duration-300">
                                <FiUploadCloud className="w-8 h-8" />
                            </div>
                            <p className="text-base font-medium text-gray-700">Klik atau seret gambar ke sini</p>
                            <p className="text-xs text-gray-400 mt-1">Format: PNG, JPG (Maks. 5MB)</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
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
                        "Simpan Mitra"
                    )}
                </button>
            </div>

        </div>
      </motion.div>
    </div>
  );
}