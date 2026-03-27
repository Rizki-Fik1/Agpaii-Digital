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
import AuthBrandingPanel from "@/components/auth/auth_branding_panel";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Branding Panel - Desktop */}
      <AuthBrandingPanel />

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col bg-white md:bg-[#FAFBFC] relative overflow-hidden">
        {/* Top accent line - desktop */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300" />

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-gray-100 md:border-none px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition shadow-sm bg-white md:bg-white/50"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 md:text-2xl">Cari Email</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <div className="hidden md:inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Pencarian Akun
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Masukkan nama lengkap Anda untuk mencari email yang terdaftar.<br />
                <span className="text-sm font-medium text-emerald-600">(minimal 2 karakter)</span>
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit(searchEmails as any)} className="mb-10">
              <div className="relative group">
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Ketik nama lengkap..."
                  className="w-full px-5 py-4 pl-12 pr-5 text-lg border-2 border-[#00AF70]/20 rounded-2xl focus:border-[#00AF70] focus:ring-4 focus:ring-[#00AF70]/10 transition-all outline-none bg-white shadow-sm group-hover:border-[#00AF70]/40"
                  minLength={2}
                  autoFocus
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="size-12 text-[#00AF70]" />
              <p className="mt-4 text-gray-500 font-medium">Mencari database...</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && results.length === 0 && nameValue.trim().length >= 2 && (
            <motion.div 
              className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-lg font-bold text-gray-700">Tidak ditemukan email untuk "{nameValue}"</p>
              <p className="mt-2 text-sm text-gray-500">Coba gunakan nama lengkap sesuai yang terdaftar di KTA</p>
            </motion.div>
          )}

          {/* Results */}
          {results.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-gray-800">
                  Ditemukan {results.length} hasil
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  Halaman {currentPage} / {totalPages}
                </span>
              </div>

              <div className="grid gap-4">
                {currentResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#00AF70]/30 transition-all duration-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Nama */}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Nama Lengkap</p>
                        <p className="font-bold text-gray-800 text-base">{result.name}</p>
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Email Terdaftar</p>
                            <p className="text-gray-700 break-all text-base font-medium">{result.email}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(result.email)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex-shrink-0 text-sm font-bold border border-emerald-100"
                            title="Salin email"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                            Salin
                          </button>
                        </div>
                      </div>

                      {/* NIK */}
                      <div className="sm:col-span-3 mt-1 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">NIK</p>
                          <p className="font-semibold text-gray-600 text-sm">
                            {result.nik ? result.nik : <span className="text-gray-300 font-normal italic">Tidak tersedia</span>}
                          </p>
                        </div>
                        {result.nik && (
                           <Link 
                            href={`/auth/login/nik?nik=${result.nik}`}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                           >
                             Login dengan NIK →
                           </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center pb-10">
                  <nav className="inline-flex items-center gap-1 rounded-2xl bg-white shadow-sm border border-gray-100 p-1.5">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={clsx(
                        "p-2.5 rounded-xl transition",
                        currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    <div className="flex items-center px-2">
                      {getPaginationRange().map((page, idx) =>
                        page === "..." ? (
                          <span key={idx} className="px-3 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(page as number)}
                            className={clsx(
                              "min-w-[40px] h-10 rounded-xl font-bold transition text-sm",
                              currentPage === page
                                ? "bg-[#00AF70] text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={clsx(
                        "p-2.5 rounded-xl transition",
                        currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}

          {/* Back to Login */}
          {results.length === 0 && !isLoading && nameValue.trim().length < 2 && (
            <motion.div 
              className="mt-auto pt-12 pb-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-500 text-sm">
                Sudah ingat email Anda?{" "}
                <Link
                  href="/auth/login/email"
                  className="text-[#00AF70] font-bold hover:underline"
                >
                  Masuk Sekarang
                </Link>
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}