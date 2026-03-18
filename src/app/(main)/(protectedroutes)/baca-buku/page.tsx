"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import axios from "axios";
import { Book } from "@/constants/books-data";
import { getUserBooks } from "@/utils/books-storage";

// React Icons
import { BsSearch, BsPlusLg } from "react-icons/bs";
import { FaPlus, FaBookmark } from "react-icons/fa";

const BacaBukuPage = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const fabRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  const [loading, setLoading] = useState<boolean>(false);

  // Load user books from localStorage and fetch server books (supports server-side search)
  const fetchBooks = async () => {
    const userBooks = getUserBooks();

    if (!API_URL) {
      console.error("API base URL not configured");

      // When offline, apply client-side search to local books if searchQuery present
      const local = searchQuery
        ? userBooks.filter((b) => {
            const q = searchQuery.toLowerCase();
            return (
              (b.title || "").toLowerCase().includes(q) ||
              (b.author || "").toLowerCase().includes(q) ||
              (b.category || "").toLowerCase().includes(q)
            );
          })
        : userBooks;

      setAllBooks([...local]);
      return;
    }

    setLoading(true);
    try {
      // Build query params for server-side filtering
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get(`${API_URL}/books`, { params });
      const data = res.data?.data || [];

      const fetched = data.map((b: any) => {
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

      // If searching, also filter local user books to keep results consistent
      const local = searchQuery
        ? userBooks.filter((b) => {
            const q = searchQuery.toLowerCase();
            return (
              (b.title || "").toLowerCase().includes(q) ||
              (b.author || "").toLowerCase().includes(q) ||
              (b.category || "").toLowerCase().includes(q)
            );
          })
        : userBooks;

      setAllBooks([...local, ...fetched]);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setAllBooks([...userBooks]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [API_URL, searchQuery]);

  // Close FAB menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setShowFabMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get real-time user name
  const getUserDisplayName = () => {
    // Try different possible user name fields
    if (user?.name) {
      return user.name;
    }
    if (user?.profile?.name) {
      return user.profile.name;
    }
    if (user?.full_name) {
      return user.full_name;
    }
    return "Pengguna";
  };

  const filteredBooks = allBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    // Trigger a server-side search
    fetchBooks();
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/baca-buku/${bookId}`);
  };

  const handleTambahBuku = () => {
    setShowFabMenu(false);
    router.push("/baca-buku/tambah");
  };

  const handleBukuSaya = () => {
    setShowFabMenu(false);
    router.push("/baca-buku/koleksi");
  };
  const trimText = (text: string, maxLength = 18) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  };
  // Book Card Component with Image Cover (supports PDF thumbnail)
  const BookCard = ({ book }: { book: Book }) => {
    // Use coverDataUrl (PDF generated) if available, otherwise use cover URL
    const coverSrc = book.coverDataUrl || book.cover;

    return (
      <div
        onClick={() => handleBookClick(book.id)}
        className="flex flex-col cursor-pointer group"
      >
        {/* Book Cover */}
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-gray-100">
          {/* Book Cover Image (from PDF thumbnail or cover URL) */}
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

          {/* Fallback Placeholder (hidden by default, shown on image error) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600 flex-col items-center justify-center p-2 text-white"
            style={{ display: "none" }}
          >
            <span className="text-[8px] font-bold mb-1">{book.category}</span>
            <p className="text-[9px] text-center font-bold line-clamp-3 leading-tight px-1">
              {book.title}
            </p>
          </div>

          {/* Category Badge */}
          <div className="absolute top-1.5 right-1.5">
            <span
              className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold shadow-sm"
              title={book.category} // full text saat hover
            >
              {trimText(book.category, 10)}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

  // Prepare lists for rendering and handle search fallbacks
  const featuredBooks = searchQuery
    ? filteredBooks
    : [...allBooks]
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 4);

  const topBooks = searchQuery
    ? filteredBooks
    : [...allBooks]
        .sort(
          (a, b) =>
            (b.viewCount || b.likeCount || 0) -
            (a.viewCount || a.likeCount || 0)
        )
        .slice(0, 4);

  // Desktop: show more books
  const featuredBooksDesktop = searchQuery
    ? filteredBooks
    : [...allBooks]
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 8);

  const topBooksDesktop = searchQuery
    ? filteredBooks
    : [...allBooks]
        .sort(
          (a, b) =>
            (b.viewCount || b.likeCount || 0) -
            (a.viewCount || a.likeCount || 0)
        )
        .slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 md:bg-[#FAFBFC]">
      <TopBar withBackButton href="/">Baca Buku</TopBar>

      {/* Main Container with max-width for mobile-first design */}
      <div className="max-w-[480px] md:max-w-none mx-auto pt-[3.8rem] pb-20 relative">
        {/* MOBILE Header Section with Search */}
        <div className="md:hidden bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-700 px-4 py-6">
          {/* Greeting with real-time user name */}
          <div className="mb-4">
            <h2 className="text-white text-lg font-semibold">
              Hi, {getUserDisplayName()}
            </h2>
            <p className="text-teal-100 text-sm">Kamu mau cari buku apa?</p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Telusuri nama buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Cari
            </button>
          </div>
        </div>

        {/* DESKTOP Hero Banner */}
        <div className="hidden md:block relative pt-16 pb-20 px-8 xl:px-12 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-700">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
          ></div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Hi, {getUserDisplayName()} 👋
                </h2>
                <p className="text-white/80 text-lg">Kamu mau cari buku apa?</p>
              </div>
              {/* Desktop Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBukuSaya}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-sm transition-all"
                >
                  <FaBookmark className="w-3.5 h-3.5" />
                  Buku Saya
                </button>
                <button
                  onClick={handleTambahBuku}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl font-semibold text-sm transition-all hover:bg-white/90 shadow-lg"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  Tambah Buku
                </button>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="mt-8 flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Telusuri nama buku, penulis, atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-medium text-sm transition-colors shadow-lg"
              >
                Cari
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-5 space-y-6 md:max-w-6xl md:mx-auto md:px-8 xl:px-12 md:py-8 md:space-y-10">
          {loading && allBooks.length === 0 && (
            <div className="py-8 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-teal-600 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                  strokeOpacity="0.15"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Buku Terfavorit Section - Sorted by Likes */}
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-5">
              <div>
                <h3 className="text-base md:text-xl font-bold text-gray-800">
                  Buku Terfavorit
                </h3>
                <p className="text-[10px] md:text-sm text-gray-500">
                  Paling banyak disukai
                </p>
              </div>
              <button
                onClick={() => router.push("/baca-buku/semua?sort=likes")}
                className="text-teal-600 text-sm font-medium hover:text-teal-700"
              >
                Lihat Semua
              </button>
            </div>

            {/* Mobile: Horizontal Scroll Books */}
            <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {featuredBooks.length > 0 ? (
                featuredBooks.map((book: Book) => (
                  <div key={book.id} className="flex-shrink-0 w-[100px]">
                    <BookCard book={book} />
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    {searchQuery ? (
                      <p className="text-sm">
                        Tidak ada hasil untuk{" "}
                        <span className="font-semibold">"{searchQuery}"</span>
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold">Belum ada buku</p>
                        <p className="text-sm mt-1">
                          Coba lagi nanti atau tambahkan buku baru.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Grid Books */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {featuredBooksDesktop.length > 0 ? (
                featuredBooksDesktop.map((book: Book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center text-gray-500">
                    {searchQuery ? (
                      <p className="text-sm">
                        Tidak ada hasil untuk{" "}
                        <span className="font-semibold">"{searchQuery}"</span>
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold">Belum ada buku</p>
                        <p className="text-sm mt-1">
                          Coba lagi nanti atau tambahkan buku baru.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buku Terlaris Section - Sorted by Views */}
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-5">
              <div>
                <h3 className="text-base md:text-xl font-bold text-gray-800">
                  Buku Terlaris
                </h3>
                <p className="text-[10px] md:text-sm text-gray-500">
                  Paling banyak dilihat
                </p>
              </div>
              <button
                onClick={() => router.push("/baca-buku/semua?sort=views")}
                className="text-teal-600 text-sm font-medium hover:text-teal-700"
              >
                Lihat Semua
              </button>
            </div>

            {/* Mobile: Horizontal Scroll Books */}
            <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {topBooks.length > 0 ? (
                topBooks.map((book: Book) => (
                  <div key={book.id} className="flex-shrink-0 w-[100px]">
                    <BookCard book={book} />
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    {searchQuery ? (
                      <p className="text-sm">
                        Tidak ada hasil untuk{" "}
                        <span className="font-semibold">"{searchQuery}"</span>
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold">Belum ada buku</p>
                        <p className="text-sm mt-1">
                          Coba lagi nanti atau tambahkan buku baru.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Grid Books */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {topBooksDesktop.length > 0 ? (
                topBooksDesktop.map((book: Book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center text-gray-500">
                    {searchQuery ? (
                      <p className="text-sm">
                        Tidak ada hasil untuk{" "}
                        <span className="font-semibold">"{searchQuery}"</span>
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold">Belum ada buku</p>
                        <p className="text-sm mt-1">
                          Coba lagi nanti atau tambahkan buku baru.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button - Mobile Only */}
        <div ref={fabRef} className="md:hidden absolute bottom-4 right-4 z-50">
          {/* FAB Menu */}
          {showFabMenu && (
            <div className="absolute bottom-16 right-0 mb-2 animate-fade-in">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden min-w-[140px] border border-gray-100">
                <button
                  onClick={handleBukuSaya}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <FaBookmark className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium">Buku Saya</span>
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  onClick={handleTambahBuku}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <FaPlus className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium">Tambah Buku</span>
                </button>
              </div>
              {/* Arrow/Triangle pointing to FAB */}
              <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white transform rotate-45 shadow-lg border-r border-b border-gray-100" />
            </div>
          )}

          {/* FAB Button */}
          <button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 ${
              showFabMenu ? "rotate-45" : ""
            }`}
          >
            <BsPlusLg className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Hide Style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BacaBukuPage;
