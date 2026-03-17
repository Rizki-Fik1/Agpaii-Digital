"use client";

import Loader from "@/components/loader/loader";
import Post from "@/components/post/post";
import { Post as PostType } from "@/types/post/post";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LikedPost() {
  const { ref, inView } = useInView();
  const router = useRouter();

  const fetchPosts = async ({ pageParam }: { pageParam: number }) => {
    const res = await API.get(`post?liked=true&page=${pageParam}`);
    if (res.status == 200) {
      let nextPage: number | undefined = undefined;
      if (res.data.next_page_url) {
        try {
          const url = new URL(res.data.next_page_url);
          const pageVal = url.searchParams.get("page");
          nextPage = pageVal ? parseInt(pageVal) : undefined;
        } catch {
          // fallback: ambil angka setelah "page="
          const match = res.data.next_page_url.match(/[?&]page=(\d+)/);
          nextPage = match ? parseInt(match[1]) : undefined;
        }
      }
      return {
        currentPage: pageParam,
        data: res.data.data as PostType[],
        nextPage,
      };
    }
  };

  const { data, isLoading, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", "liked"],
      queryFn: fetchPosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
    });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage]);

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFBFC]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 z-[9999] bg-gradient-to-r from-[#004D40] to-[#00897B] shadow-sm transition-all">
        <div className="max-w-[480px] md:max-w-none mx-auto px-4 md:px-8 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="size-5 text-white" />
          </button>
          <h1 className="text-white font-semibold ml-3 flex-grow text-lg">Postingan Disukai</h1>
        </div>
      </div>

      <div className="pt-[4.2rem] pb-20 md:px-6 lg:px-8">
        <div className="flex flex-col">
          {!isLoading ? (
            data?.pages.map((page, i) => {
              return (
                <div key={i} className="flex flex-col">
                  {page?.data && page?.data.length > 0 ? (
                    page?.data?.map((post, index) => {
                      return post.is_liked && <Post post={post} key={index} />;
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <HeartIcon className="size-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        Tidak ada postingan disukai
                      </p>
                      <p className="text-slate-300 text-xs mt-1">
                        Postingan yang Anda sukai akan muncul di sini
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col pb-6 max-w-[480px] md:max-w-none animate-pulse">
                  {/* Header skeleton */}
                  <div className="flex px-4 py-4 gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-28 bg-slate-200 rounded-full mb-2" />
                      <div className="h-3 w-40 bg-slate-100 rounded-full mb-1.5" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  {/* Image area skeleton */}
                  <div className="w-full h-[23rem] bg-slate-200" />
                  {/* Action bar skeleton */}
                  <div className="px-4 pt-4">
                    <div className="flex gap-4 mb-3">
                      <div className="w-7 h-7 rounded bg-slate-200" />
                      <div className="w-7 h-7 rounded bg-slate-200" />
                    </div>
                    <div className="h-3 w-16 bg-slate-200 rounded-full mb-3" />
                    <div className="h-3 w-full bg-slate-100 rounded-full mb-2" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            ref={ref}
            className={clsx(
              isFetchingNextPage &&
                "px-6 py-4 text-center mb-4 text-slate-400 text-sm"
            )}
          >
            {isFetchingNextPage ? "Harap Tunggu" : ""}
          </div>
          {!hasNextPage && !isLoading && data?.pages?.[0]?.data?.length ? (
            <p className="text-center text-xs text-slate-300 py-6">Semua postingan sudah ditampilkan</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
