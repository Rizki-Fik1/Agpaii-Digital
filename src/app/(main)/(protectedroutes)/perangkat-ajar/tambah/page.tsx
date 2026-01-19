"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";

interface GradeOption {
  id: number;
  description: string;
}

interface ContentItem {
  type: "file" | "youtube";
  name: string;
  file?: File | null;
  youtube_url?: string;
  previewUrl?: string;
}

interface FormData {
  topic: string;
  school: string;
  subject: string;
  type: string;
  duration: string;
  grade_id: string;
  description: string;
  image?: File | null;
  contents: ContentItem[];
}

const TambahPerangkatAjar: React.FC = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [gradeOptions, setGradeOptions] = useState<GradeOption[]>([]);

  const [formData, setFormData] = useState<FormData>({
    topic: "",
    school: "",
    subject: "",
    type: "",
    duration: "",
    grade_id: "",
    description: "",
    image: null,
    contents: [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const typeOptions = [
    "Materi ajar & RPP",
    "Bahan ajar",
    "Buku",
    "LKPD",
  ];

  useEffect(() => {
    fetchGradeOptions();
  }, []);

  const fetchGradeOptions = async () => {
    try {
      const response = await axios.get(
        "https://2024.agpaiidigital.org/api/bahanajar/grades/list"
      );
      setGradeOptions(response.data || []);
    } catch (error) {
      console.error("Error fetching grade options:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      // Cleanup content preview URLs
      formData.contents.forEach(content => {
        if (content.previewUrl) {
          URL.revokeObjectURL(content.previewUrl);
        }
      });
    };
  }, [imagePreview, formData.contents]);

  const handleAddContent = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [...prev.contents, { type: "file", name: "", file: null, youtube_url: "" }],
    }));
  };

  const handleContentTypeChange = (index: number, type: "file" | "youtube") => {
    const newContents = [...formData.contents];
    newContents[index] = { type, name: newContents[index].name, file: null, youtube_url: "" };
    setFormData({ ...formData, contents: newContents });
  };

  const handleContentNameChange = (index: number, name: string) => {
    const newContents = [...formData.contents];
    newContents[index].name = name;
    setFormData({ ...formData, contents: newContents });
  };

  const handleContentFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newContents = [...formData.contents];
    const file = e.target.files?.[0] ?? null;
    newContents[index].file = file;
    
    // Create preview URL for the file
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      newContents[index].previewUrl = previewUrl;
    } else {
      newContents[index].previewUrl = undefined;
    }
    
    setFormData({ ...formData, contents: newContents });
  };

  const handleOpenPreview = (content: ContentItem) => {
    if (content.type === "file" && content.file) {
      // Buat blob URL baru untuk membuka file
      const url = URL.createObjectURL(content.file);
      
      // Buka di tab baru tanpa download
      window.open(url, '_blank');
      
      // Cleanup setelah beberapa saat
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (content.type === "youtube" && content.youtube_url) {
      window.open(content.youtube_url, "_blank");
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      default:
        return '📎';
    }
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
  };

  const isPdfFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  };

  const isOfficeFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // Convert berbagai format YouTube URL ke embed URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleContentYoutubeChange = (index: number, url: string) => {
    const newContents = [...formData.contents];
    newContents[index].youtube_url = url;
    setFormData({ ...formData, contents: newContents });
  };

  const handleRemoveContent = (index: number) => {
    const newContents = [...formData.contents];
    newContents.splice(index, 1);
    setFormData({ ...formData, contents: newContents });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (
      !formData.topic ||
      !formData.school ||
      !formData.subject ||
      !formData.type ||
      !formData.duration ||
      !formData.grade_id ||
      !formData.description
    ) {
      const missingFields = [];
      if (!formData.topic) missingFields.push("Topik");
      if (!formData.school) missingFields.push("Sekolah");
      if (!formData.subject) missingFields.push("Mata Pelajaran");
      if (!formData.type) missingFields.push("Tipe");
      if (!formData.duration) missingFields.push("Durasi");
      if (!formData.grade_id) missingFields.push("Kelas");
      if (!formData.description) missingFields.push("Deskripsi");
      
      alert(`Pastikan semua field wajib terisi!\n\nField yang kosong: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        alert("Sesi login habis. Silakan login ulang.");
        return;
      }
      
      const data = new FormData();
      data.append("topic", formData.topic);
      data.append("school", formData.school);
      data.append("subject", formData.subject);
      data.append("type", formData.type);
      data.append("duration", formData.duration);
      data.append("grade_id", formData.grade_id);
      data.append("description", formData.description);
      data.append("user_id", String(user.id));

      if (formData.image) {
        data.append("image", formData.image);
      }

      // Add content files with proper structure
      formData.contents.forEach((content, idx) => {
        if (content.type === "file" && content.file) {
          data.append(`contents[${idx}][name]`, content.name || content.file.name);
          data.append(`contents[${idx}][format_doc]`, "File");
          data.append(`contents[${idx}][file]`, content.file);
        } else if (content.type === "youtube" && content.youtube_url) {
          data.append(`contents[${idx}][name]`, content.name || "Video YouTube");
          data.append(`contents[${idx}][format_doc]`, "Youtube");
          data.append(`contents[${idx}][url]`, content.youtube_url);
        }
      });

      const response = await axios.post(
        "https://2024.agpaiidigital.org/api/bahanajar",
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data) {
        alert("Perangkat ajar berhasil disimpan!");
        router.push("/perangkat-ajar");
      } else {
        alert(response.data.message || "Gagal menyimpan data");
      }
    } catch (error: any) {
      console.error("Error submitting data:", error);
      alert(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[5.21rem] p-6 bg-white min-h-screen">
      <TopBar withBackButton>Tambah Perangkat Ajar</TopBar>
      <div className="space-y-4">
        {/* Topik */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Topik
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
            placeholder="Masukkan topik"
            value={formData.topic}
            onChange={(e) =>
              setFormData({ ...formData, topic: e.target.value })
            }
          />
        </div>

        {/* Sekolah */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Sekolah
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
            placeholder="Masukkan nama sekolah"
            value={formData.school}
            onChange={(e) =>
              setFormData({ ...formData, school: e.target.value })
            }
          />
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Mata Pelajaran
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
            placeholder="Masukkan mata pelajaran"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />
        </div>

        {/* Tipe */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Tipe
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] bg-white"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="">Pilih Tipe</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Durasi */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Durasi
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
            placeholder="Masukkan durasi"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
          />
        </div>

        {/* Kelas */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Kelas
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] bg-white"
            value={formData.grade_id}
            onChange={(e) =>
              setFormData({ ...formData, grade_id: e.target.value })
            }
          >
            <option value="">Pilih Kelas</option>
            {gradeOptions.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.description}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] resize-none"
            placeholder="Masukkan deskripsi"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Gambar */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Gambar
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Pilih File
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <span className="text-sm text-gray-500">
              {formData.image ? formData.image.name : "Tidak ada file yang dipilih"}
            </span>
          </div>
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Konten */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Konten
          </label>
          {formData.contents.map((content, index) => (
            <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              {/* Dropdown Tipe Konten */}
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600">
                  Tipe Konten
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] bg-white text-sm"
                  value={content.type}
                  onChange={(e) =>
                    handleContentTypeChange(index, e.target.value as "file" | "youtube")
                  }
                >
                  <option value="file">File</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {/* Input Nama Konten */}
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600">
                  Nama Konten
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] text-sm"
                  placeholder={content.type === "file" ? "Contoh: Materi Word" : "Contoh: Video Pembahasan"}
                  value={content.name}
                  onChange={(e) => handleContentNameChange(index, e.target.value)}
                />
              </div>

              {/* Input berdasarkan tipe */}
              {content.type === "file" ? (
                <div className="space-y-2">
                  <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm inline-block">
                    Pilih File
                    <input
                      type="file"
                      accept="*"
                      className="hidden"
                      onChange={(e) => handleContentFileChange(index, e)}
                    />
                  </label>
                  <span className="text-sm text-gray-600 ml-3">
                    {content.file ? content.file.name : "Tidak ada file"}
                  </span>
                  
                  {/* Preview File */}
                  {content.file && content.previewUrl && (
                    <div className="mt-3 border-2 border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
                      {/* Info File */}
                      <div 
                        className="p-3 cursor-pointer hover:bg-blue-100 transition"
                        onClick={() => handleOpenPreview(content)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded text-2xl flex-shrink-0">
                            {getFileIcon(content.file.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{content.file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(content.file.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Klik untuk buka di tab baru
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Preview Langsung */}
                      {isImageFile(content.file.name) ? (
                        <div className="p-3 bg-white">
                          <img 
                            src={content.previewUrl} 
                            alt="Preview" 
                            className="w-full max-h-64 object-contain rounded"
                          />
                        </div>
                      ) : isPdfFile(content.file.name) ? (
                        <div className="bg-white">
                          <iframe
                            src={content.previewUrl}
                            className="w-full h-96 border-0"
                            title="PDF Preview"
                          />
                        </div>
                      ) : isOfficeFile(content.file.name) ? (
                        <div className="p-3 bg-yellow-50 border-t border-yellow-200">
                          <p className="text-xs text-yellow-800">
                            ℹ️ Preview file Office hanya tersedia setelah file di-upload ke server
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    URL YouTube
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557] text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={content.youtube_url || ""}
                    onChange={(e) => handleContentYoutubeChange(index, e.target.value)}
                  />
                  
                  {/* Preview YouTube */}
                  {content.youtube_url && (
                    <div className="mt-3 border-2 border-red-200 rounded-lg bg-red-50 overflow-hidden">
                      {/* Info YouTube */}
                      <div 
                        className="p-3 cursor-pointer hover:bg-red-100 transition"
                        onClick={() => handleOpenPreview(content)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded text-2xl flex-shrink-0">
                            🎥
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">Video YouTube</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {content.youtube_url}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Klik untuk buka di YouTube
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Embed YouTube */}
                      {getYoutubeEmbedUrl(content.youtube_url) && (
                        <div className="bg-white p-3">
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={getYoutubeEmbedUrl(content.youtube_url) || ''}
                              className="absolute top-0 left-0 w-full h-full rounded"
                              title="YouTube Preview"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Hapus */}
              <button
                onClick={() => handleRemoveContent(index)}
                className="w-full px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                Hapus
              </button>
            </div>
          ))}
          <button
            onClick={handleAddContent}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Tambah Konten
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahPerangkatAjar;
