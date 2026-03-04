"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const DetailModulAjarPage: React.FC = () => {
  const { id: materialId } = useParams();
  const router = useRouter();
  const { auth: user } = useAuth();

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  const [materialData, setMaterialData] = useState<any>(null);
  const [materi, setMateri] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showAllFiles, setShowAllFiles] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Repost modal states
  const [showRepostModal, setShowRepostModal] = useState<boolean>(false);
  const [repostTitle, setRepostTitle] = useState<string>("");
  const [isReposting, setIsReposting] = useState<boolean>(false);

  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!materialId) return;

      if (!API_URL) {
        console.error(
          "API base URL not configured. Please set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL2"
        );
        showToast(
          "Terjadi kesalahan: konfigurasi API tidak ditemukan",
          "error"
        );
        setLoading(false);
        return;
      }

      try {
        const params: any = {};
        if (user?.id) {
          params.user_id = user.id;
        }

        const response = await axios.get(
          `${API_URL}/modules-learn/${materialId}`,
          { params }
        );
        const data = response.data?.data;
        setMaterialData(data);
        setMateri(data?.materi || []);
        setAssessments(data?.assessments || []);
        setLikesCount(data?.likes_count || 0);
        setIsLiked(data?.is_liked || false);
      } catch (error) {
        console.error("Error fetching module data:", error);
        showToast("Gagal memuat modul", "error");
        setMaterialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [materialId, API_URL, user?.id]);

  // Open repost modal
  const handleRepost = () => {
    if (!user?.id) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }
    // Set initial title empty - user must enter a new name
    setRepostTitle("");
    setShowRepostModal(true);
  };

  // Submit repost with new title
  const submitRepost = async () => {
    if (!user?.id) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }

    const originalTitle = materialData?.judul || materialData?.topic || "";
    
    // Normalize both titles: remove all spaces and convert to lowercase
    const normalizeTitle = (title: string) => 
      title.replace(/\s+/g, "").toLowerCase();
    
    // Validate title is different from original (ignoring spaces and case)
    if (normalizeTitle(repostTitle) === normalizeTitle(originalTitle)) {
      showToast("Judul modul harus berbeda dari modul asli", "error");
      return;
    }

    if (!repostTitle.trim()) {
      showToast("Judul modul tidak boleh kosong", "error");
      return;
    }

    setIsReposting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/modules-learn/${materialId}/repost`,
        { 
          user_id: user.id,
          judul: repostTitle.trim() 
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const newModuleId = response.data?.data?.module_id;

      setShowRepostModal(false);
      showToast("Modul berhasil direpost ke koleksi Anda", "success");

      if (newModuleId) {
        setTimeout(() => {
          router.push(`/modul-ajar/edit/${newModuleId}`);
        }, 800);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Gagal merepost modul",
        "error"
      );
    } finally {
      setIsReposting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const willLike = !isLiked;

    setIsLiked(willLike);
    setLikesCount(willLike ? likesCount + 1 : likesCount - 1);

    if (!API_URL) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/modules-learn/${materialId}/like`,
        { user_id: user?.id },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      showToast(willLike ? "Berhasil menyukai" : "Batal menyukai", "success");
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      showToast("Gagal menyukai modul", "error");
    }
  };

  const handleDownload = async (content?: any) => {
    setDownloading(true);

    if (API_URL) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_URL}/modules-learn/${materialId}/download`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      } catch (error) {
        console.log("API tracking skipped:", error);
      }
    }

    try {
      if (content?.file_path) {
        const filePath = content.file_path;
        const fileUrl = filePath.startsWith("http")
          ? filePath
          : `https://file.agpaiidigital.org/${filePath.replace(/^\\/, "")}`;

        const link = document.createElement("a");
        link.href = fileUrl;
        const getBasename = (p: string) => p.split("/").pop() || "";
        const hasExt = (n: string) => /\.[0-9a-z]+$/i.test(n);
        const fileNameFromPath = getBasename(filePath);
        const downloadName =
          content.name && hasExt(content.name)
            ? content.name
            : fileNameFromPath || content.name || content.judul || "download";
        link.download = downloadName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("File sedang diunduh", "success");
      } else if (content?.youtube_url) {
        const win = window.open(content.youtube_url, "_blank");
        if (win) win.opener = null;
        showToast("Membuka link YouTube", "success");
      } else {
        showToast("URL file tidak ditemukan", "error");
      }
    } catch (error) {
      console.error("Error downloading:", error);
      showToast("Gagal mengunduh file", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);

    if (API_URL) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_URL}/modules-learn/${materialId}/download`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      } catch (error) {
        console.log("API tracking skipped:", error);
      }
    }

    try {
      const totalFiles = (materi?.length || 0) + (assessments?.length || 0);
      if (totalFiles > 0) {
        showToast(`Menyiapkan ${totalFiles} file...`, "success");

        const zip = new JSZip();
        const moduleName =
          materialData?.judul || materialData?.topic || "Modul-Ajar";

        const materiFolder = zip.folder("Materi");
        const asesmenFolder = zip.folder("Asesmen");

        const addFileFromPath = async (
          path: string,
          folder: any,
          nameHint: string
        ) => {
          const fileUrl = path.startsWith("http")
            ? path
            : `https://file.agpaiidigital.org/${path.replace(/^\\/, "")}`;
          try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const getBasename = (p: string) => p.split("/").pop() || "";
            const hasExt = (n: string) => /\.[0-9a-z]+$/i.test(n);
            const filenameFromPath = getBasename(path);
            const nameToUse =
              nameHint && hasExt(nameHint)
                ? nameHint
                : filenameFromPath || nameHint || "file";
            folder.file(nameToUse, blob);
          } catch (err) {
            console.error("Error fetching file for zip:", err);
          }
        };

        for (let i = 0; i < (materi?.length || 0); i++) {
          const content = materi[i];
          if (content?.file_path) {
            await addFileFromPath(
              content.file_path,
              materiFolder,
              content.name || content.judul || `materi-${i + 1}`
            );
          } else if (content?.youtube_url) {
            materiFolder?.file(
              `${content.name || content.judul || `materi-${i + 1}`}.txt`,
              content.youtube_url
            );
          }
        }

        for (let i = 0; i < (assessments?.length || 0); i++) {
          const content = assessments[i];
          if (content?.file_path) {
            await addFileFromPath(
              content.file_path,
              asesmenFolder,
              content.name || content.judul || `asesmen-${i + 1}`
            );
          } else if (content?.youtube_url) {
            asesmenFolder?.file(
              `${content.name || content.judul || `asesmen-${i + 1}`}.txt`,
              content.youtube_url
            );
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipFileName = `${moduleName.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_Perangkat_Ajar.zip`;
        saveAs(zipBlob, zipFileName);

        showToast("Semua file berhasil diunduh dalam satu paket!", "success");
      } else {
        showToast("Tidak ada file untuk diunduh", "error");
      }
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      showToast("Gagal membuat paket unduhan", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/modul-ajar/${materialId}`;
    const shareText = `Lihat modul ajar "${
      materialData?.judul || materialData?.topic
    }" di AGPAII Digital`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: materialData?.judul || materialData?.topic || "Modul Ajar",
          text: shareText,
          url: shareUrl,
        });
        showToast("Berhasil membagikan", "success");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin!", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      showToast("Gagal menyalin link", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // === FUNGSI HAPUS MODUL ===
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus modul ajar ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    if (!API_URL) {
      showToast("Konfigurasi API tidak ditemukan", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/modules-learn/${materialId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      showToast("Modul ajar berhasil dihapus!", "success");
      setTimeout(() => {
        router.push("/modul-ajar");
      }, 1500);
    } catch (error: any) {
      console.error("Gagal menghapus modul:", error);
      showToast(
        error.response?.data?.message || "Gagal menghapus modul.",
        "error"
      );
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") {
        const videoId = parsed.pathname.slice(1);
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
      if (parsed.searchParams.get("v")) {
        return `https://www.youtube-nocookie.com/embed/${parsed.searchParams.get("v")}`;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return `https://www.youtube-nocookie.com/embed/${parsed.pathname.split("/")[2]}`;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url.replace("youtube.com", "youtube-nocookie.com");
      }
      return null;
    } catch {
      return null;
    }
  };

  const getContentType = (content: any): string => {
    if (content?.youtube_url) return "YOUTUBE";
    return (
      (content.file_type || content.format_doc || "").toUpperCase() || "FILE"
    );
  };

  const getContentIcon = (content: any) => {
    if (content?.youtube_url) {
      return (
        <svg
          className="w-6 h-6 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v10l6-5-6-5z" />
        </svg>
      );
    }
    return (
      <svg
        className="w-6 h-6 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-2 border-[#006557] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">Memuat modul...</p>
      </div>
    );
  }

  if (!materialData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold mb-1">Modul tidak ditemukan</p>
        <p className="text-gray-400 text-sm mb-4">Modul mungkin telah dihapus</p>
        <button onClick={() => router.push("/modul-ajar")} className="px-5 py-2.5 bg-[#006557] text-white rounded-xl text-sm font-medium">
          Kembali
        </button>
      </div>
    );
  }

  const displayedMateri = showAllFiles ? materi : materi.slice(0, 3);
  const displayedAssessments = showAllFiles
    ? assessments
    : assessments.slice(0, 3);

  return (
    <div>
      {/* Toast - shared */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-5 py-2.5 rounded-xl shadow-lg text-white font-medium text-sm ${
            toast.type === "success" ? "bg-[#006557]" : "bg-red-500"
          }`}>{toast.message}</div>
        </div>
      )}

      {/* =========== MOBILE VIEW - tampilan lama =========== */}
      <div className="md:hidden bg-white min-h-screen pt-[5.21rem] pb-28">
        <TopBar withBackButton>
          <div className="flex flex-col">
            <span className="text-sm font-medium line-clamp-1">{materialData.jenjang?.nama_jenjang || materialData.jenjang || materialData.subject || "Jenjang"}</span>
            <span className="text-xs opacity-80">{materialData.fase?.nama_fase || materialData.fase || "Fase E"} - {materialData.jenjang?.nama_jenjang || materialData.grade?.description || "Kelas 10"}</span>
          </div>
        </TopBar>

        {user?.id && materialData?.user_id === user.id && (
          <div className="px-4 mt-4 flex justify-end gap-2">
            <button onClick={() => router.push(`/modul-ajar/edit/${materialId}`)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </button>
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Hapus
            </button>
          </div>
        )}

        <div className="px-4 py-4">
          <span className="inline-block bg-[#006557] text-white text-xs px-3 py-1.5 rounded-full mb-4">{materialData.category || "Kegiatan Intrakurikuler"}</span>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{materialData.judul || materialData.topic}</h1>
              {materialData.is_repost && materialData.repost && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">Repost</span>
                  <span className="text-xs text-gray-500">Direpost dari <span className="font-medium text-purple-700 cursor-pointer" onClick={() => router.push(`/modul-ajar/${materialData.repost.module_id}`)}>{materialData.repost.author?.name || "Pengguna lain"}</span></span>
                </div>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">{materialData.deskripsi_singkat || materialData.description}</p>
            </div>
            <div className="flex-shrink-0">
              <img src={materialData.thumbnail ? (materialData.thumbnail.startsWith("http") ? materialData.thumbnail : `https://file.agpaiidigital.org/${materialData.thumbnail}`) : "/img/thumbnailmodul.png"} alt={materialData.judul || materialData.topic} className="w-24 h-32 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = "/img/thumbnailmodul.png"; }} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm ${isLiked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" /></svg>
              <span className="font-medium">{isLiked ? "Disukai" : "Sukai"}</span>
            </button>
            <button onClick={handleDownloadAll} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#006557] text-white text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="font-medium">Unduh Semua</span>
            </button>
            {user?.id && materialData?.user_id !== user.id && (
              <button onClick={handleRepost} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="font-medium">Repost</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-gray-100 p-2 rounded-lg" onClick={() => materialData.user?.id && router.push(`/profile/${materialData.user.id}`)}>
            <img src={materialData.user?.avatar ? `https://file.agpaiidigital.org/${materialData.user.avatar}` : "/img/profileplacholder.png"} alt={materialData.user?.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900">{materialData.user?.name || "-"}</p>
              <p className="text-sm text-gray-500">{materialData.user?.profile?.school_place || "-"}</p>
              <p className="text-xs text-[#006557] mt-1">{materialData.user?.modules_learn_count || 0} Modul Diposting</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"><img src="/svg/ikon guru.svg" alt="Pilihan Guru" className="w-6 h-6" /></div>
              <p className="text-xs text-gray-700 leading-relaxed">Salah satu perangkat ajar yang paling disukai di AGPAII Digital, menurut pengajar.</p>
            </div>
            <div className="text-right"><p className="text-xl font-bold text-[#006557]">{likesCount}</p><p className="text-xs text-gray-500">Menyukai</p></div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Tentang Modul Ajar</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{materialData.tentang_modul || materialData.deskripsi_singkat || materialData.description || "Tidak ada deskripsi."}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Tujuan dan Alur Tujuan Pembelajaran</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{materialData.tujuan_pembelajaran || materialData.tujuan || "Tidak ada tujuan pembelajaran."}</p>
          </div>

          <div className="flex gap-2 mb-6">
            <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1"><svg className="w-4 h-4 text-[#006557]" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" /></svg><span className="text-lg font-bold text-[#006557]">{likesCount}</span></div>
              <p className="text-[10px] text-gray-500">Menyukai</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1"><svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="text-lg font-bold text-[#006557]">{materialData.downloads_count || 0}</span></div>
              <p className="text-[10px] text-gray-500">Diunduh</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1"><svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="text-lg font-bold text-[#006557]">{materialData.reposts_count || 0}</span></div>
              <p className="text-[10px] text-gray-500">Direpost</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Materi</h2>
            <div className="space-y-3">
              {displayedMateri.map((content: any, index: number) => {
                const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
                return (
                  <React.Fragment key={`m-mob-${content.id || index}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">{getContentIcon(content)}</div>
                      <div className="flex-1"><p className="text-sm font-medium text-[#006557]">{content.name || content.judul || content.value || "Materi"}</p><p className="text-xs text-gray-400">{getContentType(content)}</p></div>
                      <button onClick={() => handleDownload(content)} className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    </div>
                    {embedUrl && (<div className="mt-2 bg-gray-100 rounded-lg overflow-hidden"><iframe src={embedUrl} className="w-full h-48" title={content.name || content.judul || "YouTube Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" /></div>)}
                  </React.Fragment>
                );
              })}
            </div>
            {materi.length > 3 && (<button onClick={() => setShowAllFiles(!showAllFiles)} className="flex items-center justify-center w-full mt-3 text-gray-400"><svg className={`w-6 h-6 transition-transform ${showAllFiles ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>)}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Asesmen</h2>
            <div className="space-y-3">
              {displayedAssessments.map((content: any, index: number) => {
                const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
                return (
                  <React.Fragment key={`a-mob-${content.id || index}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">{getContentIcon(content)}</div>
                      <div className="flex-1"><p className="text-sm font-medium text-[#006557]">{content.name || content.judul || content.value || "Asesmen"}</p><p className="text-xs text-gray-400">{getContentType(content)}</p></div>
                      <button onClick={() => handleDownload(content)} className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    </div>
                    {embedUrl && (<div className="mt-2 bg-gray-100 rounded-lg overflow-hidden"><iframe src={embedUrl} className="w-full h-48" title={content.name || content.judul || "YouTube Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" /></div>)}
                  </React.Fragment>
                );
              })}
            </div>
            {assessments.length > 3 && (<button onClick={() => setShowAllFiles(!showAllFiles)} className="flex items-center justify-center w-full mt-3 text-gray-400"><svg className={`w-6 h-6 transition-transform ${showAllFiles ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>)}
            <div className="bg-[#006557] rounded-2xl p-4 mt-4 flex items-center gap-4 mb-6">
              <div className="flex-1"><h3 className="text-white font-bold text-lg mb-1">Merasa Terbantu Dengan<br />Perangkat Ajar ini?</h3><p className="text-white/80 text-sm">Beri tanda suka</p></div>
              <img src="/img/image-12.png" alt="Mascot" className="w-24 h-24 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl"><svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            <button onClick={handleLike} className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-colors ${isLiked ? "bg-red-50 border-red-200" : "border-gray-200"}`}><svg className={`w-5 h-5 ${isLiked ? "text-red-500" : "text-gray-600"}`} viewBox="0 0 20 20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isLiked ? 0 : 1.5}><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" /></svg></button>
            <button onClick={handleDownloadAll} disabled={downloading} className="flex-1 py-3 bg-[#006557] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {downloading ? "Mengunduh..." : "Unduh Perangkat Ajar"}
            </button>
          </div>
        </div>
      </div>

      {/* =========== DESKTOP VIEW - tampilan baru =========== */}
      <div className="hidden md:block bg-gray-50 min-h-screen pb-28">
        <TopBar withBackButton>
          <div className="flex flex-col">
            <span className="text-sm font-medium line-clamp-1">{materialData.jenjang?.nama_jenjang || materialData.jenjang || materialData.subject || "Jenjang"}</span>
            <span className="text-xs opacity-80">{materialData.fase?.nama_fase || materialData.fase || "Fase E"} - {materialData.jenjang?.nama_jenjang || materialData.grade?.description || "Kelas 10"}</span>
          </div>
        </TopBar>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#006557] to-[#004d40] px-4 pt-24 pb-14">
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="inline-block bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2">
              {materialData.category || "Kegiatan Intrakurikuler"}
            </span>
            <h1 className="text-white font-bold text-lg leading-snug line-clamp-3">
              {materialData.judul || materialData.topic}
            </h1>
            {materialData.is_repost && materialData.repost && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/20 text-white">Repost</span>
                <span className="text-xs text-white/70">dari {materialData.repost.author?.name || "Pengguna lain"}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="w-[72px] h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
              <img
                src={materialData.thumbnail ? (materialData.thumbnail.startsWith("http") ? materialData.thumbnail : `https://file.agpaiidigital.org/${materialData.thumbnail}`) : "/img/thumbnailmodul.png"}
                alt={materialData.judul || materialData.topic}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/img/thumbnailmodul.png"; }}
              />
            </div>
          </div>
        </div>
        <p className="text-white/75 text-sm mt-3 leading-relaxed line-clamp-2">
          {materialData.deskripsi_singkat || materialData.description}
        </p>
      </div>

      {/* Floating Action Card */}
      <div className="mx-4 -mt-7 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isLiked ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-50 text-gray-600 border border-gray-100"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" />
            </svg>
            <span>{isLiked ? "Disukai" : "Sukai"}</span>
          </button>
          {user?.id && materialData?.user_id !== user.id && (
            <button
              onClick={handleRepost}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-sm font-medium hover:bg-purple-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Repost</span>
            </button>
          )}
          {user?.id && materialData?.user_id === user.id && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => router.push(`/modul-ajar/edit/${materialId}`)}
                className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 hover:bg-amber-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 mt-4 space-y-4">
        {/* Author Card */}
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
          onClick={() => materialData.user?.id && router.push(`/profile/${materialData.user.id}`)}
        >
          <img
            src={materialData.user?.avatar ? `https://file.agpaiidigital.org/${materialData.user.avatar}` : "/img/profileplacholder.png"}
            alt={materialData.user?.name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">{materialData.user?.name || "-"}</p>
            <p className="text-xs text-gray-500 truncate">{materialData.user?.profile?.school_place || "-"}</p>
            <p className="text-xs text-[#006557] font-semibold mt-0.5">{materialData.user?.modules_learn_count || 0} Modul</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" />
              </svg>
              <span className="text-lg font-bold text-gray-800">{likesCount}</span>
            </div>
            <p className="text-[10px] text-gray-400">Suka</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-lg font-bold text-gray-800">{materialData.downloads_count || 0}</span>
            </div>
            <p className="text-[10px] text-gray-400">Unduhan</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-lg font-bold text-gray-800">{materialData.reposts_count || 0}</span>
            </div>
            <p className="text-[10px] text-gray-400">Repost</p>
          </div>
        </div>

        {/* Tentang Modul */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-[#006557]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Tentang Modul
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {materialData.tentang_modul || materialData.deskripsi_singkat || materialData.description || "Tidak ada deskripsi."}
          </p>
        </div>

        {/* Tujuan Pembelajaran */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </span>
            Tujuan Pembelajaran
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {materialData.tujuan_pembelajaran || materialData.tujuan || "Tidak ada tujuan pembelajaran."}
          </p>
        </div>

        {/* Materi Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Materi
            <span className="ml-auto text-xs text-gray-400 font-normal">{materi.length} file</span>
          </h2>
          <div className="space-y-2">
            {displayedMateri.map((content: any, index: number) => {
              const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
              return (
                <React.Fragment key={`materi-${content.id || index}`}>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                      {getContentIcon(content)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {content.name || content.judul || content.value || "Materi"}
                      </p>
                      <p className="text-[10px] text-gray-400">{getContentType(content)}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(content)}
                      className="w-9 h-9 bg-[#006557] rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#005547] transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {embedUrl && (
                    <div className="mt-1 bg-gray-100 rounded-xl overflow-hidden">
                      <iframe src={embedUrl} className="w-full h-48" title={content.name || content.judul || "YouTube Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {materi.length > 3 && (
            <button onClick={() => setShowAllFiles(!showAllFiles)}
              className="flex items-center justify-center w-full mt-3 text-[#006557] text-sm font-medium gap-1">
              {showAllFiles ? "Sembunyikan" : `Lihat ${materi.length - 3} lainnya`}
              <svg className={`w-4 h-4 transition-transform ${showAllFiles ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Asesmen Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </span>
            Asesmen
            <span className="ml-auto text-xs text-gray-400 font-normal">{assessments.length} file</span>
          </h2>
          <div className="space-y-2">
            {displayedAssessments.map((content: any, index: number) => {
              const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
              return (
                <React.Fragment key={`asesmen-${content.id || index}`}>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                      {getContentIcon(content)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {content.name || content.judul || content.value || "Asesmen"}
                      </p>
                      <p className="text-[10px] text-gray-400">{getContentType(content)}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(content)}
                      className="w-9 h-9 bg-[#006557] rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#005547] transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {embedUrl && (
                    <div className="mt-1 bg-gray-100 rounded-xl overflow-hidden">
                      <iframe src={embedUrl} className="w-full h-48" title={content.name || content.judul || "YouTube Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {assessments.length > 3 && (
            <button onClick={() => setShowAllFiles(!showAllFiles)}
              className="flex items-center justify-center w-full mt-3 text-[#006557] text-sm font-medium gap-1">
              {showAllFiles ? "Sembunyikan" : `Lihat ${assessments.length - 3} lainnya`}
              <svg className={`w-4 h-4 transition-transform ${showAllFiles ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-[#006557] to-[#004d40] rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-0.5">Merasa Terbantu?</h3>
            <p className="text-white/75 text-sm">Beri tanda suka pada modul ini!</p>
          </div>
          <img src="/img/image-12.png" alt="Mascot" className="w-20 h-20 object-contain flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-20 lg:left-64 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
        <div className="max-w-[480px] md:max-w-none mx-auto flex items-center gap-3">
          <button
            onClick={handleShare}
            className="w-11 h-11 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={handleLike}
            className={`w-11 h-11 flex items-center justify-center border rounded-xl transition-colors ${
              isLiked ? "bg-red-50 border-red-200" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg className={`w-5 h-5 ${isLiked ? "text-red-500" : "text-gray-500"}`} viewBox="0 0 20 20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isLiked ? 0 : 1.5}>
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" />
            </svg>
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="flex-1 py-3 bg-gradient-to-r from-[#006557] to-[#00897B] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md transition-all"
          >
            {downloading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mengunduh...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>Unduh Perangkat Ajar</>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Repost Modal */}
      {showRepostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
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
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Repost Modul</h3>
                <p className="text-sm text-gray-500">Ubah judul modul sebelum menyimpan</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Modul Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={repostTitle}
                onChange={(e) => setRepostTitle(e.target.value)}
                placeholder="Masukkan judul modul baru"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">
                Judul harus berbeda dari modul asli: "{materialData?.judul || materialData?.topic}"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRepostModal(false)}
                disabled={isReposting}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={submitRepost}
                disabled={isReposting || !repostTitle.trim()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isReposting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Simpan Repost
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default DetailModulAjarPage;
