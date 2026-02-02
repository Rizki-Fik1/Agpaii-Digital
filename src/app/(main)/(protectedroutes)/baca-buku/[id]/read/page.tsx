"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/utils/context/auth_context";
import { getBookById, Book } from "@/constants/books-data";
import { getUserBookById } from "@/utils/books-storage";

// React Icons
import {
  BsChevronLeft,
  BsChevronRight,
  BsZoomIn,
  BsZoomOut,
  BsDownload,
  BsFullscreen,
} from "react-icons/bs";
import { HiOutlineBookOpen } from "react-icons/hi";

// Using iframe viewer instead of pdfjs worker. No worker setup required.

const BookReaderPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id as string;
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL2 ||
    "";

  const { auth: user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [iframeError, setIframeError] = useState(false);
  const iframeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      setLoading(true);

      if (!API_URL) {
        // Fallback to local books
        let foundBook = getUserBookById(bookId);
        if (!foundBook) foundBook = getBookById(bookId);
        setBook(foundBook || null);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const params: any = {};
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
        } as Book;

        setBook(mapped);
      } catch (err) {
        console.error("Error fetching book:", err);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, API_URL, user?.id]);

  // Use iframe-based PDF viewer: toggle loading state and detect iframe failures
  useEffect(() => {
    // clear any previous timeout
    if (iframeTimeoutRef.current) {
      window.clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }

    if (book?.pdfUrl) {
      setPdfLoading(true);
      setIframeError(false);
      // If iframe doesn't finish loading within 6s, mark as error and show fallback
      iframeTimeoutRef.current = window.setTimeout(() => {
        console.warn("iframe load timeout for PDF, switching to fallback");
        setPdfLoading(false);
        setIframeError(true);
      }, 6000);
    } else {
      setPdfLoading(false);
      setIframeError(false);
    }

    return () => {
      if (iframeTimeoutRef.current) {
        window.clearTimeout(iframeTimeoutRef.current);
        iframeTimeoutRef.current = null;
      }
    };
  }, [book]);

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
  };

  const handleDownload = async () => {
    if (book?.pdfUrl) {
      const link = document.createElement("a");
      link.href = book.pdfUrl;
      link.download = `${book.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    }
  };

  const openPdfInNewTab = async () => {
    if (!book?.pdfUrl) return;

    // Try to fetch with auth headers first (some storage requires Authorization)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        book.pdfUrl,
        token ? { headers: { Authorization: `Bearer ${token}` } } : ({} as any)
      );
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/pdf")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          // revoke after a short delay
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          return;
        }
      }
    } catch (err) {
      // ignore fetch errors and fallback to opening URL directly
      console.log("fetch fallback failed, opening direct URL", err);
    }

    window.open(book.pdfUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-[4.2rem]">
        <TopBar withBackButton>
          <span className="text-white">Baca Buku</span>
        </TopBar>
        <div className="flex items-center justify-center h-full">
           <div className="text-gray-500">Memuat...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[4.2rem]">
        <TopBar withBackButton>Baca Buku</TopBar>
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

  // If no PDF URL, show placeholder
  if (!book.pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[4.2rem]">
        <TopBar withBackButton>Baca Buku</TopBar>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <HiOutlineBookOpen className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-gray-600 text-center font-medium mb-2">
            Preview belum tersedia
          </p>
          <p className="text-gray-400 text-sm text-center mb-4">
            File PDF untuk buku ini belum diunggah
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium"
          >
            Kembali ke Detail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-teal-700 px-4 py-3">
        <div className="max-w-[480px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
          >
            <BsChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="text-white font-medium text-sm line-clamp-1">
              {book.title}
            </h1>
            <p className="text-teal-200 text-xs">{book.author}</p>
          </div>
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
          >
            <BsDownload className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer (iframe) */}
      <div className="flex-1 pt-16 pb-20 overflow-auto">
        {pdfLoading ? (
            <div className="text-center">
              <p className="text-gray-400 text-sm">Memuat dokumen...</p>
            </div>
        ) : iframeError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiOutlineBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">
                Tidak dapat menampilkan PDF melalui iframe.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Silakan buka di tab baru atau unduh untuk melihat dokumen.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => openPdfInNewTab()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
                >
                  Buka di Tab Baru
                </button>
                <button
                  onClick={() => handleDownload()}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
                >
                  Unduh
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-4">
            <div
              className="w-full max-w-[720px] h-[80vh] bg-black overflow-hidden"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              <iframe
                src={book.pdfUrl}
                title={book.title}
                onLoad={() => {
                  if (iframeTimeoutRef.current) {
                    window.clearTimeout(iframeTimeoutRef.current);
                    iframeTimeoutRef.current = null;
                  }
                  setPdfLoading(false);
                  setIframeError(false);
                }}
                onError={() => {
                  if (iframeTimeoutRef.current) {
                    window.clearTimeout(iframeTimeoutRef.current);
                    iframeTimeoutRef.current = null;
                  }
                  console.warn("iframe error while loading PDF");
                  setPdfLoading(false);
                  setIframeError(true);
                }}
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </div>
        )}{" "}
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="max-w-[480px] mx-auto">
          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <BsZoomOut className="w-4 h-4" />
            </button>
            <span className="text-gray-400 text-sm min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <BsZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReaderPage;
