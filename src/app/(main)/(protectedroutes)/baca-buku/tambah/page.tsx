"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { bookCategories, Book } from "@/constants/books-data";

import { addUserBook } from "@/utils/books-storage";

// React Icons
import { BsFileEarmarkPdf, BsX, BsCheckCircle } from "react-icons/bs";
import { FaBookOpen } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";

// Jenjang options
const jenjangOptions = [
  "SD Kelas 1",
  "SD Kelas 2",
  "SD Kelas 3",
  "SD Kelas 4",
  "SD Kelas 5",
  "SD Kelas 6",
  "SMP Kelas 7",
  "SMP Kelas 8",
  "SMP Kelas 9",
  "SMA/SMK Kelas 10",
  "SMA/SMK Kelas 11",
  "SMA/SMK Kelas 12",
  "Umum",
];

const TambahBukuPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    faseId: "",
    jenjangId: "",
    description: "",
  });

  const [categoriesList, setCategoriesList] = useState<Array<any>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [allFaseList, setAllFaseList] = useState<Array<any>>([]);
  const [faseList, setFaseList] = useState<Array<any>>([]);
  const [jenjangList, setJenjangList] = useState<Array<any>>([]);
  const [loadingFase, setLoadingFase] = useState(false);
  const [loadingJenjang, setLoadingJenjang] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  const { auth: user } = useAuth();

  useEffect(() => {
    // Try to fetch categories from API; fallback to local list
    if (!API_URL) {
      setCategoriesList(bookCategories.map((name) => ({ name })));
      return;
    }

    setLoadingCategories(true);
    axios
      .get(`${API_URL}/book-categories`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          (data[0].id || data[0].name)
        ) {
          const normalized = data.map((c: any) => ({
            id: c.id,
            name: c.name || c.label || c.title,
          }));
          setCategoriesList(normalized);
        } else {
          setCategoriesList(bookCategories.map((name) => ({ name })));
        }
      })
      .catch(() => setCategoriesList(bookCategories.map((name) => ({ name }))))
      .finally(() => setLoadingCategories(false));
  }, [API_URL]);

  // Fetch jenjang list from modules-learn endpoint; fase will be loaded after jenjang selected
  useEffect(() => {
    if (!API_URL) {
      setJenjangList(jenjangOptions.map((name) => ({ id: name, name })));
      setFaseList([]);
      return;
    }

    setLoadingJenjang(true);
    axios
      .get(`${API_URL}/modules-learn/jenjang`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map((j: any) => ({
            id: j.id_jenjang ?? j.id,
            name: j.nama_jenjang ?? j.name ?? j.label ?? j.title,
          }));
          setJenjangList(list);
        } else {
          setJenjangList(jenjangOptions.map((name) => ({ id: name, name })));
        }
      })
      .catch(() =>
        setJenjangList(jenjangOptions.map((name) => ({ id: name, name })))
      )
      .finally(() => setLoadingJenjang(false));

    // Also fetch all fase once and store locally so we can filter by jenjang without extra requests
    setLoadingFase(true);
    axios
      .get(`${API_URL}/modules-learn/fase`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map((f: any) => ({
            id: f.id_fase ?? f.id,
            name: f.nama_fase ?? f.name ?? f.label ?? f.title,
            description: f.deskripsi ?? f.description ?? "",
            jenjangId: f.id_jenjang ?? f.jenjang?.id_jenjang ?? f.jenjang?.id,
            kelas: f.deskripsi ?? "",
          }));
          setAllFaseList(list);
        } else {
          setAllFaseList([]);
        }
      })
      .catch(() => setAllFaseList([]))
      .finally(() => setLoadingFase(false));
  }, [API_URL]);

  // When jenjang changes, filter pre-fetched fase list locally
  useEffect(() => {
    const jenjangId = formData.jenjangId;

    // clear previously selected fase
    setFormData((prev) => ({ ...prev, faseId: "" }));

    if (!jenjangId) {
      setFaseList([]);
      return;
    }

    const filtered = allFaseList.filter(
      (f) => String(f.jenjangId) === String(jenjangId)
    );

    setFaseList(filtered);
  }, [formData.jenjangId, allFaseList]);

  const selectedFase = faseList.find(
    (f) => String(f.id) === String(formData.faseId)
  );

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  // Cover image uploaded by user
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Convert file to data URL for storage
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle PDF upload (no auto-preview generation)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Silakan pilih file PDF");
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Ukuran file maksimal 50MB");
      return;
    }

    setPdfFile(file);

    try {
      // Convert PDF to data URL for storage
      const dataUrl = await fileToDataUrl(file);
      setPdfDataUrl(dataUrl);
    } catch (error) {
      console.error("Error reading PDF:", error);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfDataUrl(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.categoryId) {
      alert("Mohon lengkapi judul dan kategori buku");
      return;
    }

    if (!pdfFile || !pdfDataUrl) {
      alert("Mohon upload file PDF buku");
      return;
    }

    setIsSubmitting(true);

    try {
      // If API base URL missing, fallback to local storage behavior
      if (!API_URL) {
        const jenjangLabel = (() => {
          if (formData.jenjangId) {
            const found = jenjangList.find(
              (j) => String(j.id) === String(formData.jenjangId)
            );
            if (found) return found.name;
            return String(formData.jenjangId);
          }
          return undefined;
        })();

        const faseLabel = (() => {
          if (formData.faseId) {
            const found = faseList.find(
              (f) => String(f.id) === String(formData.faseId)
            );
            if (found) return found.name;
            return String(formData.faseId);
          }
          return undefined;
        })();

        const newBook: Book = {
          id: `user-${Date.now()}`,
          title: formData.title,
          author: user?.name || "Pengguna",
          category: (
            categoriesList.find(
              (c) => String(c.id) === String(formData.categoryId)
            ) || { name: formData.categoryId }
          ).name,
          jenjang: jenjangLabel || undefined,
          description: formData.description
            ? `${formData.description}${
                faseLabel ? `\nFase: ${faseLabel}` : ""
              }`
            : faseLabel
            ? `Fase: ${faseLabel}`
            : undefined,
          cover: coverPreview || "/images/books/default.jpg",
          coverDataUrl: coverPreview || undefined,
          pdfUrl: pdfDataUrl,
          uploadDate: new Date().toISOString().split("T")[0],
          viewCount: 0,
          downloadCount: 0,
          likeCount: 0,
          isNew: true,
        };

        addUserBook(newBook);
        alert("Buku disimpan secara lokal");
        router.push("/baca-buku");
        return;
      }

      // Server submit
      const payload = new FormData();
      payload.append("user_id", String(user?.id || ""));
      payload.append("category_id", String(formData.categoryId));
      payload.append("judul", formData.title);
      payload.append("deskripsi", formData.description || "");
      payload.append("file", pdfFile as Blob);

      // attach cover image if provided
      if (coverFile) {
        payload.append("cover", coverFile);
      }

      if (formData.faseId) {
        payload.append("fase_id", String(formData.faseId));
      }

      if (formData.jenjangId) {
        payload.append("jenjang_id", String(formData.jenjangId));
      }

      const res = await axios.post(`${API_URL}/books`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        alert("Buku berhasil ditambahkan");
        router.push("/baca-buku");
      } else {
        console.error(res.data);
        alert("Gagal menambahkan buku. Coba lagi.");
      }
    } catch (error: any) {
      console.error("Error saving book:", error);
      alert(
        "Gagal menambahkan buku. " +
          (error?.response?.data?.message || error?.message || "")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar withBackButton>Tambah Buku</TopBar>

      <div className="max-w-[480px] mx-auto pt-[3.8rem] pb-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* PDF Upload Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Upload File e-Book (PDF)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Sampul buku akan diambil otomatis dari halaman pertama PDF
              </p>
            </div>

            <div className="p-5">
              {pdfFile ? (
                <div className="space-y-4">
                  {/* PDF Info */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                        <BsCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">
                          {pdfFile.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <BsX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cover Preview */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      Preview Sampul:
                    </p>
                    <div className="w-28 mx-auto">
                      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-gray-100">
                        {coverPreview ? (
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex flex-col items-center justify-center p-2 text-white">
                            <HiOutlineBookOpen className="w-6 h-6 mb-1" />
                            <span className="text-[7px] text-center">
                              Tidak ada sampul. Upload sampul atau unggah PDF
                              saja.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover upload control (visible) */}
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 5 * 1024 * 1024) {
                            alert("Ukuran sampul maksimal 5MB");
                            return;
                          }
                          // Convert to data URL for preview
                          fileToDataUrl(f).then((url) => {
                            setCoverFile(f);
                            setCoverPreview(url);
                          });
                        }}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("cover-upload")?.click()
                        }
                        className="px-3 py-2 bg-white border rounded-lg text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v14m7-7H5"
                          />
                        </svg>
                        <span>
                          {coverFile ? "Ganti Sampul" : "Upload Sampul"}
                        </span>
                      </button>
                    </label>

                    {coverFile && (
                      <span className="text-sm text-gray-600 line-clamp-1">
                        {coverFile.name}
                      </span>
                    )}

                    {coverPreview && (
                      <div className="w-14 h-14 rounded overflow-hidden border border-gray-200">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {coverFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        className="text-xs text-red-500"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <BsFileEarmarkPdf className="w-7 h-7 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Pilih File PDF
                  </span>
                  <span className="text-[10px] text-gray-400 mb-3">
                    Maksimal 50MB
                  </span>
                  <span className="px-4 py-2 bg-teal-600 text-white text-xs rounded-lg font-medium">
                    Browse File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Book Information Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Informasi Buku
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Nama Buku */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">
                  Nama Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul buku"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Kategori & Jenjang Row (select jenjang first) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                  >
                    <option value="">Pilih</option>
                    {categoriesList.map((cat) => (
                      <option
                        key={cat.id ?? cat.name}
                        value={cat.id ?? cat.name}
                      >
                        {cat.name ?? cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">
                    Jenjang Buku
                  </label>
                  <select
                    name="jenjangId"
                    value={formData.jenjangId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Pilih</option>
                    {loadingJenjang ? (
                      <option value="">Memuat...</option>
                    ) : jenjangList && jenjangList.length > 0 ? (
                      jenjangList.map((j) => (
                        <option key={j.id ?? j.name} value={j.id ?? j.name}>
                          {j.name}
                        </option>
                      ))
                    ) : (
                      jenjangOptions.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Fase (depends on selected jenjang) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">
                  Fase
                  {!loadingFase &&
                    formData.jenjangId &&
                    faseList.length > 0 && (
                      <span className="text-[10px] text-gray-500 ml-2">
                        ({faseList.length} tersedia)
                      </span>
                    )}
                </label>
                <select
                  name="faseId"
                  value={formData.faseId}
                  onChange={handleInputChange}
                  disabled={!formData.jenjangId || loadingFase}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:opacity-50"
                >
                  {!formData.jenjangId ? (
                    <option value="">Pilih jenjang dulu</option>
                  ) : loadingFase ? (
                    <option value="">Memuat...</option>
                  ) : faseList.length === 0 ? (
                    <option value="">Tidak ada fase</option>
                  ) : (
                    <>
                      <option value="">Pilih</option>
                      {faseList.map((f) => (
                        <option key={f.id ?? f.name} value={f.id ?? f.name}>
                          {f.name} {f.kelas ? `(${f.kelas})` : ""}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {/* No fase message when jenjang selected but none available */}
                {!loadingFase &&
                  formData.jenjangId &&
                  faseList.length === 0 && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Tidak ada fase untuk jenjang yang dipilih.
                    </p>
                  )}

                {/* Fase description */}
                {selectedFase?.description && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {selectedFase.description}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi singkat tentang buku ini..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Button - Inside Card */}
            <div className="px-5 pb-5">
              <button
                type="submit"
                disabled={isSubmitting || !pdfFile}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-300 text-white rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FaBookOpen className="w-4 h-4" />
                    Tambah Buku
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <p className="text-[10px] text-gray-400 text-center px-4">
            Dengan menambahkan buku, Anda menyetujui bahwa konten yang diunggah
            tidak melanggar hak cipta.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TambahBukuPage;
