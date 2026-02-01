"use client";

import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Notification() {
  const { auth } = useAuth();
  const router = useRouter();
  const { ref, inView } = useInView();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
  const { todayNotifications, olderNotifications } = useMemo(() => {
    const today: any[] = [];
    const older: any[] = [];

    notifications?.pages.forEach((page) => {
      if (page?.data) {
        page.data.forEach((notif: any) => {
          const isToday = moment(notif.created_at).isSame(moment(), "day");
          if (isToday) {
            today.push(notif);
          } else {
            older.push(notif);
          }
        });
      }
    });

    return { todayNotifications: today, olderNotifications: older };
  }, [notifications]);

  // Mutation untuk hapus notifikasi
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await API.delete(`notification/${notificationId}`);
      if (res.status === 200) return res.data;
      throw new Error("Failed to delete notification");
    },
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications", auth.id] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(["notifications", auth.id]);
      
      // Optimistic update: hapus notifikasi dari cache
      queryClient.setQueryData(["notifications", auth.id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((notif: any) => notif.id !== notificationId)
          }))
        };
      });
      
      return { previousNotifications };
    },
    onSuccess: () => {
      toast.success("Notifikasi berhasil dihapus");
    },
    onError: (err, variables, context: any) => {
      // Rollback jika error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", auth.id], context.previousNotifications);
      }
      toast.error("Gagal menghapus notifikasi");
    },
  });

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
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
            <h2 className="font-semibold text-slate-800 text-lg mb-4">Notifikasi Hari Ini</h2>
            <div className="space-y-3">
              {todayNotifications.map((notification: any, index: number) => (
                <NotificationItem
                  key={`today-${index}`}
                  notification={notification}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  onDelete={handleDeleteNotification}
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
                  onDelete={handleDeleteNotification}
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
  onDelete,
}: {
  notification: any;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const notificationId = notification?.id;
  const userName = notification?.data?.data?.user?.name || "Unknown";
  const userAvatar = notification?.data?.data?.user?.avatar;
  const postId = notification?.data?.data?.post_id;
  const isLike = notification?.type.includes("Like");
  const isComment = notification?.type.includes("Comment");
  
  // Tentukan action text berdasarkan tipe notifikasi
  let actionText = "";
  if (isLike) {
    actionText = "Menyukai Postingan Anda";
  } else if (isComment) {
    actionText = `Mengomentari Postingan Anda : ${trimText(
      notification?.data?.data?.value || "",
      30
    )}`;
  } else {
    actionText = notification?.data?.message || "Notifikasi baru";
  }
  
  const timeAgo = moment(notification?.created_at).locale("id").fromNow();

  // Handle click pada notifikasi untuk navigasi ke postingan
  const handleNotificationClick = () => {
    if (postId) {
      router.push(`/social-media/post/${postId}`);
    }
  };

  // Handle delete notifikasi
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notificationId);
    setMenuOpen(null);
  };

  return (
    <div 
      className={`relative bg-teal-50 rounded-lg p-4 border border-teal-100 flex items-start gap-3 ${postId ? 'cursor-pointer hover:bg-teal-100 transition-colors' : ''}`}
      onClick={handleNotificationClick}
    >
      <Image
        src={userAvatar ? getImage(userAvatar) : "/img/profileplacholder.png"}
        alt={userName}
        width={48}
        height={48}
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
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(menuOpen === notificationId ? null : notificationId);
          }}
          className="p-1 rounded hover:bg-teal-100 transition"
        >
          <EllipsisVerticalIcon className="size-5 text-slate-600" />
        </button>

        {/* Dropdown Menu - Hanya Hapus */}
        {menuOpen === notificationId && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            <button 
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Hapus Notifikasi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
