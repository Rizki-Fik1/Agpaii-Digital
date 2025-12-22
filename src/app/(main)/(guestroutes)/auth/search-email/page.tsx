"use client";

import FormControl from "@/components/form/form_control";
import API from "@/utils/api/config";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeftIcon, ClipboardIcon } from "@heroicons/react/24/solid";
import Loader from "@/components/loader/loader";
import { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { getErrorMessage } from "@/utils/error-handler";

export default function SearchEmailByName() {
  interface iFormField {
    name: string;
  }

  interface iEmailResult {
    email: string;
    name: string;
  }

  const { register, handleSubmit, watch } = useForm<iFormField>({
    defaultValues: { name: "" },
  });
  const [results, setResults] = useState<iEmailResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const { mutate: searchEmails } = useMutation({
    mutationFn: async (data: iFormField) => {
      try {
        const res = await API.post("/search-email-by-name", {
          name: data.name,
        });
        if (res.status === 200) return res.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw error.response.data;
        } else {
          throw error;
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      setResults(data.emails || []);
      setCurrentPage(1); // Reset to first page on new search
    },
  });

  // Watch name input for debounced search
  const nameValue = watch("name");

  // Debounced search function
  const debouncedSearch = debounce((name: string) => {
    if (name.length >= 2) {
      setIsLoading(true);
      searchEmails({ name }, { onSettled: () => setIsLoading(false) });
    } else {
      setResults([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(nameValue);
    return () => debouncedSearch.cancel(); // Cleanup on unmount
  }, [nameValue]);

  // Function to copy email to clipboard
  const copyToClipboard = (email: string) => {
    navigator.clipboard
      .writeText(email)
      .then(() => {
        toast.success("Email berhasil disalin!");
      })
      .catch(() => {
        toast.error("Gagal menyalin email.");
      });
  };

  // Pagination logic
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Generate pagination buttons
  const getPaginationRange = () => {
    const maxVisiblePages = 5; // Show 5 page numbers at most
    const sidePages = 2; // 2 pages before and after current page
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Add ellipsis if currentPage is far from start
      if (currentPage > sidePages + 2) {
        pages.push("...");
      }

      // Add pages around currentPage
      const startPage = Math.max(2, currentPage - sidePages);
      const endPage = Math.min(totalPages - 1, currentPage + sidePages);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if currentPage is far from end
      if (currentPage < totalPages - sidePages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen px-[5%] sm:px-8 py-6 flex flex-col">
      <div className="flex justify-start items-center gap-2">
        <ChevronLeftIcon className="size-4 text-[#009788]" />
        <Link
          className="text-sm font-medium text-[#009788] hover:underline"
          href={"/getting-started"}
        >
          Kembali ke Login
        </Link>
      </div>
      <div className="flex flex-col sm:px-2 mt-12 px-1">
        <img src="/svg/agpaii2.svg" className="size-16" alt="agpaii-logo" />
        <p className="font-semibold capitalize text-2xl text-[#009788] sm:text-3xl -mt-1">
          Cari Email
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Cari email berdasarkan nama profil
        </p>
      </div>

      <form
        onSubmit={handleSubmit(searchEmails as any)}
        method="POST"
        className="flex flex-col mt-8 gap-2 sm:px-2"
      >
        {/* Name Input */}
        <FormControl
          register={register}
          className="rounded-lg overflow-hidden"
          inputType="text"
          name="name"
          type="input"
          placeholder="Masukkan nama (min. 2 karakter)"
          required
        />

        <div className="flex flex-col *:py-2 *:text-sm *:px-4 *:rounded-xl mt-3 text-center text-white">
          {isLoading && (
            <div className="flex justify-center">
              <Loader className="size-6" />
            </div>
          )}
        </div>
      </form>

      {/* Results List */}
      {results.length === 0 && nameValue.length >= 2 && !isLoading && (
        <p className="text-slate-500 text-sm mt-4 text-center">
          Tidak ada hasil ditemukan untuk "{nameValue}".
        </p>
      )}
      {results.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {currentResults.map((result, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50"
            >
              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Nama: </span>
                  <span className="text-slate-600">{result.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-700">Email: </span>
                    <span className="text-slate-600">{result.email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.email)}
                    className="flex items-center gap-1 text-xs text-[#009788] hover:text-[#007b6d] transition"
                    title="Salin Email"
                  >
                    <ClipboardIcon className="size-3" />
                    Salin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scrollable Pagination Controls */}
      {results.length > resultsPerPage && (
        <div className="mt-4 overflow-x-auto flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm rounded-md bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200"
            >
              Sebelumnya
            </button>
            {getPaginationRange().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 py-1 text-sm text-slate-600">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentPage === page
                      ? "bg-[#009788] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm rounded-md bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
