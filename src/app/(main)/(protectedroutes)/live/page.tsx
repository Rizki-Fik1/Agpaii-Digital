"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@firebase";
import { getImage } from "@/utils/function/function";
import {
  VideoCameraIcon,
  UserGroupIcon,
  PlayIcon,
  ClockIcon,
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
    <div className="pt-[3.9rem] bg-gray-100 min-h-screen pb-8">
      <TopBar withBackButton>Live</TopBar>

      <div className="p-4">
        {/* Go Live Button */}
        <Link
          href="/live/start"
          className="block w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl p-4 mb-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <VideoCameraIcon className="size-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Mulai Live</p>
              <p className="text-sm opacity-90">Bagikan momen Anda secara langsung</p>
            </div>
          </div>
        </Link>

        {/* Active Lives */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Sedang Live
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : lives.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <VideoCameraIcon className="size-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Belum ada yang live saat ini</p>
              <p className="text-slate-400 text-sm mt-1">Jadilah yang pertama memulai live!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {lives.map((live) => (
                <Link
                  key={live.id}
                  href={`/live/${live.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Live Preview Placeholder */}
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <img
                      src={getImage(live.hostAvatar) || "/img/profileplacholder.png"}
                      alt={live.hostName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                    {/* Live Badge */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </div>
                    {/* Viewer Count */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <UserGroupIcon className="size-3" />
                      {live.viewerCount}
                    </div>
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <PlayIcon className="size-12 text-white" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="font-medium text-slate-800 text-sm truncate">{live.hostName}</p>
                    <p className="text-slate-500 text-xs truncate">{live.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ended Lives */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ClockIcon className="size-5 text-slate-500" />
            Telah Berakhir
          </h2>

          {endedLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
            </div>
          ) : endedLives.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <p className="text-slate-500 text-sm">Belum ada riwayat live</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {endedLives.map((live) => (
                <div
                  key={live.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Ended Live Preview */}
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                    <img
                      src={getImage(live.hostAvatar) || "/img/profileplacholder.png"}
                      alt={live.hostName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white opacity-80"
                    />
                    {/* Ended Badge */}
                    <div className="absolute top-2 left-2 bg-slate-600 text-white text-xs font-medium px-2 py-1 rounded">
                      Berakhir
                    </div>
                    {/* Viewer Count */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <UserGroupIcon className="size-3" />
                      {live.viewerCount} penonton
                    </div>
                    {/* Date */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {formatDate(live.startedAt)}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="font-medium text-slate-800 text-sm truncate">{live.hostName}</p>
                    <p className="text-slate-500 text-xs truncate">{live.title}</p>
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
