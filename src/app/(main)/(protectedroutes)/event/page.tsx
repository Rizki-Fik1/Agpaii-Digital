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
    <>
      {/* DELETE MODAL - Shared */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <img src="/img/trash.svg" className="size-44 mx-auto" alt="Trash" />
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
                className="flex-1 py-2 rounded-md bg-[#009788] text-white hover:bg-[#007A6E] transition-colors"
              >
                Hapus Acara
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-md border hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* =========== MOBILE VIEW - TAMPILAN LAMA =========== */}
      <div className="pt-[3.9rem] md:hidden">
        {/* FLOATING ADD */}
        <Link
          href="/event/new"
          className={clsx(
            type !== "me" && "hidden",
            "fixed bottom-6 right-6 z-50 shadow-lg rounded-full"
          )}
        >
          <PlusIcon className="size-14 p-3 rounded-full bg-[#009788] text-white" />
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
              key={`mob-${t.key}`}
              onClick={() => router.push(`/event?tab=${t.key}`)}
              className={clsx(
                "flex-1 text-center py-4 cursor-pointer relative",
                type === t.key &&
                  "text-[#009788] font-medium before:absolute before:left-0 before:bottom-0 before:h-0.5 before:w-full before:bg-[#009788]"
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
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#009788]"
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
            <div key={`mob-page-${idx}`} className="flex flex-col gap-4">
              {page?.data?.length ? (
                page.data.map((event: any) => (
                  <Event
                    key={`mob-evt-${event.id}`}
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
                idx === 0 && <p className="text-sm text-slate-500 text-center py-10">Tidak Ada Acara</p>
              )}
            </div>
          ))}

          <div ref={ref} className="text-center py-6 text-sm text-slate-500">
            {isFetchingNextPage && "Harap tunggu..."}
          </div>
        </div>
      </div>

      {/* =========== DESKTOP VIEW - TAMPILAN BARU PREMIUM =========== */}
      <div className="hidden md:block bg-gray-50 min-h-screen pb-28">
        <TopBar withBackButton href="/">
          Acara
        </TopBar>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#006557] to-[#004D40] pt-[7rem] pb-[4rem] px-8 text-white">
          <div className="max-w-[1400px] mx-auto flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold mb-2">Acara AGPAII</h1>
              <p className="opacity-80 text-lg">
                Temukan dan ikuti berbagai acara menarik serta pendaftaran kegiatan untuk guru.
              </p>
            </div>
            {type === "me" && (
              <Link
                href="/event/new"
                className="bg-white text-[#006557] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Tambah Acara
              </Link>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-[1400px] mx-auto px-8 -mt-8 relative z-10">
          {/* Tabs & Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center mb-8">
            <div className="flex bg-gray-50 p-1.5 rounded-xl w-full lg:w-auto">
              {[
                { key: "all", label: "Semua Acara" },
                { key: "followed", label: "Acara Diikuti" },
                { key: "me", label: "Acara Saya" },
              ].map((t) => (
                <button
                  key={`desk-${t.key}`}
                  onClick={() => router.push(`/event?tab=${t.key}`)}
                  className={clsx(
                    "flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                    type === t.key
                      ? "bg-white text-[#006557] shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-72">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none hover:border-[#006557] focus:ring-2 focus:ring-[#006557]/20 transition-all cursor-pointer"
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
          </div>

          {getEventRegionLabel() && (
            <div className="mb-6 text-xl font-bold text-gray-800">
              {getEventRegionLabel()}
            </div>
          )}

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events?.pages.map((page, idx) => (
              <div key={`desk-page-${idx}`} className="contents">
                {page?.data?.length ? (
                  page.data.map((event: any) => (
                    <Event
                      key={`desk-evt-${event.id}`}
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
                  idx === 0 && (
                    <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Tidak Ada Acara Saat Ini</p>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          <div ref={ref} className="text-center py-10">
            {isFetchingNextPage && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-500">
                <div className="w-4 h-4 border-2 border-[#006557] border-t-transparent rounded-full animate-spin" />
                Memuat lebih banyak...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
