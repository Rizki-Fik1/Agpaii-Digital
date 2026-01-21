"use client";
import { Post as PostType } from "@/types/post/post";
import API from "@/utils/api/config";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import Post from "@/components/post/post";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/utils/context/auth_context";
import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { getImage } from "@/utils/function/function";

export default function SocialMedia() {
  const { ref, inView } = useInView();
  const { auth: user } = useAuth();
  const router = useRouter();

  // State untuk search dan modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // searchQuery akan dipakai sebagai parameter query
  const [searchQuery, setSearchQuery] = useState("");
  // State untuk loading saat pencarian
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Fungsi untuk menghandle submit search
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Set loading sebelum refetch data
    setIsSearchLoading(true);
    // Update query untuk refetch data
    setSearchQuery(searchInput);
  };

  const fetchPosts = async ({ pageParam }: { pageParam: number }) => {
    const searchParam = searchQuery
      ? `&search=${encodeURIComponent(searchQuery)}`
      : "";
    const res = await API.get(`post?page=${pageParam}${searchParam}`);
    if (res.status === 200) {
      return {
        currentPage: pageParam,
        data: res.data.data as PostType[],
        nextPage:
          res.data.next_page_url !== null
            ? parseInt(res.data.next_page_url.split("=")[1])
            : undefined,
      };
    }
  };

  const { data, isLoading, error, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", searchQuery],
      queryFn: fetchPosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
    });

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, fetchNextPage]);

  // Monitor loading dari react-query untuk menutup modal saat pencarian selesai
  useEffect(() => {
    if (isSearchLoading && !isLoading) {
      setIsSearchLoading(false);
      setIsSearchOpen(false);
    }
  }, [isLoading, isSearchLoading]);

  if (error) return <div>{error.message}</div>;

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 sm:px-5 py-5 bg-teal-700 flex items-center z-[9999]">
        <button
          onClick={() => router.back()}
          className="flex items-center"
        >
          <svg className="size-6 cursor-pointer text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold ml-3 flex-grow">Diskusi AGPAII</h1>
        <Link href="/social-media/notification" className="p-1">
          <BellIcon className="size-6 text-white" />
        </Link>
      </div>

      {/* User Avatar + Search Bar */}
      <div className="sticky top-[4.5rem] z-40 bg-white border-b border-slate-200 px-4 py-4 mt-2 flex items-center gap-3">
        <img
          src={
            (user?.avatar !== null && getImage(user.avatar)) ||
            "/img/profileplacholder.png"
          }
          alt="user-avatar"
          className="rounded-full size-11 min-w-11 min-h-11 object-cover border border-slate-200"
        />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5 text-slate-500"
        >
          <MagnifyingGlassIcon className="size-5" />
          <span className="text-sm">Cari Diskusi...</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col bg-white pt-8 mt-8">
        {!isLoading &&
          data?.pages.map((page, iPage) => {
            // Default value untuk page?.data jika undefined
            const pageData = page?.data || [];
            // Pisahkan pinned dan non-pinned data
            const pinnedData = pageData.filter(
              (item) => item.is_pinned === true || item.is_pinned === 1,
            );
            const nonPinnedData = pageData.filter(
              (item) => !item.is_pinned && item.is_pinned !== 1,
            );
            // Gabungkan pinnedData di awal
            const sortedData = [...pinnedData, ...nonPinnedData];
            return (
              <div className="flex flex-col" key={iPage}>
                {sortedData.length > 0 ? (
                  sortedData.map((post, i) => (
                    <Post key={i} post={post} />
                  ))
                ) : (
                  <div className="h-screen flex items-center justify-center">
                    <h1 className="text-slate-500">Tidak Ada postingan</h1>
                  </div>
                )}
              </div>
            );
          })}
        <span
          ref={ref}
          className="px-6 py-2 text-sm cursor-pointer text-slate-300 text-center mx-auto"
        >
          {isFetchingNextPage ? "Harap Tunggu..." : ""}
        </span>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Cari Diskusi</h2>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Masukkan kata kunci"
                disabled={isSearchLoading}
                className="w-full border border-slate-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  disabled={isSearchLoading}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSearchLoading}
                  className="px-4 py-2 rounded-md bg-teal-700 text-white flex items-center gap-2 hover:bg-teal-800"
                >
                  {isSearchLoading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  )}
                  Cari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
