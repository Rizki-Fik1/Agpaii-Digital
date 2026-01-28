"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState, useCallback } from "react";
import API from "@/utils/api/config";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@firebase";
import { getImage } from "@/utils/function/function";
import {
  VideoCameraIcon,
  PlayCircleIcon,
  UserGroupIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

interface VideoData {
  id: string;
  link: string;
  title: string;
}

interface Live {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  roomId: string;
  status: "live" | "ended";
  viewerCount: number;
  startedAt: Date;
}

const LivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"video" | "live">("video");
  
  // Video states
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  
  // Live states
  const [lives, setLives] = useState<Live[]>([]);
  const [liveLoading, setLiveLoading] = useState<boolean>(true);

  // Fetch YouTube videos
  useEffect(() => {
    const getYoutubeLinks = async () => {
      try {
        setVideoLoading(true);
        const response = await API.get<VideoData[]>(`/youtube`);
        setVideoData(response.data);
      } catch (error) {
        console.error("Error fetching YouTube links:", error);
      } finally {
        setVideoLoading(false);
      }
    };

    getYoutubeLinks();
  }, []);

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
            viewerCount: data.viewerCount || 0,
            startedAt: data.startedAt?.toDate() || new Date(),
          });
        });
        setLives(activeLives);
        setLiveLoading(false);
      },
      (error) => {
        console.error("Error fetching lives:", error);
        setLiveLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const extractVideoId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const renderVideoItem = (item: VideoData) => {
    const videoId = extractVideoId(item.link);

    if (!videoId) {
      return (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <p>Tidak dapat memuat video untuk link: {item.link}</p>
        </div>
      );
    }

    return (
      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <div className="aspect-w-16 aspect-video mb-2 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.title}
          ></iframe>
        </div>
        <p className="font-semibold text-lg text-center">{item.title}</p>
      </div>
    );
  };

  return (
    <div className="pt-[3.9rem] bg-gray-100 min-h-screen pb-8">
      <TopBar withBackButton>Live & Video</TopBar>

      {/* Tabs */}
      <div className="sticky top-[3.9rem] z-40 bg-white border-b border-slate-200 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-3 text-center font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "video"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500"
            }`}
          >
            <PlayCircleIcon className="size-5" />
            Video
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-3 text-center font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "live"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-slate-500"
            }`}
          >
            <VideoCameraIcon className="size-5" />
            Live
            {lives.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {lives.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Video Tab Content */}
        {activeTab === "video" && (
          <>
            {videoLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-700">Memuat data...</p>
                </div>
              </div>
            ) : videoData.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-700">Tidak ada tayangan YouTube</p>
              </div>
            ) : (
              <div>
                {videoData.map((item) => (
                  <div key={item.id}>{renderVideoItem(item)}</div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Live Tab Content */}
        {activeTab === "live" && (
          <>
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
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Sedang Live
              </h2>

              {liveLoading ? (
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
          </>
        )}
      </div>
    </div>
  );
};

export default LivePage;
