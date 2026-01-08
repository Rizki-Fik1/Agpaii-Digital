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
        return `https://www.youtube.com/embed${parsed.pathname}`;
      }
      if (parsed.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
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
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!materialData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="text-xl text-gray-600 mb-4">Modul tidak ditemukan</div>
        <button
          onClick={() => router.push("/modul-ajar")}
          className="px-4 py-2 bg-[#006557] text-white rounded-lg"
        >
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
    <div className="bg-white min-h-screen pt-[5.21rem] pb-28">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white font-medium`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <TopBar withBackButton>
        <div className="flex flex-col">
          <span className="text-sm font-medium line-clamp-1">
            {materialData.jenjang?.nama_jenjang ||
              materialData.jenjang ||
              materialData.subject ||
              "Jenjang"}
          </span>
          <span className="text-xs opacity-80">
            {materialData.fase?.nama_fase || materialData.fase || "Fase E"} -{" "}
            {materialData.jenjang?.nama_jenjang ||
              materialData.grade?.description ||
              "Kelas 10"}
          </span>
        </div>
      </TopBar>

      {/* === TOMBOL EDIT & DELETE (HANYA UNTUK PEMILIK MODUL) === */}
      {user?.id && materialData?.user_id === user.id && (
        <div className="px-4 mt-4 flex justify-end gap-3">
          <button
            onClick={() => router.push(`/modul-ajar/edit/${materialId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors shadow-sm"
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
            Edit Modul
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors shadow-sm"
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
            Hapus Modul
          </button>
        </div>
      )}

      <div className="px-4 py-4">
        {/* Category Badge */}
        <span className="inline-block bg-[#006557] text-white text-xs px-3 py-1.5 rounded-full mb-4">
          {materialData.category || "Kegiatan Intrakurikuler"}
        </span>

        {/* Header Section */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {materialData.judul || materialData.topic}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              {materialData.deskripsi_singkat || materialData.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src={
                materialData.thumbnail
                  ? materialData.thumbnail.startsWith("http")
                    ? materialData.thumbnail
                    : `https://file.agpaiidigital.org/${materialData.thumbnail}`
                  : "/img/thumbnailmodul.png"
              }
              alt={materialData.judul || materialData.topic}
              className="w-24 h-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/img/thumbnailmodul.png";
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                isLiked ? "text-red-600" : "text-gray-600"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.828l-6.828-6.828a4 4 0 010-5.656z" />
            </svg>
            <span className="text-sm font-medium">
              {isLiked ? "Disukai" : "Sukai"}
            </span>
          </button>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#006557] text-white"
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
                d="M12 3v12m0 0l-4-4m4 4l4-4M21 21H3"
              />
            </svg>
            <span className="text-sm font-medium">Unduh Semua</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700"
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Bagikan</span>
          </button>
        </div>

        {/* Author Section */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
          onClick={() =>
            materialData.user?.id &&
            router.push(`/profile/${materialData.user.id}`)
          }
        >
          <img
            src={
              materialData.user?.avatar
                ? `https://file.agpaiidigital.org/${materialData.user.avatar}`
                : "https://avatar.iran.liara.run/public"
            }
            alt={materialData.user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {materialData.user?.name || "-"}
            </p>
            <p className="text-sm text-gray-500">
              {materialData.user?.profile?.school_place || "-"}
            </p>
          </div>
        </div>

        {/* Pilihan Guru Badge */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <img
                src="/svg/ikon guru.svg"
                alt="Pilihan Guru"
                className="w-8 h-8"
              />
            </div>
            <p className="text-sm text-gray-700">
              Salah satu perangkat ajar yang paling disukai
              <br />
              di AGPAII Digital, menurut pengajar.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#006557]">{likesCount}</p>
            <p className="text-xs text-gray-500">Menyukai</p>
          </div>
        </div>

        {/* Tentang Perangkat Ajar */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Tentang Perangkat Ajar
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {materialData.tentang_modul ||
              materialData.deskripsi_singkat ||
              materialData.description ||
              "Ajak Murid memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial)."}
          </p>
        </div>

        {/* Tujuan dan Alur */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Tujuan dan Alur Tujuan Pembelajaran
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            "
            {materialData.tujuan_pembelajaran ||
              materialData.tujuan ||
              "Memahami fikih mu'amalah dan al-kulliyyat al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan jiwa kewirausahaan, kepedulian, dan kepekaan sosial)."}
            "
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
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
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span className="text-2xl font-bold text-[#006557]">
                {likesCount}
              </span>
            </div>
            <p className="text-xs text-gray-500">Menyukai</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-2xl font-bold text-[#006557]">
                {materialData.downloads_count || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500">Diunduh</p>
          </div>
        </div>

        {/* Materi Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Materi</h2>
          <p className="text-sm text-gray-600 mb-4">
            Materi Pembelajaran yang mencakup fikih mu'amalah, al-kulliyyat
            al-khamsah (lima prinsip dasar hukum Islam dalam rangka menumbuhkan
            jiwa kewirausahaan, kepedulian, dan kepekaan sosial).
          </p>

          <div className="space-y-3">
            {displayedMateri.map((content: any, index: number) => {
              const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
              return (
                <React.Fragment key={`materi-${content.id || index}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getContentIcon(content)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#006557]">
                        Materi -{" "}
                        {content.name ||
                          content.judul ||
                          content.value ||
                          "Materi"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getContentType(content)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(content)}
                      className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                  {embedUrl && (
                    <div className="mt-2 bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={embedUrl}
                        className="w-full h-48"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {materi.length > 3 && (
            <button
              onClick={() => setShowAllFiles(!showAllFiles)}
              className="flex items-center justify-center w-full mt-3 text-gray-400"
            >
              <svg
                className={`w-6 h-6 transition-transform ${
                  showAllFiles ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Asesmen Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Asesmen</h2>
          <p className="text-sm text-gray-600 mb-4">
            Instrumen penilaian untuk mengukur pemahaman peserta didik terhadap
            materi yang telah dipelajari.
          </p>

          <div className="space-y-3">
            {displayedAssessments.map((content: any, index: number) => {
              const embedUrl = getYouTubeEmbedUrl(content?.youtube_url || "");
              return (
                <React.Fragment key={`asesmen-${content.id || index}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getContentIcon(content)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#006557]">
                        Asesmen -{" "}
                        {content.name ||
                          content.judul ||
                          content.value ||
                          "Asesmen"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getContentType(content)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(content)}
                      className="w-10 h-10 bg-[#006557] rounded-lg flex items-center justify-center hover:bg-[#005547] transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                  {embedUrl && (
                    <div className="mt-2 bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={embedUrl}
                        className="w-full h-48"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {assessments.length > 3 && (
            <button
              onClick={() => setShowAllFiles(!showAllFiles)}
              className="flex items-center justify-center w-full mt-3 text-gray-400"
            >
              <svg
                className={`w-6 h-6 transition-transform ${
                  showAllFiles ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          <div className="bg-[#006557] rounded-2xl p-4 mt-4 flex items-center gap-4 mb-6">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                Merasa Terbantu Dengan
                <br />
                Perangkat Ajar ini?
              </h3>
              <p className="text-white/80 text-sm">Beri tanda suka</p>
            </div>
            <img
              src="/img/image-12.png"
              alt="Mascot"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            <button
              onClick={handleLike}
              className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-colors ${
                isLiked ? "bg-blue-50 border-blue-200" : "border-gray-200"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  isLiked ? "text-blue-500" : "text-gray-600"
                }`}
                fill={isLiked ? "currentColor" : "none"}
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
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="flex-1 py-3 bg-[#006557] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {downloading ? "Mengunduh..." : "Unduh Perangkat Ajar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModulAjarPage;
