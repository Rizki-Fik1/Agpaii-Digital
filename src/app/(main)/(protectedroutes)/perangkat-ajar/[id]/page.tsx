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
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [downloadsCount, setDownloadsCount] = useState<number>(0);
  const [repostsCount, setRepostsCount] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showRepostModal, setShowRepostModal] = useState<boolean>(false);
  const [repostTopic, setRepostTopic] = useState<string>("");
  const [isReposting, setIsReposting] = useState<boolean>(false);
  const [repostedByMe, setRepostedByMe] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ 
    show: false, 
    message: '', 
    type: 'info' 
  });
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!materialId) return;

      try {
        const token = localStorage.getItem("access_token");
        
        const response = await axios.get(
          `https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const data = response.data.data;
        
        setMaterialData(data);
        setContents(data.contents || []);
        setLikesCount(data.likes_count || 0);
        setDownloadsCount(data.downloads || 0);
        setRepostsCount(data.reposts || 0);
        
        // liked_by_me bisa ada di root response atau di dalam data
        const likedByMe = response.data.liked_by_me ?? data.liked_by_me;
        setIsLiked(likedByMe === true);
        
        // Check if user already reposted this
        const repostedByMe = response.data.reposted_by_me ?? data.reposted_by_me;
        setRepostedByMe(repostedByMe === true);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching material data:", error);
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [materialId, user]);

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
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    const videoId = match ? match[2] : null;

    if (!videoId) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  };

  const handleOpenURL = (url: string) => {
    if (!url) {
      showToast("URL file tidak tersedia", "error");
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

  const handleLike = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return; 
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const willLike = !isLiked;

    // Optimistic update - update UI immediately
    setIsLiked(willLike);
    setLikesCount(willLike ? likesCount + 1 : likesCount - 1);

    try {
      const token = localStorage.getItem("access_token");

      if (willLike) {
        // Like - POST request
        await axios.post(
          `https://2024.agpaiidigital.org/api/bahanajar/${materialId}/like`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      } else {
        // Unlike - DELETE request
        await axios.delete(
          `https://2024.agpaiidigital.org/api/bahanajar/${materialId}/like`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error("Error toggling like:", error);
      showToast("Gagal menyukai perangkat ajar", "error");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await axios.get(
        `https://2024.agpaiidigital.org/api/bahanajar/${materialId}/download`,
        {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Create file download from blob
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `perangkat-ajar-${materialId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast("File berhasil diunduh", "success");
    } catch (error) {
      console.error("Error downloading file:", error);
      showToast("Gagal mengunduh file", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleRepost = () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }
    
    if (repostedByMe) {
      showToast("Kamu sudah pernah repost perangkat ajar ini", "info");
      return;
    }
    
    setRepostTopic("");
    setShowRepostModal(true);
  };

  const submitRepost = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }

    const originalTopic = materialData?.topic || "";
    
    // Normalize both topics: remove all spaces and convert to lowercase
    const normalizeTopic = (topic: string) => 
      topic.replace(/\s+/g, "").toLowerCase();
    
    // Validate topic is different from original (ignoring spaces and case)
    if (normalizeTopic(repostTopic) === normalizeTopic(originalTopic)) {
      showToast("Topik harus berbeda dari perangkat ajar asli", "error");
      return;
    }

    if (!repostTopic.trim()) {
      showToast("Topik tidak boleh kosong", "error");
      return;
    }

    setIsReposting(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `https://2024.agpaiidigital.org/api/bahanajar/${materialId}/repost`,
        { topic: repostTopic.trim() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const newId = response.data?.data?.id;

      setShowRepostModal(false);
      showToast("Repost berhasil! Perangkat ajar telah ditambahkan ke koleksi Anda", "success");

      if (newId) {
        setTimeout(() => {
          window.location.href = `/perangkat-ajar/${newId}`;
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error reposting:", error);
      
      // Handle duplicate repost error
      if (error?.response?.status === 409) {
        showToast("Kamu sudah pernah repost perangkat ajar ini", "info");
        setRepostedByMe(true);
        return;
      }
      
      showToast(error?.response?.data?.error || "Gagal merepost perangkat ajar", "error");
    } finally {
      setIsReposting(false);
    }
  };

  const handleEdit = () => {
    if (materialId) {
      window.location.href = `/perangkat-ajar/${materialId}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!materialId) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("access_token");

      await axios.delete(
        `https://2024.agpaiidigital.org/api/bahanajar/${materialId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setShowDeleteModal(false);
      showToast("Perangkat ajar berhasil dihapus", "success");
      setTimeout(() => {
        window.location.href = "/perangkat-ajar";
      }, 1500);
    } catch (error) {
      console.error("Error deleting material:", error);
      showToast("Gagal menghapus perangkat ajar", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleIframeError = (contentId: string, type: string) => {
    setPreviewErrors((prev) => ({
      ...prev,
      [`${type}-${contentId}`]: true,
    }));
    setLoadingPreviews((prev) => ({
      ...prev,
      [`content-${contentId}`]: false,
    }));
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {showRepostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Repost Perangkat Ajar</h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Masukkan topik baru untuk perangkat ajar yang akan direpost. Topik harus berbeda dari aslinya.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik Asli
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
                {materialData?.topic || "-"}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={repostTopic}
                onChange={(e) => setRepostTopic(e.target.value)}
                placeholder="Masukkan topik baru..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006557] focus:border-transparent outline-none transition-all"
                disabled={isReposting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRepostModal(false)}
                disabled={isReposting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={submitRepost}
                disabled={isReposting || !repostTopic.trim()}
                className="flex-1 px-4 py-3 bg-[#006557] hover:bg-[#005547] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isReposting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Merepost...</span>
                  </>
                ) : (
                  "Repost"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Hapus Perangkat Ajar?
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus perangkat ajar ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Repost Badge */}
            {materialData?.original_lesson_plan_id && materialData?.original?.user?.name && (
              <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Repost dari {materialData.original.user.name}
              </div>
            )}

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

            {/* Statistics Info Card */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-6">
                {/* Likes */}
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">{likesCount}</span>
                </div>

                {/* Downloads */}
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">{downloadsCount}</span>
                </div>

                {/* Reposts */}
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">{repostsCount}</span>
                </div>
              </div>
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

        {/* Action Buttons - for all users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
              isLiked
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
            }`}
          >
            <svg
              className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{isLiked ? "Disukai" : "Sukai"}</span>
            <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
              isLiked ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {likesCount}
            </span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#006557] hover:bg-[#005547] text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Mengunduh...</span>
              </>
            ) : (
              <>
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Unduh Perangkat Ajar</span>
              </>
            )}
          </button>

          {/* Repost Button - only show for materials not owned by current user */}
          {user?.id && materialData?.user_id !== user.id && (
            repostedByMe ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium shadow-lg cursor-not-allowed md:col-span-2"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Sudah Direpost</span>
              </button>
            ) : (
              <button
                onClick={handleRepost}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-all shadow-lg md:col-span-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Repost</span>
              </button>
            )
          )}
        </div>

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
            {contents.map((content: any) => {
              // FIXED: Move embedUrl inside the map function where content is available
              const embedUrl = getYoutubeEmbedUrl(content.url || content.value);
              
              return (
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
                    className="flex items-center justify-between bg-gray-100 p-4 hover:bg-gray-200 transition"
                  >
                    <div className="flex items-center flex-1 min-w-0">
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

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-bold truncate">{content.name}</p>
                        <p className="text-gray-600 text-sm">
                          Format: {content.format_doc || "-"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenURL(content.url || content.value)}
                      className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                    >
                      Buka File
                    </button>
                  </div>

                  {/* Preview Section */}
                  {isYoutubeVideo(content.format_doc) && embedUrl && (
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
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full rounded border-0"
                            title={content.name}
                            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            loading="lazy"
                            allowFullScreen
                            onLoad={() => {
                              setLoadingPreviews((prev) => ({
                                ...prev,
                                [`content-${content.id}`]: false,
                              }));
                            }}
                            onError={() => handleIframeError(content.id, 'youtube')}
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
                        onError={() => handleIframeError(content.id, 'pdf')}
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
                        onError={() => handleIframeError(content.id, 'office')}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPerangkatAjarPage;