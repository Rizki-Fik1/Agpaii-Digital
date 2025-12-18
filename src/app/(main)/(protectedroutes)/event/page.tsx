"use client";
import TopBar from "@/components/nav/topbar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import API from "@/utils/api/config";
import { PlusIcon } from "@heroicons/react/24/solid";
import { LinkIcon } from "@heroicons/react/20/solid";
import { MapPinIcon, TvIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import moment from "moment";
import "moment/locale/id";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Modal from "@/components/modal/modal";
import Loader from "@/components/loader/loader";
import { toast } from "sonner";
import { useAuth } from "@/utils/context/auth_context";
import Event from "@/components/event/event";

export default function TypeEvent() {
  const queryClient = useQueryClient();
  const [eventToDelete, setEventToDelete] = useState("");
  const [modalOpen, setmodalOpen] = useState(false);
  const { ref, inView } = useInView();
  const { auth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "all";

  const [type, setType] = useState(defaultTab);

  // Debug log: Cek auth saat component mount
  //   useEffect(() => {
  //     console.log("TypeEvent: Auth data =", auth);
  //   }, [auth]);

  const getEventApi = (type: string) => {
    switch (type) {
      case "me":
        return `event/created/${auth.id}?page=`;
      case "all":
        return "event?page=";
      default:
        return "";
    }
  };

  const {
    data: events,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const apiPath = getEventApi(type);
      if (!apiPath) return { data: [] };
      const res = await API.get(apiPath + pageParam);
      if (res.status === 200) {
        return {
          currentPage: res.data.current_page,
          data: res.data.data,
          nextPage:
            res.data.next_page_url !== null
              ? parseInt(res.data.next_page_url.split("=")[1])
              : undefined,
        };
      }
    },
    queryKey: ["events", type],
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const { mutate: deleteEvent, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      const res = await API.delete("/event/" + eventToDelete);
      if (res.status === 200) return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events", "me"] });
      setmodalOpen(false);
      toast.success("Acara Berhasil dihapus");
    },
  });

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setmodalOpen(true);
  };

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    setType(defaultTab);
  }, [defaultTab]);

  // Debug log: Saat type berubah
  //   useEffect(() => {
  //     console.log("TypeEvent: Current type =", type);
  //   }, [type]);

  return (
    <div className="pt-[3.9rem]">
      <Modal show={modalOpen} onClose={() => setmodalOpen(false)}>
        <img src="/img/trash.svg" className="size-44" alt="" />
        <p>
          Apakah anda yakin ingin menghapus <br /> Acara ini?
        </p>
        <div className="flex justify-center *:flex-grow pt-8 gap-3">
          {deletePending ? (
            <Loader className="size-8" />
          ) : (
            <>
              <span
                onClick={deleteEvent as any}
                className="px-4 py-2 rounded-md cursor-default bg-[#009788] text-white"
              >
                Hapus Acara
              </span>
              <span
                onClick={() => setmodalOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300 cursor-default"
              >
                Batal
              </span>
            </>
          )}
        </div>
      </Modal>
      <Link
        href={"/event/new/"}
        className="fixed bottom-6 md:bottom-8 md:right-8 right-6 flex"
      >
        <PlusIcon
          className={clsx(
            type !== "me" && "hidden",
            "size-10 rounded-full p-2 bg-[#009788] text-white cursor-pointer"
          )}
        />
      </Link>
      <TopBar withBackButton href="/">
        Acara
      </TopBar>
      <div className="flex justify-between text-center border-b border-b-slate-300 text-sm text-neutral-600 *:py-5 *:w-1/3 *:px-6 *:cursor-pointer max-sm:text-sm sticky top-[4rem] z-[90] bg-white">
        <div
          onClick={() => router.push("/event?tab=all")}
          className={clsx(
            "relative",
            type == "all" &&
              "text-[#009788] before:absolute before:w-full before:py-0.5 before:bg-[#009788] before:left-0 before:bottom-0"
          )}
        >
          Semua Acara
        </div>
        <div
          onClick={() => router.push("/event?tab=followed")}
          className={clsx(
            "relative",
            type == "followed" &&
              "text-[#009788] before:absolute before:w-full before:py-0.5 before:bg-[#009788] before:left-0 before:bottom-0"
          )}
        >
          Acara Diikuti
        </div>
        <div
          onClick={() => router.push("/event?tab=me")}
          className={clsx(
            "relative flex items-center",
            type == "me" &&
              "text-[#009788] before:absolute before:w-full before:py-0.5 before:bg-[#009788] before:left-0 before:bottom-0 "
          )}
        >
          Acara Saya
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 sm:px-6 py-8">
        {events?.pages.map((page, index) => {
          // Debug log: Saat render events
          return (
            <div key={index} className="flex flex-col gap-4">
              {page?.data?.length > 0 ? (
                page.data.map((event: any, i: number) => {
                  return (
                    <Event
                      key={i}
                      event={event}
                      type={type}
                      auth={auth}
                      onDelete={handleDeleteClick}
                    />
                  );
                })
              ) : (
                <div className="text-slate-500 text-sm">Tidak Ada Acara</div>
              )}
            </div>
          );
        })}
        <div
          ref={ref}
          className={clsx(
            isFetchingNextPage &&
              "py-4 px-6 pb-8 text-center text-slate-600 text-sm"
          )}
        >
          {isFetchingNextPage && "Harap tunggu..."}
        </div>
      </div>
    </div>
  );
}
