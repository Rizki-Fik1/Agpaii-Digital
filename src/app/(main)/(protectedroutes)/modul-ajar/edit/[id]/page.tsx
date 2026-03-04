"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";

interface JenjangOption {
  id: number;
  name: string;
}

interface FaseOption {
  id: number;
  name: string;
  description: string;
  id_jenjang?: number;
}

interface ContentItem {
  id?: number;
  content_type: "materi" | "assessment";
  judul: string;
  file_type: "youtube" | "pdf" | "doc" | "excel" | "ppt";
  youtube_url?: string;
  file_path?: string;
  file?: File | null;
}

interface ModuleData {
  id: number;
  judul: string;
  jenjang_id: number;
  fase_id: number;
  deskripsi_singkat: string;
  tentang_modul: string;
  tujuan_pembelajaran: string;
  thumbnail?: string;
  contents: ContentItem[];
  is_repost?: boolean;
  original_judul?: string; // Judul modul asli (untuk validasi repost)
}

const EditPerangkatAjar: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { auth: user } = useAuth();

  const [jenjangOptions, setJenjangOptions] = useState<JenjangOption[]>([]);
  const [allFaseOptions, setAllFaseOptions] = useState<FaseOption[]>([]);
  const [faseOptions, setFaseOptions] = useState<FaseOption[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string>("");

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isNewThumbnail, setIsNewThumbnail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const contentTypeOptions = ["materi", "assessment"];
  const fileTypeOptions = ["youtube", "pdf", "doc", "excel", "ppt"];

  const FILE_BASE_URL = "http://file.agpaiidigital.org";

  useEffect(() => {
    if (id) {
      fetchMasterData();
      fetchModuleDetail();
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [jenjangRes, faseRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/jenjang`
        ),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/fase`),
      ]);

      setJenjangOptions(
        jenjangRes.data.data.map((j: any) => ({
          id: j.id_jenjang,
          name: j.nama_jenjang,
        }))
      );

      setAllFaseOptions(
        faseRes.data.data.map((f: any) => ({
          id: f.id_fase,
          name: f.nama_fase,
          description: f.deskripsi || "",
          id_jenjang: f.id_jenjang,
        }))
      );
    } catch (error) {
      console.error("Error fetching master data:", error);
      alert("Gagal memuat data jenjang/fase");
    }
  };

  const fetchModuleDetail = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/${id}`
      );
      if (res.data.success) {
        const data = res.data.data;
        setModuleData({
          id: data.id,
          judul: data.judul,
          jenjang_id: data.jenjang_id,
          fase_id: data.fase_id,
          deskripsi_singkat: data.deskripsi_singkat,
          tentang_modul: data.tentang_modul,
          tujuan_pembelajaran: data.tujuan_pembelajaran,
          thumbnail: data.thumbnail,
          is_repost: data.is_repost || false,
          original_judul: data.repost?.judul || data.repost_source?.judul || null,
          contents: [...data.materi, ...data.assessments].map((c: any) => ({
            id: c.id,
            content_type: c.content_type,
            judul: c.judul,
            file_type: c.file_type,
            youtube_url: c.youtube_url,
            file_path: c.file_path,
            file: null,
          })),
        });

        setSelectedJenjang(String(data.jenjang_id));

        if (data.thumbnail) {
          setThumbnailPreview(`${FILE_BASE_URL}/${data.thumbnail}`);
          setIsNewThumbnail(false);
        }
      }
    } catch (error) {
      console.error("Error fetching module:", error);
      alert("Gagal memuat data modul");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJenjang && allFaseOptions.length > 0) {
      const jenjangId = parseInt(selectedJenjang);
      setFaseOptions(allFaseOptions.filter((f) => f.id_jenjang === jenjangId));
    } else {
      setFaseOptions([]);
    }
  }, [selectedJenjang, allFaseOptions]);

  const handleAddContent = () => {
    if (!moduleData) return;
    setModuleData({
      ...moduleData,
      contents: [
        ...moduleData.contents,
        {
          content_type: "materi",
          judul: "",
          file_type: "pdf",
          youtube_url: "",
          file_path: "",
          file: null,
        },
      ],
    });
  };

  const handleContentChange = (
    index: number,
    field: keyof ContentItem,
    value: string
  ) => {
    if (!moduleData) return;
    const newContents = [...moduleData.contents];
    (newContents[index] as any)[field] = value;
    setModuleData({ ...moduleData, contents: newContents });
  };

  const handleContentFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!moduleData) return;
    const file = e.target.files?.[0] ?? null;
    const newContents = [...moduleData.contents];
    newContents[index].file = file;
    newContents[index].file_path = file
      ? file.name
      : newContents[index].file_path || "";
    setModuleData({ ...moduleData, contents: newContents });
  };

  // Hapus konten baru (belum disimpan di DB)
  const handleRemoveContent = (index: number) => {
    if (!moduleData) return;
    const newContents = moduleData.contents.filter((_, i) => i !== index);
    setModuleData({ ...moduleData, contents: newContents });
  };

  // Hapus konten existing (sudah tersimpan di DB) via API
  const handleDeleteExistingContent = async (
    contentId: number,
    index: number
  ) => {
    const confirmed = window.confirm(
      "Konten ini akan dihapus permanen dan tidak dapat dikembalikan. Lanjutkan?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/content/${contentId}`
      );

      // Hapus dari state lokal
      if (moduleData) {
        const newContents = moduleData.contents.filter((_, i) => i !== index);
        setModuleData({ ...moduleData, contents: newContents });
      }

      alert("Konten berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus konten:", error);
      alert("Gagal menghapus konten. Silakan coba lagi.");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!moduleData) return;
    const file = e.target.files?.[0] ?? null;

    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setIsNewThumbnail(true);
    } else {
      if (moduleData.thumbnail) {
        setThumbnailPreview(`${FILE_BASE_URL}/${moduleData.thumbnail}`);
      } else {
        setThumbnailPreview(null);
      }
      setIsNewThumbnail(false);
    }
  };

  const handleSubmit = async () => {
    if (!moduleData || !user?.id) {
      alert("Data tidak lengkap atau user tidak terdeteksi");
      return;
    }

    const required = [
      moduleData.judul,
      moduleData.jenjang_id,
      moduleData.fase_id,
      moduleData.deskripsi_singkat,
      moduleData.tentang_modul,
      moduleData.tujuan_pembelajaran,
    ];
    if (required.some((v) => !v)) {
      alert("Harap isi semua field wajib!");
      return;
    }

    // Validasi untuk modul repost: judul tidak boleh sama dengan original
    if (moduleData.is_repost && moduleData.original_judul) {
      const normalizeTitle = (title: string) => 
        title.replace(/\s+/g, "").toLowerCase();
      
      if (normalizeTitle(moduleData.judul) === normalizeTitle(moduleData.original_judul)) {
        alert("Judul modul tidak boleh sama dengan modul asli!");
        return;
      }
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("judul", moduleData.judul);
      data.append("jenjang_id", String(moduleData.jenjang_id));
      data.append("fase_id", String(moduleData.fase_id));
      data.append("deskripsi_singkat", moduleData.deskripsi_singkat);
      data.append("tentang_modul", moduleData.tentang_modul);
      data.append("tujuan_pembelajaran", moduleData.tujuan_pembelajaran);

      if (isNewThumbnail) {
        const thumbnailInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        const file = thumbnailInput?.files?.[0];
        if (file) data.append("thumbnail", file);
      }

      moduleData.contents.forEach((c, idx) => {
        if (c.id) data.append(`contents[${idx}][id]`, String(c.id));
        data.append(`contents[${idx}][content_type]`, c.content_type);
        data.append(`contents[${idx}][judul]`, c.judul);
        data.append(`contents[${idx}][file_type]`, c.file_type);

        if (c.file_type === "youtube") {
          data.append(`contents[${idx}][youtube_url]`, c.youtube_url || "");
        } else {
          if (c.file) {
            data.append(`contents_files[${idx}]`, c.file as File);
          }
          if (c.file_path) {
            data.append(`contents[${idx}][file_path]`, c.file_path);
          }
        }
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        alert("Modul berhasil diperbarui!");
        router.push("/modul-ajar");
      } else {
        alert(response.data.message || "Gagal memperbarui modul");
      }
    } catch (error: any) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.errors ||
          "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!moduleData) {
    return (
      <div className="pt-[5.21rem] p-6 bg-white min-h-screen">
        <TopBar withBackButton>Edit Perangkat Ajar</TopBar>
        <div className="text-center text-red-500 mt-10">
          Modul tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[5.21rem] p-6 bg-white min-h-screen">
      <TopBar withBackButton>Edit Perangkat Ajar</TopBar>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Judul
            {moduleData.is_repost && (
              <span className="ml-2 text-xs text-purple-600 font-normal">
                (Modul Repost)
              </span>
            )}
          </label>
          <input
            type="text"
            className={`w-full p-3 border rounded-lg ${
              moduleData.is_repost 
                ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
                : ""
            }`}
            value={moduleData.judul}
            onChange={(e) =>
              setModuleData({ ...moduleData, judul: e.target.value })
            }
            disabled={moduleData.is_repost}
            readOnly={moduleData.is_repost}
          />
          {moduleData.is_repost && moduleData.original_judul && (
            <p className="text-xs text-red-500 mt-2">
              ⚠️ Judul tidak boleh sama dengan modul asli: "{moduleData.original_judul}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Jenjang</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={moduleData.jenjang_id}
              onChange={(e) => {
                setModuleData({
                  ...moduleData,
                  jenjang_id: Number(e.target.value),
                });
                setSelectedJenjang(e.target.value);
              }}
            >
              <option value="">Pilih Jenjang</option>
              {jenjangOptions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Fase</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={moduleData.fase_id}
              onChange={(e) =>
                setModuleData({
                  ...moduleData,
                  fase_id: Number(e.target.value),
                })
              }
            >
              <option value="">Pilih Fase</option>
              {faseOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.description})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Deskripsi Singkat
          </label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={moduleData.deskripsi_singkat}
            onChange={(e) =>
              setModuleData({
                ...moduleData,
                deskripsi_singkat: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Tentang Modul
          </label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={moduleData.tentang_modul}
            onChange={(e) =>
              setModuleData({ ...moduleData, tentang_modul: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Tujuan Pembelajaran
          </label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={moduleData.tujuan_pembelajaran}
            onChange={(e) =>
              setModuleData({
                ...moduleData,
                tujuan_pembelajaran: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Thumbnail (ratio 1:2)
          </label>
          {thumbnailPreview && (
            <div className="mt-4 relative w-48 h-96 overflow-hidden rounded-lg border border-gray-300 shadow">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleThumbnailChange}
          />
          <p className="text-xs text-gray-500 mt-2">
            Biarkan kosong jika tidak ingin mengganti thumbnail
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Konten Modul</label>
            <button
              type="button"
              onClick={handleAddContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Tambah Konten
            </button>
          </div>

          {moduleData.contents.map((content, index) => (
            <div
              key={index}
              className="mb-6 p-5 border rounded-lg bg-gray-50 space-y-3"
            >
              <div className="flex justify-between items-start">
                <select
                  className="w-48 p-2 border rounded"
                  value={content.content_type}
                  onChange={(e) =>
                    handleContentChange(
                      index,
                      "content_type",
                      e.target.value as any
                    )
                  }
                >
                  {contentTypeOptions.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Tombol Hapus berbeda berdasarkan ada id atau tidak */}
                {content.id ? (
                  <button
                    onClick={() =>
                      handleDeleteExistingContent(content.id!, index)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Hapus Permanen
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveContent(index)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Judul Konten"
                className="w-full p-3 border rounded-lg"
                value={content.judul}
                onChange={(e) =>
                  handleContentChange(index, "judul", e.target.value)
                }
              />

              <select
                className="w-full p-3 border rounded-lg"
                value={content.file_type}
                onChange={(e) =>
                  handleContentChange(index, "file_type", e.target.value as any)
                }
              >
                {fileTypeOptions.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft.toUpperCase()}
                  </option>
                ))}
              </select>

              {content.file_type === "youtube" ? (
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 border rounded-lg"
                  value={content.youtube_url || ""}
                  onChange={(e) =>
                    handleContentChange(index, "youtube_url", e.target.value)
                  }
                />
              ) : (
                <div>
                  {content.file_path && (
                    <p className="text-sm text-gray-600 mb-2">
                      File saat ini: {content.file_path.split("/").pop()}
                    </p>
                  )}
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => handleContentFileChange(index, e)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Biarkan kosong jika tidak ingin mengganti file
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPerangkatAjar;
