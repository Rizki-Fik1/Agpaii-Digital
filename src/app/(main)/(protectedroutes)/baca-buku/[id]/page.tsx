"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { getBookById, Book } from "@/constants/books-data";
import { getUserBookById, incrementViewCount } from "@/utils/books-storage";

// React Icons
import { BsDownload, BsEye, BsHeart, BsHeartFill } from "react-icons/bs";
import { FaBookOpen, FaRegFileAlt } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";
import { BiLike, BiSolidLike } from "react-icons/bi";

const BookDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id as string;
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  const [book, setBook] = useState<Book | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { auth: user } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      setLoading(true);

      // If API not configured, fallback to local data
      if (!API_URL) {
        console.error(
          "API base URL not configured. Falling back to local data."
        );
        let foundBook = getUserBookById(bookId);
        if (!foundBook) foundBook = getBookById(bookId);
        setBook(foundBook || null);
        if (foundBook) {
          setLikeCount(foundBook.likeCount || 0);
          if (bookId.startsWith("user-")) incrementViewCount(bookId);
        }
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const params: any = {};
        // Include user_id so API returns is_liked
        if (user?.id) params.user_id = user.id;

        const res = await axios.get(`${API_URL}/books/${bookId}`, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data?.data;
        if (!data) {
          setBook(null);
          setLoading(false);
          return;
        }

        const normalizeUrl = (path?: string | null) => {
          if (!path) return undefined;
          if (String(path).startsWith("http")) return String(path);
          return `https://file.agpaiidigital.org/${String(path).replace(
            /^\\/,
            ""
          )}`;
        };

        const mapped = {
          id: String(data.id),
          title: data.judul || data.title || "",
          author: data.author?.name || data.author || "",
          cover:
            normalizeUrl(data.cover_path) ||
            normalizeUrl(data.cover) ||
            "/img/book-placeholder.png",
          pdfUrl: data.file_path ? normalizeUrl(data.file_path) : undefined,
          category: data.category?.name || data.category || "Umum",
          description: data.deskripsi || data.description || "",
          likeCount: data.likes_count || 0,
          viewCount: data.view_count || 0,
          downloadCount:
            data.downloads_count || data.download_count || data.downloads || 0,
          uploadDate: data.created_at || undefined,
          pages: data.pages || undefined,
          publisher: data.publisher || undefined,
          year: data.year || undefined,
          isbn: data.isbn || undefined,
          jenjang:
            data.jenjang?.nama_jenjang ||
            data.jenjang?.name ||
            data.jenjang ||
            undefined,
          fase:
            data.fase?.nama_fase || data.fase?.name || data.fase || undefined,
        } as Book;

        setBook(mapped);
        setLikeCount(mapped.likeCount || 0);
        setIsLiked(data.is_liked || false);
      } catch (err) {
        console.error("Error fetching book:", err);
        alert("Gagal memuat detail buku");
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, API_URL, user?.id]);

  // Format date to Indonesian format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleLike = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likeCount;
    const willLike = !isLiked;

    // Optimistic UI
    setIsLiked(willLike);
    setLikeCount(willLike ? (likeCount || 0) + 1 : (likeCount || 0) - 1);

    if (!API_URL) {
      // Fallback behavior
      alert(willLike ? "Berhasil menyukai" : "Batal menyukai");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/books/${bookId}/like`,
        { user_id: user?.id },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
    } catch (error) {
      console.error("Error liking book:", error);
      // Revert optimistic update
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikesCount);
      alert("Gagal menyukai buku");
    }
  };

  const handleDownload = async () => {
    if (book?.pdfUrl) {
      // Trigger download in a new tab
      const link = document.createElement("a");
      link.href = book.pdfUrl;
      link.download = `${book.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track download via API if available
      if (API_URL) {
        try {
          const token = localStorage.getItem("token");
          await axios.get(`${API_URL}/books/${bookId}/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        } catch (err) {
          console.log("API tracking skipped:", err);
        }
      }
    } else {
      alert("File PDF belum tersedia untuk diunduh");
    }
  };

  const handlePreview = () => {
    if (book?.pdfUrl) {
      // Open PDF in new tab or navigate to reader page
      router.push(`/baca-buku/${bookId}/read`);
    } else {
      alert("Preview buku belum tersedia");
    }
  };

  // Get gradient colors based on category
  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      "Bahasa Inggris": "from-blue-400 to-blue-600",
      "Bahasa Indonesia": "from-red-400 to-rose-600",
      Matematika: "from-green-400 to-emerald-600",
      IPA: "from-cyan-400 to-teal-600",
      IPS: "from-amber-400 to-orange-600",
      PKn: "from-red-500 to-red-700",
      "Pendidikan Agama": "from-emerald-500 to-green-700",
      "Seni Budaya": "from-purple-400 to-violet-600",
      PJOK: "from-orange-400 to-red-600",
      Informatika: "from-indigo-400 to-blue-600",
    };
    return gradients[category] || "from-teal-500 to-emerald-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[4.2rem]">
        <TopBar withBackButton>Detail Buku</TopBar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[4.2rem]">
        <TopBar withBackButton>Detail Buku</TopBar>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <HiOutlineBookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">Buku tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar withBackButton>Detail Buku</TopBar>

      {/* Main Container - Single Frame */}
      <div className="max-w-[480px] mx-auto pt-[3.8rem] pb-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Book Cover - Centered */}
          <div className="flex justify-center py-6 px-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-gray-200">
              <img
                src={book.coverDataUrl || book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display =
                      "flex";
                  }
                }}
              />
              {/* Fallback Placeholder */}
              <div
                className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(
                  book.category
                )} flex-col items-center justify-center p-3 text-white`}
                style={{ display: "none" }}
              >
                <FaBookOpen className="w-12 h-12 mb-2" />
                <p className="text-sm text-center font-bold line-clamp-3">
                  {book.title}
                </p>
              </div>
            </div>
          </div>

          {/* Book Title & Author */}
          <div className="text-center px-5 pb-4">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {book.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">oleh {book.author}</p>
            <p className="text-gray-400 text-xs mt-1">
              Diunggah {formatDate(book.uploadDate)}
            </p>
          </div>

          {/* Statistics Row */}
          <div className="flex justify-center gap-6 py-4 mx-5 border-t border-b border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-teal-600">
                {book.downloadCount || 0}
              </p>
              <p className="text-[11px] text-gray-500">Unduhan</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-teal-600">{likeCount}</p>
              <p className="text-[11px] text-gray-500">Suka</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-teal-600">
                {book.viewCount || 0}
              </p>
              <p className="text-[11px] text-gray-500">Dilihat</p>
            </div>
          </div>

          {/* Book Information Section */}
          <div className="px-5 py-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">
              Informasi Buku
            </h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                  Nama Buku
                </span>
                <span className="text-xs text-gray-500 mr-2">:</span>
                <span className="text-xs text-gray-800">{book.title}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                  Jenjang Buku
                </span>
                <span className="text-xs text-gray-500 mr-2">:</span>
                <span className="text-xs text-gray-800">
                  {book.jenjang || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                  Halaman
                </span>
                <span className="text-xs text-gray-500 mr-2">:</span>
                <span className="text-xs text-gray-800">
                  {book.pages ? `${book.pages} halaman` : "-"}
                </span>
              </div>
              {book.publisher && (
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                    Penerbit
                  </span>
                  <span className="text-xs text-gray-500 mr-2">:</span>
                  <span className="text-xs text-gray-800">
                    {book.publisher}
                  </span>
                </div>
              )}
              {book.year && (
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                    Tahun Terbit
                  </span>
                  <span className="text-xs text-gray-500 mr-2">:</span>
                  <span className="text-xs text-gray-800">{book.year}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                    ISBN
                  </span>
                  <span className="text-xs text-gray-500 mr-2">:</span>
                  <span className="text-xs text-gray-800">{book.isbn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="px-5 pb-4">
            <h2 className="font-bold text-gray-900 mb-2 text-sm">
              Deskripsi Singkat
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {book.description || "Deskripsi buku belum tersedia."}
            </div>
          </div>

          {/* Action Buttons - Inside Frame */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex gap-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium text-xs transition-colors"
              >
                <BsDownload className="w-3.5 h-3.5" />
                Unduh Buku
              </button>

              {/* Preview Button */}
              {/* <button
                onClick={handlePreview}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium text-xs transition-colors"
              >
                <FaRegFileAlt className="w-3.5 h-3.5" />
                Preview
              </button> */}

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors ${
                  isLiked
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-teal-700 hover:bg-teal-800 text-white"
                }`}
              >
                {isLiked ? (
                  <BiSolidLike className="w-3.5 h-3.5" />
                ) : (
                  <BiLike className="w-3.5 h-3.5" />
                )}
                Suka
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
