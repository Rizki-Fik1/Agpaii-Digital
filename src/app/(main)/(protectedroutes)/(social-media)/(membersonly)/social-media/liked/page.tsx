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
      queryKey: ["posts"],
      queryFn: fetchPosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
    });

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

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
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Memuat...</p>
              </div>
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
        </div>
      </div>
    </div>
  );
}
