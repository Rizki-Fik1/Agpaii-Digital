"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import { cekDanUbahType } from "@/utils/function/function";

const DetailPerangkatAjarPage: React.FC = () => {
  const params = useParams();
  const materialId = params?.id as string;

  const { auth: user } = useAuth();
  const [materialData, setMaterialData] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPreviews, setLoadingPreviews] = useState<{ [key: string]: boolean }>({});
  const [previewErrors, setPreviewErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!materialId) return;

      try {
        const response = await axios.get(
          `https://2024.agpaiidigital.org/api/bahanajar/${materialId}`
        );

        setMaterialData(response.data.data);
        setContents(response.data.data.contents || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching material data:", error);
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [materialId]);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : `https://2024.agpaiidigital.org/${url}`;
  };

  const getFileExtension = (url: string) => {
    if (!url) return "";
    const parts = url.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const isOfficeFile = (url: string) => {
    const ext = getFileExtension(url);
    return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
  };

  const isPdfFile = (url: string) => {
    const ext = getFileExtension(url);
    return ext === "pdf";
  };

  const isYoutubeVideo = (formatDoc: string) => {
    const format = formatDoc?.toLowerCase() || "";
    return format === "youtube";
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  };

  const handleOpenURL = (url: string) => {
    if (!url) {
      alert("URL file tidak tersedia");
      return;
    }

    const fullUrl = getFullUrl(url);

    if (isOfficeFile(url)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        fullUrl
      )}`;
      window.open(viewerUrl, "_blank");
      return;
    }

    window.open(fullUrl, "_blank");
  };

  const handleEdit = () => {
    if (materialId) {
      window.location.href = `/perangkat-ajar/${materialId}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!materialId) return;

    if (confirm("Apakah Anda yakin ingin menghapus perangkat ajar ini?")) {
      try {
        const token = localStorage.getItem("access_token");

        await axios.delete(
          `https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        alert("Perangkat ajar berhasil dihapus.");
        window.location.href = "/perangkat-ajar";
      } catch (error) {
        console.error("Error deleting material:", error);
        alert("Gagal menghapus perangkat ajar.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!materialData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Data tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-[5.21rem]">
      <TopBar withBackButton>Detail Perangkat Ajar</TopBar>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Hero Section with Image */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#006557] to-[#004d42]">
            <img
              src={`https://2024.agpaiidigital.org/${materialData?.image || ""}`}
              alt={materialData?.topic || ""}
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/img/placeholder.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-block bg-white/90 backdrop-blur-sm text-[#006557] text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {cekDanUbahType(materialData?.type || "")}
              </span>
            </div>
          </div>

          {/* Content Info */}
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {materialData?.topic || ""}
            </h1>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006557]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#006557]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ditulis Oleh</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {materialData?.user?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006557]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#006557]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Jenjang</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {materialData?.grade?.description || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006557]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#006557]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mata Pelajaran</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {materialData?.subject || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006557]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#006557]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Kategori</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cekDanUbahType(materialData?.type || "")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi</h3>
              <p className="text-gray-600 leading-relaxed">
                {materialData?.description || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Edit and Delete Buttons */}
        {materialData?.user_id === user?.id && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Hapus
            </button>
          </div>
        )}

        {/* File Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[#006557]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            File Konten
          </h3>

          <div className="space-y-4">
            {contents.map((content: any) => (
              <div key={content.id} className="border rounded-lg overflow-hidden relative">
                {/* Loading Overlay - covers entire card */}
                {loadingPreviews[`content-${content.id}`] !== false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-[#006557] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600">Memuat konten...</p>
                    </div>
                  </div>
                )}

                {/* File Info Header */}
                <div
                  className="flex items-center bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleOpenURL(content.url || content.value)}
                >
                  <div className="w-10 h-10 flex-shrink-0 mr-4">
                    <img
                      src={
                        content.format_doc === "Pdf"
                          ? "/icons/pdf.png"
                          : content.format_doc === "Youtube"
                          ? "/icons/youtube.png"
                          : content.format_doc === "Doc" ||
                            content.format_doc === "Word"
                          ? "/icons/word.png"
                          : content.format_doc === "PowerPoint" ||
                            content.format_doc === "Ppt" ||
                            content.format_doc === "Pptx"
                          ? "/icons/powerpoint.png"
                          : content.format_doc === "Excel" ||
                            content.format_doc === "Xls" ||
                            content.format_doc === "Xlsx"
                          ? "/icons/excel.png"
                          : "https://via.placeholder.com/40?text=?"
                      }
                      alt={content.format_doc}
                      height={40}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-800 font-bold">{content.name}</p>
                    <p className="text-gray-600 text-sm">
                      Format: {content.format_doc || "-"}
                    </p>
                  </div>

                  <div className="text-blue-600 text-sm">
                    Klik untuk buka di tab baru →
                  </div>
                </div>

                {/* Preview Section */}
                {isYoutubeVideo(content.format_doc) &&
                  getYoutubeEmbedUrl(content.url || content.value) && (
                    <div className="bg-white p-4">
                      {previewErrors[`youtube-${content.id}`] ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                          <svg
                            className="w-12 h-12 text-red-400 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-red-700 font-medium mb-2">
                            Video tidak dapat ditampilkan
                          </p>
                          <p className="text-red-600 text-sm mb-4">
                            Video mungkin bersifat privat atau memiliki pembatasan embed
                          </p>
                          <button
                            onClick={() => handleOpenURL(content.url || content.value)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            Buka di YouTube
                          </button>
                        </div>
                      ) : (
                        <div
                          className="relative w-full"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            src={getYoutubeEmbedUrl(content.url || content.value) || ""}
                            className="absolute top-0 left-0 w-full h-full rounded"
                            title={content.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                            onLoad={() => {
                              setLoadingPreviews((prev) => ({
                                ...prev,
                                [`content-${content.id}`]: false,
                              }));
                            }}
                            onError={() => {
                              setPreviewErrors((prev) => ({
                                ...prev,
                                [`youtube-${content.id}`]: true,
                              }));
                              setLoadingPreviews((prev) => ({
                                ...prev,
                                [`content-${content.id}`]: false,
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                {isPdfFile(content.url || content.value) && (
                  <div className="bg-white p-4">
                    <iframe
                      src={getFullUrl(content.url || content.value)}
                      className="w-full h-[600px] border-0 rounded"
                      title={content.name}
                      onLoad={() => {
                        setLoadingPreviews((prev) => ({
                          ...prev,
                          [`content-${content.id}`]: false,
                        }));
                      }}
                    />
                  </div>
                )}

                {isOfficeFile(content.url || content.value) && (
                  <div className="bg-white p-4">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        getFullUrl(content.url || content.value)
                      )}&embedded=true`}
                      className="w-full h-[600px] border-0 rounded"
                      title={content.name}
                      onLoad={() => {
                        setLoadingPreviews((prev) => ({
                          ...prev,
                          [`content-${content.id}`]: false,
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPerangkatAjarPage;
