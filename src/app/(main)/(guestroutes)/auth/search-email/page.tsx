"use client";
import API from "@/utils/api/config";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeftIcon, ClipboardIcon,ChevronRightIcon , ChevronLeftIcon as PrevIcon, ChevronRightIcon as NextIcon } from "@heroicons/react/24/outline";
import Loader from "@/components/loader/loader";
import { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { getErrorMessage } from "@/utils/error-handler";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function SearchEmailByName() {
  interface iFormField {
    name: string;
  }
  interface iEmailResult {
    email: string;
    name: string;
    nik?: string | null;
  }

  const router = useRouter();
  const { register, handleSubmit, watch } = useForm<iFormField>({
    defaultValues: { name: "" },
  });

  const [results, setResults] = useState<iEmailResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6;

  const { mutate: searchEmails } = useMutation({
    mutationFn: async (data: iFormField) => {
      const res = await API.post("/search-email-by-name", { name: data.name });
      if (res.status === 200) return res.data;
      throw new Error("Gagal mencari email");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Pencarian gagal"));
    },
    onSuccess: (data) => {
      setResults(data.emails || []);
      setCurrentPage(1);
    },
  });

  const nameValue = watch("name");

  const debouncedSearch = debounce((name: string) => {
    if (name.trim().length >= 2) {
      setIsLoading(true);
      searchEmails({ name }, { onSettled: () => setIsLoading(false) });
    } else {
      setResults([]);
    }
  }, 600);

  useEffect(() => {
    debouncedSearch(nameValue);
    return () => debouncedSearch.cancel();
  }, [nameValue]);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email)
      .then(() => toast.success("Email disalin ke clipboard!"))
      .catch(() => toast.error("Gagal menyalin email"));
  };

  // Pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

  const getPaginationRange = () => {
    const maxVisible = window.innerWidth < 640 ? 5 : 7;
    const pages: (number | string)[] = [];
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Cari Email</h1>
      </header>

      <main className="flex-1 px-5 sm:px-8 py-6 max-w-3xl mx-auto w-full">
        <p className="text-center text-gray-600 mb-8 text-base leading-relaxed">
          Masukkan nama lengkap Anda untuk mencari email yang terdaftar.<br />
          <span className="text-sm">(minimal 2 karakter)</span>
        </p>

        {/* Search Input */}
        <form onSubmit={handleSubmit(searchEmails as any)} className="mb-10">
          <div className="relative">
            <input
              type="text"
              {...register("name")}
              placeholder="Ketik nama lengkap..."
              className="w-full px-5 py-4 pl-12 pr-5 text-lg border-2 border-[#00AF70]/30 rounded-2xl focus:border-[#00AF70] focus:ring-4 focus:ring-[#00AF70]/20 transition outline-none bg-white shadow-sm"
              minLength={2}
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="size-12 text-[#00AF70]" />
            <p className="mt-4 text-gray-500">Mencari email...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && results.length === 0 && nameValue.trim().length >= 2 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">Tidak ditemukan email untuk "{nameValue}"</p>
            <p className="mt-2 text-sm text-gray-500">Coba variasi nama lain atau hubungi admin jika masih kesulitan</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isLoading && (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Ditemukan {results.length} hasil
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Halaman {currentPage} / {totalPages}
              </span>
            </div>

            <div className="grid gap-5">
              {currentResults.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:border-[#00AF70]/30 transition-all duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Nama */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nama</p>
                      <p className="font-medium text-gray-800 text-base">{result.name}</p>
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                          <p className="text-gray-700 break-all text-base">{result.email}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.email)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#00AF70]/10 text-[#00AF70] rounded-xl hover:bg-[#00AF70]/20 transition flex-shrink-0 text-sm font-medium"
                          title="Salin email ke clipboard"
                        >
                          <ClipboardIcon className="w-5 h-5" />
                          Salin
                        </button>
                      </div>
                    </div>

                    {/* NIK */}
                    <div className="sm:col-span-3 mt-2 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">NIK</p>
                      <p className="font-medium text-gray-800">
                        {result.nik ? result.nik : <span className="text-gray-400">-</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="inline-flex items-center gap-1.5 rounded-xl bg-white shadow-sm border border-gray-200 px-2 py-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={clsx(
                      "p-3 rounded-lg transition",
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {getPaginationRange().map((page, idx) =>
                    page === "..." ? (
                      <span key={idx} className="px-4 py-3 text-gray-500 font-medium">
                        ...
                      </span>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(page as number)}
                        className={clsx(
                          "min-w-[44px] py-3 px-4 rounded-lg font-medium transition text-sm",
                          currentPage === page
                            ? "bg-[#00AF70] text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={clsx(
                      "p-3 rounded-lg transition",
                      currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Back to Login */}
        {results.length === 0 && !isLoading && nameValue.trim().length < 2 && (
          <div className="mt-auto pt-12 pb-10 text-center">
            <p className="text-gray-600 text-base">
              Sudah ingat email Anda?{" "}
              <Link
                href="/auth/login/email"
                className="text-[#00AF70] font-semibold hover:underline"
              >
                Login sekarang
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}