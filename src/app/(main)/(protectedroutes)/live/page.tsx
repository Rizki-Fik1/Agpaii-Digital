"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@firebase";
import { getImage } from "@/utils/function/function";
import {
  VideoCameraIcon,
  UserGroupIcon,
  PlayIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";

interface Viewer {
  userId: string;
  name: string;
  avatar: string;
}

interface Live {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  roomId: string;
  status: "live" | "ended";
  viewers: Viewer[];
  viewerCount: number; // computed from viewers.length
  startedAt: Date;
}

const LivePage: React.FC = () => {
  const router = useRouter();
  const [lives, setLives] = useState<Live[]>([]);
  const [endedLives, setEndedLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [endedLoading, setEndedLoading] = useState<boolean>(true);

  // Subscribe to active lives
  useEffect(() => {
    const livesRef = collection(db, "lives");
    const q = query(
      livesRef,
      where("status", "==", "live"),
      orderBy("startedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activeLives: Live[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          activeLives.push({
            id: doc.id,
            hostId: data.hostId,
            hostName: data.hostName,
            hostAvatar: data.hostAvatar,
            title: data.title,
            roomId: data.roomId,
            status: data.status,
            viewers: data.viewers || [],
            viewerCount: (data.viewers || []).length,
            startedAt: data.startedAt?.toDate() || new Date(),
          });
        });
        setLives(activeLives);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching lives:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to ended lives
  useEffect(() => {
    const livesRef = collection(db, "lives");
    const q = query(
      livesRef,
      where("status", "==", "ended"),
      orderBy("startedAt", "desc"),
      limit(10) // Limit to 10 most recent ended lives
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pastLives: Live[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          pastLives.push({
            id: doc.id,
            hostId: data.hostId,
            hostName: data.hostName,
            hostAvatar: data.hostAvatar,
            title: data.title,
            roomId: data.roomId,
            status: data.status,
            viewers: data.viewers || [],
            viewerCount: data.peakViewers || (data.viewers || []).length,
            startedAt: data.startedAt?.toDate() || new Date(),
          });
        });
        setEndedLives(pastLives);
        setEndedLoading(false);
      },
      (error) => {
        console.error("Error fetching ended lives:", error);
        setEndedLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFBFC] pb-10">
      {/* ===== HEADER ===== */}
      <div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 z-[9999] bg-gradient-to-r from-[#004D40] to-[#00897B] shadow-sm transition-all">
        <div className="max-w-[480px] md:max-w-none mx-auto px-4 md:px-8 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="size-5 text-white" />
          </button>
          <h1 className="text-white font-semibold ml-3 flex-grow text-lg">Live Streaming</h1>
        </div>
      </div>

      <div className="pt-[4.2rem] px-4 md:px-8 lg:px-12 py-5 md:py-8">
        {/* Go Live Button */}
        <Link
          href="/live/start"
          className="flex items-center gap-4 w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white rounded-2xl p-5 mb-6 md:mb-8 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
        >
          <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
            <VideoCameraIcon className="size-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg leading-tight">Mulai Live</p>
            <p className="text-sm text-white/80 mt-0.5">Bagikan momen Anda secara langsung</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5 text-xs font-semibold flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            GO LIVE
          </div>
        </Link>

        {/* Active Lives */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Sedang Live
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Memuat live...</p>
              </div>
            </div>
          ) : lives.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <VideoCameraIcon className="size-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-sm">Belum ada yang live saat ini</p>
              <p className="text-slate-400 text-xs mt-1">Jadilah yang pertama memulai live!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lives.map((live) => (
                <Link
                  key={live.id}
                  href={`/live/${live.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all"
                >
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <img
                      src={getImage(live.hostAvatar) || "/img/profileplacholder.png"}
                      alt={live.hostName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                      LIVE
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                      <UserGroupIcon className="size-3" />
                      {live.viewerCount}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <div className="bg-white/20 rounded-full p-3">
                        <PlayIcon className="size-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-slate-800 text-sm truncate">{live.hostName}</p>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{live.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ended Lives */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClockIcon className="size-5 text-slate-400" />
            Telah Berakhir
          </h2>

          {endedLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : endedLives.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="size-6 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Belum ada riwayat live</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {endedLives.map((live) => (
                <div
                  key={live.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                >
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                    <img
                      src={getImage(live.hostAvatar) || "/img/profileplacholder.png"}
                      alt={live.hostName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white opacity-80"
                    />
                    <div className="absolute top-2 left-2 bg-slate-600/80 text-white text-[10px] font-medium px-2 py-1 rounded-lg">
                      Berakhir
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                      <UserGroupIcon className="size-3" />
                      {live.viewerCount}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">
                      {formatDate(live.startedAt)}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-slate-700 text-sm truncate">{live.hostName}</p>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{live.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePage;
