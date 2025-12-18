"use client";

import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { EllipsisVerticalIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Notification() {
  const { auth } = useAuth();
  const router = useRouter();
  const { ref, inView } = useInView();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const {
    data: notifications,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications", auth.id],
    queryFn: async ({ pageParam }) => {
      const res = await API.get("notification?page=" + pageParam);
      if (res.status == 200) {
        return {
          currentPage: pageParam,
          data: res.data.data,
          nextPage:
            res.data.next_page_url !== null
              ? parseInt(res.data.next_page_url.split("=")[1])
              : undefined,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage) fetchNextPage();
  }, [inView, isFetchingNextPage, fetchNextPage]);

  // Pisahkan notifikasi hari ini dan lainnya
  const todayNotifications: any[] = [];
  const olderNotifications: any[] = [];

  notifications?.pages.forEach((page) => {
    if (page?.data) {
      page.data.forEach((notif: any) => {
        const isToday = moment(notif.created_at).isSame(moment(), "day");
        if (isToday) {
          todayNotifications.push(notif);
        } else {
          olderNotifications.push(notif);
        }
      });
    }
  });

  const handleMarkAsRead = () => {
    // Add mark as read functionality here
    console.log("Mark as read clicked");
  };

  return (
    <div className="pb-20 bg-white min-h-screen">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 sm:px-5 py-5 bg-teal-700 flex items-center z-[9999] shadow">
        <button
          onClick={() => router.back()}
          className="flex items-center"
        >
          <svg className="size-6 cursor-pointer text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold ml-3 flex-grow">Notifikasi</h1>
      </div>

      {/* CONTENT */}
      <div className="mt-[4.7rem] px-4 py-6">
        {/* TODAY SECTION */}
        {todayNotifications.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-lg">Notifikasi Hari Ini</h2>
              <button
                onClick={handleMarkAsRead}
                className="text-teal-700 hover:text-teal-800 flex items-center gap-1 text-sm font-medium"
              >
                <CheckIcon className="size-4" />
                <span>Tandai Dibaca</span>
              </button>
            </div>
            <div className="space-y-3">
              {todayNotifications.map((notification: any, index: number) => (
                <NotificationItem
                  key={`today-${index}`}
                  notification={notification}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                />
              ))}
            </div>
          </div>
        )}

        {/* OTHER SECTION */}
        {olderNotifications.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800 text-lg mb-4">Notifikasi Lainnya</h2>
            <div className="space-y-3">
              {olderNotifications.map((notification: any, index: number) => (
                <NotificationItem
                  key={`other-${index}`}
                  notification={notification}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                />
              ))}
            </div>
          </div>
        )}

        {/* NO NOTIFICATIONS */}
        {todayNotifications.length === 0 && olderNotifications.length === 0 && !isFetchingNextPage && (
          <div className="flex justify-center text-slate-400 mt-20">
            <p>Tidak ada notifikasi</p>
          </div>
        )}

        {/* LOADING */}
        <div ref={ref} className="py-4">
          {isFetchingNextPage && (
            <span className="py-4 mb-6 mt-4 pt-8 px-4 text-sm text-slate-300 text-center block">
              Harap Tunggu..
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Item Component
function NotificationItem({
  notification,
  menuOpen,
  setMenuOpen,
}: {
  notification: any;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
}) {
  const notificationId = notification?.id;
  const userName = notification?.data?.data?.user?.name || "Unknown";
  const userAvatar = notification?.data?.data?.user?.avatar;
  const isLike = notification?.type.includes("Like");
  const actionText = isLike
    ? "Menyukai Postingan Anda"
    : `Mengomentari Postingan Anda : ${trimText(
        notification?.data?.data?.value || "",
        30
      )}`;
  const timeAgo = moment(notification?.created_at).locale("id").fromNow();

  return (
    <div className="relative bg-teal-50 rounded-lg p-4 border border-teal-100 flex items-start gap-3">
      <img
        src={getImage(userAvatar)}
        alt={userName}
        className="rounded-full size-12 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 text-sm">{userName}</h3>
        <p className="text-slate-600 text-sm mt-1">{actionText}</p>
        <span className="text-xs text-slate-500 mt-2 block">{timeAgo}</span>
      </div>

      {/* Menu Button */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen(menuOpen === notificationId ? null : notificationId)}
          className="p-1 rounded hover:bg-teal-100 transition"
        >
          <EllipsisVerticalIcon className="size-5 text-slate-600" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen === notificationId && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-lg">
              Tandai Sebagai Dibaca
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Lihat Postingan
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg">
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
