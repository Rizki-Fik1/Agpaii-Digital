"use client";

import TopBar from "@/components/nav/topbar";
import { useSearchParams, useRouter } from "next/navigation";
import API from "@/utils/api/config";
import {
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Modal from "@/components/modal/modal";
import Loader from "@/components/loader/loader";
import { toast } from "sonner";
import { useAuth } from "@/utils/context/auth_context";
import Event from "@/components/event/event";

export default function TypeEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const { ref, inView } = useInView();

  const defaultTab = searchParams.get("tab") || "all";

  /* =======================
   * STATE
   * ======================= */
  const [type, setType] = useState(defaultTab);
  const [eventType, setEventType] = useState<"ALL" | "DPP" | "DPW" | "DPD">("ALL");
  const [eventToDelete, setEventToDelete] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  const provinceId = auth?.profile?.province_id;
  const cityId = auth?.profile?.city_id;

  /* =======================
   * HELPERS
   * ======================= */
  const getEventRegionLabel = () => {
    if (eventType === "DPW" && auth?.profile?.province?.name) {
      return `DPW ${auth.profile.province.name}`;
    }
    if (eventType === "DPD" && auth?.profile?.city?.name) {
      return `DPD ${auth.profile.city.name}`;
    }
    return null;
  };

  const getEventApi = (tab: string, filter: string) => {
    if (tab === "me") {
      return `event/created/${auth.id}?page=`;
    }

    if (tab === "all") {
      const params = new URLSearchParams();
      params.append("filter_type", filter);

      if (filter === "DPW") {
        if (!provinceId) return "";
        params.append("province_id", String(provinceId));
      }

      if (filter === "DPD") {
        if (!provinceId || !cityId) return "";
        params.append("province_id", String(provinceId));
        params.append("city_id", String(cityId));
      }

      return `event?${params.toString()}&page=`;
    }

    return "";
  };

  /* =======================
   * DATA FETCH
   * ======================= */
  const {
    data: events,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["events", type, eventType, provinceId, cityId],
    queryFn: async ({ pageParam }) => {
      const apiPath = getEventApi(type, eventType);
      if (!apiPath) return { data: [] };

      const res = await API.get(apiPath + pageParam);
      if (res.status === 200) {
        return {
          data: res.data.data,
          nextPage: res.data.next_page_url
            ? parseInt(res.data.next_page_url.split("=").pop()!)
            : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  /* =======================
   * DELETE EVENT
   * ======================= */
  const { mutate: deleteEvent, isPending } = useMutation({
    mutationFn: async () => {
      const res = await API.delete(`/event/${eventToDelete}`);
      if (res.status === 200) return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setModalOpen(false);
      toast.success("Acara berhasil dihapus");
    },
  });

  /* =======================
   * EFFECTS
   * ======================= */
  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    setType(defaultTab);
  }, [defaultTab]);

  /* =======================
   * RENDER
   * ======================= */
  return (
    <div className="pt-[3.9rem]">
      {/* DELETE MODAL */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <img src="/img/trash.svg" className="size-44 mx-auto" />
        <p className="text-center">
          Apakah anda yakin ingin menghapus <br /> acara ini?
        </p>
        <div className="flex gap-3 pt-8">
          {isPending ? (
            <Loader className="mx-auto size-8" />
          ) : (
            <>
              <button
                onClick={deleteEvent as any}
                className="flex-1 py-2 rounded-md bg-[#009788] text-white"
              >
                Hapus Acara
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-md border"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* FLOATING ADD */}
      <Link
        href="/event/new"
        className={clsx(
          type !== "me" && "hidden",
          "fixed bottom-6 right-6 z-50"
        )}
      >
        <PlusIcon className="size-10 p-2 rounded-full bg-[#009788] text-white" />
      </Link>

      <TopBar withBackButton href="/">
        Acara
      </TopBar>

      {/* TABS */}
      <div className="flex border-b sticky top-[4rem] bg-white z-[90] text-sm">
        {[
          { key: "all", label: "Semua Acara" },
          { key: "followed", label: "Acara Diikuti" },
          { key: "me", label: "Acara Saya" },
        ].map((t) => (
          <div
            key={t.key}
            onClick={() => router.push(`/event?tab=${t.key}`)}
            className={clsx(
              "flex-1 text-center py-4 cursor-pointer relative",
              type === t.key &&
                "text-[#009788] before:absolute before:left-0 before:bottom-0 before:h-0.5 before:w-full before:bg-[#009788]"
            )}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="sticky top-[7.6rem] z-[80] bg-white px-4 py-3">
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as any)}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">Semua Tipe Acara</option>
          <option value="DPP">DPP</option>
          <option value="DPW" disabled={!provinceId}>
            DPW
          </option>
          <option value="DPD" disabled={!provinceId || !cityId}>
            DPD
          </option>
        </select>
      </div>

      {getEventRegionLabel() && (
        <div className="mt-6 mx-6 text-xl font-bold text-[#009788]">
          {getEventRegionLabel()}
        </div>
      )}

      {/* LIST */}
      <div className="px-4 py-8 flex flex-col gap-4">
        {events?.pages.map((page, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            {page?.data?.length ? (
              page.data.map((event: any) => (
                <Event
                  key={event.id}
                  event={event}
                  type={type}
                  auth={auth}
                  onDelete={(id: string) => {
                    setEventToDelete(id);
                    setModalOpen(true);
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">Tidak Ada Acara</p>
            )}
          </div>
        ))}

        <div ref={ref} className="text-center py-6 text-sm text-slate-500">
          {isFetchingNextPage && "Harap tunggu..."}
        </div>
      </div>
    </div>
  );
}
