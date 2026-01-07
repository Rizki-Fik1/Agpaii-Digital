"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { Book } from "@/constants/books-data";

// React Icons
import { BsBookmark, BsTrash, BsThreeDotsVertical } from "react-icons/bs";
import { FaBookOpen } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";

const KoleksiBukuPage = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchLikedBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!API_URL) {
          setError("API base URL not configured");
          setLikedBooks([]);
          return;
        }

        const res = await axios.get(`${API_URL}/books/liked`, {
          params: {
            user_id: user.id,
            per_page: 100, // Adjust as needed for pagination
          },
        });

        const data = res.data?.data || [];

        const fetched: Book[] = data.map((b: any) => {
          const normalizeUrl = (path?: string | null) => {
            if (!path) return undefined;
            if (String(path).startsWith("http")) return String(path);
            return `https://file.agpaiidigital.org/${String(path).replace(
              /^\\/,
              ""
            )}`;
          };

          const cover =
            normalizeUrl(b.cover_path) ||
            normalizeUrl(b.cover) ||
            "/img/book-placeholder.png";
          const pdfUrl = b.file_path ? normalizeUrl(b.file_path) : undefined;

          return {
            id: String(b.id),
            title: b.judul || b.title || "",
            author: b.author?.name || "",
            cover,
            pdfUrl,
            category: b.category?.name || b.category || "Umum",
            description: b.deskripsi || b.description || "",
            likeCount: b.likes_count || 0,
            viewCount: b.views || 0,
            uploadDate: b.created_at || undefined,
          };
        });

        setLikedBooks(fetched);
      } catch (err) {
        console.error("Failed to fetch liked books:", err);
        setError("Gagal memuat buku yang disukai. Coba lagi nanti.");
        setLikedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedBooks();
  }, [user?.id, API_URL]);

  const handleBookClick = (bookId: string) => {
    router.push(`/baca-buku/${bookId}`);
  };

  const handleRemoveBook = async (bookId: string) => {
    if (!user?.id || !API_URL) return;

    try {
      // Call unlike endpoint (assuming toggleLike can unlike)
      await axios.post(`${API_URL}/books/${bookId}/like`, {
        // If toggleLike requires data, add it here
      });

      // Optimistic update: remove from list
      setLikedBooks(likedBooks.filter((book) => book.id !== bookId));
      setShowMenu(null);
    } catch (err) {
      console.error("Failed to unlike book:", err);
      alert("Gagal menghapus like. Coba lagi.");
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

  const BookCard = ({ book }: { book: Book }) => {
    // Use coverDataUrl (PDF generated) if available, otherwise use cover URL
    const coverSrc = book.coverDataUrl || book.cover;

    return (
      <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 relative">
        {/* Book Cover */}
        <div
          onClick={() => handleBookClick(book.id)}
          className="w-20 flex-shrink-0 cursor-pointer"
        >
          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md bg-gray-200">
            {/* Book Cover Image */}
            <img
              src={coverSrc}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display =
                    "flex";
                }
              }}
            />
            {/* Fallback Placeholder (hidden by default) */}
            <div
              className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(
                book.category
              )} flex-col items-center justify-center p-2 text-white`}
              style={{ display: "none" }}
            >
              <HiOutlineBookOpen className="w-6 h-6 mb-1" />
              <p className="text-[7px] text-center font-bold line-clamp-2 px-0.5">
                {book.title}
              </p>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div
          className="flex-1 min-w-0"
          onClick={() => handleBookClick(book.id)}
        >
          <span className="inline-block bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full font-medium mb-1">
            {book.category}
          </span>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-0.5">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookClick(book.id);
            }}
            className="mt-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs rounded-lg font-medium"
          >
            Baca
          </button>
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(showMenu === book.id ? null : book.id);
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <BsThreeDotsVertical className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu === book.id && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBook(book.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 text-xs"
              >
                <BsTrash className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[3.8rem] pb-6">
      <TopBar withBackButton>Buku Saya</TopBar>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-700 px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <BsBookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">
              Koleksi Buku Saya
            </h2>
            <p className="text-teal-100 text-sm">
              {likedBooks.length} buku tersimpan
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs rounded-lg mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Books List */}
      <div className="px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4" />
            <p className="text-gray-500 text-center">Memuat buku...</p>
          </div>
        ) : likedBooks.length > 0 ? (
          <div className="space-y-3">
            {likedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaBookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-center mb-2">
              Belum ada buku tersimpan
            </p>
            <p className="text-gray-400 text-sm text-center mb-4">
              Simpan buku favoritmu untuk dibaca nanti
            </p>
            <button
              onClick={() => router.push("/baca-buku")}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-sm font-medium"
            >
              Jelajahi Buku
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KoleksiBukuPage;
