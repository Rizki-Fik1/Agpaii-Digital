"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";

interface JenjangOption {
  id: number;
  name: string;
  description: string;
}

interface FaseOption {
  id: number;
  name: string;
  description: string;
  id_jenjang?: number;
  jenjang?: { id_jenjang: number };
}

interface ContentItem {
  content_type: "materi" | "assessment" | string;
  judul: string;
  file_type: "youtube" | "pdf" | "doc" | "excel" | "ppt" | string;
  youtube_url?: string;
  file_path?: string;
  file?: File | null;
}

interface FormData {
  judul: string;
  jenjang_id: string;
  fase_id: string;
  deskripsi_singkat: string;
  tentang_modul: string;
  tujuan_pembelajaran: string;
  thumbnail?: File | null;
  contents: ContentItem[];
}

const TambahModulAjar: React.FC = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [jenjangOptions, setJenjangOptions] = useState<JenjangOption[]>([]);
  const [allFaseOptions, setAllFaseOptions] = useState<FaseOption[]>([]);
  const [faseOptions, setFaseOptions] = useState<FaseOption[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    judul: "",
    jenjang_id: "",
    fase_id: "",
    deskripsi_singkat: "",
    tentang_modul: "",
    tujuan_pembelajaran: "",
    thumbnail: null,
    contents: [],
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const contentTypeOptions = ["materi", "assessment"];
  const fileTypeOptions = ["youtube", "pdf", "doc", "excel", "ppt"];

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const jenjangRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/jenjang`
      );
      setJenjangOptions(
        jenjangRes.data.data.map((j: any) => ({
          id: j.id_jenjang,
          name: j.nama_jenjang || "",
          description: j.nama_jenjang || "",
        }))
      );

      const faseRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/fase`
      );
      setAllFaseOptions(
        faseRes.data.data.map((f: any) => ({
          id: f.id_fase,
          name: f.nama_fase || "",
          description: f.deskripsi || "",
          jenjang: f.jenjang || { id_jenjang: f.id_jenjang },
          id_jenjang: f.id_jenjang,
        }))
      );
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  useEffect(() => {
    if (selectedJenjang) {
      const jenjangId = parseInt(selectedJenjang);
      setFaseOptions(
        allFaseOptions.filter(
          (f) =>
            f.jenjang?.id_jenjang === jenjangId ||
            (f as any).id_jenjang === jenjangId
        )
      );
    } else {
      setFaseOptions([]);
    }
    setFormData((prev) => ({ ...prev, fase_id: "" }));
  }, [selectedJenjang, allFaseOptions]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleAddContent = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [
        ...prev.contents,
        {
          content_type: "materi",
          judul: "",
          file_type: "pdf",
          youtube_url: "",
          file_path: "",
          file: null,
        },
      ],
    }));
  };

  const handleContentChange = (
    index: number,
    field: keyof ContentItem,
    value: string
  ) => {
    const newContents = [...formData.contents];
    (newContents[index] as any)[field] = value;
    setFormData({ ...formData, contents: newContents });
  };

  const handleContentFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newContents = [...formData.contents];
    const file = e.target.files?.[0] ?? null;
    (newContents[index] as any).file = file;
    (newContents[index] as any).file_path = file ? file.name : "";
    setFormData({ ...formData, contents: newContents });
  };

  const handleRemoveContent = (index: number) => {
    const newContents = [...formData.contents];
    newContents.splice(index, 1);
    setFormData({ ...formData, contents: newContents });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, thumbnail: file }));
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (
      !formData.judul ||
      !formData.jenjang_id ||
      !formData.fase_id ||
      !formData.deskripsi_singkat ||
      !formData.tentang_modul ||
      !formData.tujuan_pembelajaran
    ) {
      alert("Pastikan semua field wajib terisi!");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("judul", formData.judul);
      data.append("fase_id", formData.fase_id);
      data.append("jenjang_id", formData.jenjang_id);
      data.append("deskripsi_singkat", formData.deskripsi_singkat);
      data.append("tentang_modul", formData.tentang_modul);
      data.append("tujuan_pembelajaran", formData.tujuan_pembelajaran);
      data.append("user_id", String(user.id));

      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }

      formData.contents.forEach((c, idx) => {
        data.append(`contents[${idx}][content_type]`, c.content_type);
        data.append(`contents[${idx}][judul]`, c.judul);
        data.append(`contents[${idx}][file_type]`, c.file_type);

        if (c.file_type === "youtube") {
          data.append(`contents[${idx}][youtube_url]`, c.youtube_url || "");
        } else {
          if ((c as any).file) {
            data.append(`contents_files[${idx}]`, (c as any).file as File);
            data.append(
              `contents[${idx}][file_path]`,
              (c as any).file?.name || ""
            );
          } else {
            data.append(`contents[${idx}][file_path]`, c.file_path || "");
          }
        }
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn`,
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        router.push("/modul-ajar");
      } else {
        alert(response.data.message || "Gagal menyimpan data");
      }
    } catch (error: any) {
      console.error("Error submitting data:", error);
      alert(
        error.response?.data?.errors || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[5.21rem] p-6 bg-white min-h-screen">
      <TopBar withBackButton>Tambah Modul Ajar</TopBar>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Judul</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) =>
              setFormData({ ...formData, judul: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 min-w-0">
          <select
            className="flex-1 p-2 border rounded"
            value={formData.jenjang_id}
            onChange={(e) => {
              setFormData({ ...formData, jenjang_id: e.target.value });
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
          <select
            className="flex-1 min-w-0 p-2 border rounded truncate"
            value={formData.fase_id}
            onChange={(e) =>
              setFormData({ ...formData, fase_id: e.target.value })
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
        <div>
          <label className="block mb-2 text-sm font-medium">
            Deskripsi Singkat
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Masukkan deskripsi singkat"
            value={formData.deskripsi_singkat}
            onChange={(e) =>
              setFormData({ ...formData, deskripsi_singkat: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">
            Tentang Modul
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Jelaskan tentang modul"
            value={formData.tentang_modul}
            onChange={(e) =>
              setFormData({ ...formData, tentang_modul: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">
            Tujuan Pembelajaran
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Masukkan tujuan pembelajaran"
            value={formData.tujuan_pembelajaran}
            onChange={(e) =>
              setFormData({ ...formData, tujuan_pembelajaran: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">
            Thumbnail (ratio 1:2)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleThumbnailChange}
          />
          {thumbnailPreview && (
            <div className="mt-2 relative w-24 h-48 overflow-hidden rounded-lg">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Konten</label>
          {formData.contents.map((content, index) => (
            <div key={index} className="mb-4 p-4 border rounded space-y-2">
              <select
                className="w-full p-2 border rounded"
                value={content.content_type}
                onChange={(e) =>
                  handleContentChange(index, "content_type", e.target.value)
                }
              >
                <option value="materi">Materi</option>
                <option value="assessment">Assessment</option>
              </select>
              <input
                type="text"
                placeholder="Judul Konten"
                className="w-full p-2 border rounded"
                value={content.judul}
                onChange={(e) =>
                  handleContentChange(index, "judul", e.target.value)
                }
              />
              <select
                className="w-full p-2 border rounded"
                value={content.file_type}
                onChange={(e) =>
                  handleContentChange(index, "file_type", e.target.value)
                }
              >
                {fileTypeOptions.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
              {content.file_type === "youtube" ? (
                <input
                  type="text"
                  placeholder="Youtube URL"
                  className="w-full p-2 border rounded"
                  value={content.youtube_url}
                  onChange={(e) =>
                    handleContentChange(index, "youtube_url", e.target.value)
                  }
                />
              ) : (
                <div>
                  <input
                    type="file"
                    accept="*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => handleContentFileChange(index, e)}
                  />
                  {content.file_path && (
                    <p className="text-sm text-gray-500 mt-1">
                      {content.file_path}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={() => handleRemoveContent(index)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Hapus
              </button>
            </div>
          ))}
          <button
            onClick={handleAddContent}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tambah Konten
          </button>
        </div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded mt-4"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahModulAjar;
