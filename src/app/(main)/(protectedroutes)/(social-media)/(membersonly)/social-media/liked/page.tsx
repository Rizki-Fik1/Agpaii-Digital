"use client";

import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import Post from "@/components/post/post";
import { Post as PostType } from "@/types/post/post";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function LikedPost() {
  const { ref, inView } = useInView();

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

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="pt-[4.2rem] pb-20">
      <TopBar withBackButton>Postingan Disukai</TopBar>
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
                  <div className="flex mt-28 justify-center">
                    <h1 className="text-slate-400">
                      {" "}
                      Tidak ada postingan disukai
                    </h1>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex mt-28 justify-center">
            <Loader className="size-10" />
          </div>
        )}
        <div
          ref={ref}
          className={clsx(
            isFetchingNextPage &&
              "px-6 py-4 text-center mb-4 text-slate-600 text-sm"
          )}
        >
          {isFetchingNextPage ? "Harap Tunggu" : ""}
        </div>
      </div>
    </div>
  );
}
