"use client";

import TopBar from "@/components/nav/topbar";
import Rpp from "@/components/rpp/rpp";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function RppDigitalPage() {
  const [type, setType] = useState<"all" | "me">("all");
  const { auth } = useAuth();
  const getUrl = (type: "all" | "me") => {
    return type === "all"
      ? "/user/lesson-plans/all?page="
      : `/user/lesson-plans/user/${auth.id}?=page`;
  };
  const {
    data: rpps,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["rpps", type],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await API.get(getUrl(type) + pageParam);
      if (res.status == 200) {
        return {
          nextPage:
            res.data.next_page_url !== null
              ? parseInt(res.data.next_page_url.split("=")[1])
              : undefined,
          data: res.data.data,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage) fetchNextPage();
  }, [inView]);

  return (
    <div className="pt-[4.21rem] pb-4">
      <TopBar withBackButton>RPP Digital</TopBar>
      <div className="flex *:w-1/2 relative text-center pt-3 pb-4 *:text-sm text-slate-700 border-b border-b-slate-300">
        <span
          className={clsx(
            "px-6 py-[0.1rem] bg-[#009788] absolute w-1/2 bottom-0 ",
            type == "all" ? "left-0" : "right-0"
          )}
        ></span>
        <div className="cursor-pointer" onClick={() => setType("all")}>
          Semua RPP
        </div>
        <div className="cursor-pointer" onClick={() => setType("me")}>
          RPP Saya
        </div>
      </div>
      <div className="flex flex-col gap-3 px-[5%] sm:px-6 pt-8">
        {rpps?.pages.map((page, i) => {
          return (
            <div key={i} className="flex flex-col gap-3 *:shadow">
              {page?.data.length > 0 ? (
                page?.data.map((rpp: any, index: any) => {
                  return <Rpp key={index} rpp={rpp} />;
                })
              ) : (
                <div className="px-4 py-2 text-center text-neutral-600">
                  Tidak Ada RPP
                </div>
              )}
            </div>
          );
        })}
        <div ref={ref}></div>
        <Link
          href={"/rpp/new"}
          className="fixed bottom-6 right-6 p-3 border rounded-full border-slate-200 bg-[#009788]"
        >
          <PlusIcon className="fill-white size-7" />
        </Link>
      </div>
    </div>
  );
}
