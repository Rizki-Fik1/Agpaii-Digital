"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { Book } from "@/constants/books-data";
import { getUserBooks } from "@/utils/books-storage";

// React Icons
import { FaBookOpen } from "react-icons/fa";
import { BiLike, BiShow } from "react-icons/bi";
import { HiOutlineBookOpen } from "react-icons/hi";

// Separate component that uses useSearchParams
function SemuaBukuContent() {
  const router = useRouter();
  const { auth: user } = useAuth();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort");

  const [activeTab, setActiveTab] = useState<"all" | "likes" | "views">(
    sortParam === "likes" ? "likes" : sortParam === "views" ? "views" : "all"
  );
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  // Fetch books from server and merge with local user books
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const userBooks = getUserBooks();

      if (!API_URL) {
        setAllBooks([...userBooks]);
        return;
      }

      const params: any = { per_page: 100 }; // Adjust as needed

      const res = await axios.get(`${API_URL}/books`, { params });
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
          viewCount: b.view_count || 0,
          uploadDate: b.created_at || undefined,
        };
      });

      setAllBooks([...userBooks, ...fetched]);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError("Gagal memuat buku dari server. Menampilkan buku lokal saja.");
      setAllBooks([...getUserBooks()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [API_URL]);

  // Get sorted books based on active tab
  const getSortedBooks = () => {
    const books = [...allBooks];
    switch (activeTab) {
      case "likes":
        return books.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case "views":
        return books.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      default:
        return books;
    }
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/baca-buku/${bookId}`);
  };

  const handleTabChange = (tab: "all" | "likes" | "views") => {
    setActiveTab(tab);
    // Update URL without navigation
    const url = new URL(window.location.href);
    if (tab === "all") {
      url.searchParams.delete("sort");
    } else {
      url.searchParams.set("sort", tab);
    }
    window.history.replaceState({}, "", url.toString());
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

  // Book Card Component
  const BookCard = ({ book }: { book: Book }) => {
    const coverSrc = book.coverDataUrl || book.cover;

    return (
      <div
        onClick={() => handleBookClick(book.id)}
        className="flex flex-col cursor-pointer group"
      >
        {/* Book Cover */}
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-gray-100">
          <img
            src={coverSrc}
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
            className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(
              book.category
            )} flex-col items-center justify-center p-2 text-white`}
            style={{ display: "none" }}
          >
            <span className="text-[8px] font-bold mb-1">{book.category}</span>
            <p className="text-[9px] text-center font-bold line-clamp-3 leading-tight px-1">
              {book.title}
            </p>
          </div>

          {/* Stats Badge */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between">
            {activeTab === "likes" && (
              <span className="bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                <BiLike className="w-2.5 h-2.5" />
                {book.likeCount || 0}
              </span>
            )}
            {activeTab === "views" && (
              <span className="bg-teal-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                <BiShow className="w-2.5 h-2.5" />
                {book.viewCount || 0}
              </span>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="mt-2 px-0.5">
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
            {book.title}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
            {book.author}
          </p>
        </div>
      </div>
    );
  };

  const sortedBooks = getSortedBooks();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar withBackButton>Semua Buku</TopBar>

      <div className="max-w-[480px] mx-auto pt-[3.8rem] pb-6">
        {/* Tab Filter */}
        <div className="bg-white sticky top-[3.8rem] z-40 px-4 py-3 border-b border-gray-100 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("all")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleTabChange("likes")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === "likes"
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BiLike className="w-3.5 h-3.5" />
              Terfavorit
            </button>
            <button
              onClick={() => handleTabChange("views")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === "views"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BiShow className="w-3.5 h-3.5" />
              Terlaris
            </button>
          </div>
        </div>

        {/* Books Count */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">
              {sortedBooks.length}
            </span>{" "}
            buku
            {activeTab === "likes" && " (diurutkan berdasarkan jumlah suka)"}
            {activeTab === "views" && " (diurutkan berdasarkan jumlah dilihat)"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-xs rounded-lg mx-4">
            {error}
          </div>
        )}

        {/* Books Grid */}
        <div className="px-4">
          {loading && sortedBooks.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : sortedBooks.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {sortedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <HiOutlineBookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Belum ada buku</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
const SemuaBukuPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      }
    >
      <SemuaBukuContent />
    </Suspense>
  );
};

export default SemuaBukuPage;
