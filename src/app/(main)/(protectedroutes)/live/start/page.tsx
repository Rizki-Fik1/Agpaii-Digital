"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@firebase";
import { getImage } from "@/utils/function/function";
import {
  VideoCameraIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

// Dynamically import Zego component (client-side only)
const ZegoLiveHost = dynamic(() => import("@/components/live/ZegoLiveHost"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function StartLivePage() {
  const { auth: user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleStartLive = async () => {
    if (!title.trim() || !user) return;

    setIsStarting(true);

    try {
      // Generate unique room ID
      const newRoomId = `live_${user.id}_${Date.now()}`;

      // Create live document in Firestore
      const liveRef = await addDoc(collection(db, "lives"), {
        hostId: String(user.id),
        hostName: user.name || "Anonymous",
        hostAvatar: user.avatar || "",
        title: title.trim(),
        roomId: newRoomId,
        status: "preparing",
        viewers: [], // Array of viewer objects
        startedAt: serverTimestamp(),
      });

      setLiveId(liveRef.id);
      setRoomId(newRoomId);
    } catch (error) {
      console.error("Error starting live:", error);
      setIsStarting(false);
      alert("Gagal memulai live. Silakan coba lagi.");
    }
  };

  // If live has started, show ZegoLiveHost
  if (liveId && roomId) {
    return (
      <ZegoLiveHost
        roomId={roomId}
        liveId={liveId}
        userId={String(user?.id)}
        userName={user?.name || "Host"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-pink-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 z-50 transition-all">
        <div className="max-w-[480px] md:max-w-none mx-auto px-4 md:px-8 py-4 flex items-center">
          <button
            onClick={() => router.replace("/live")}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
          >
            <ArrowLeftIcon className="size-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg ml-3">Mulai Live</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 md:pt-28 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-lg mx-auto">
          {/* Preview Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-5 border border-white/10 shadow-xl">
            {/* User Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={getImage(user?.avatar) || "/img/profileplacholder.png"}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-pink-400 shadow-lg"
              />
              <div>
                <p className="text-white font-bold text-base">{user?.name || "User"}</p>
                <p className="text-white/50 text-sm">Siap untuk live?</p>
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-5">
              <label className="block text-white/80 text-xs font-semibold mb-2 uppercase tracking-wider">
                Judul Live
              </label>
              <div className="relative">
                <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tulis judul yang menarik..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm transition"
                  maxLength={100}
                />
              </div>
              <p className="text-white/30 text-xs mt-1.5 text-right">{title.length}/100</p>
            </div>

            {/* Preview */}
            <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-5 flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <VideoCameraIcon className="size-7 text-white/30" />
                </div>
                <p className="text-white/40 text-xs">Preview kamera akan muncul di sini</p>
              </div>
              {/* Live Badge Preview */}
              <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                LIVE
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartLive}
              disabled={!title.trim() || isStarting}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isStarting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memulai...
                </>
              ) : (
                <>
                  <VideoCameraIcon className="size-5" />
                  Mulai Live Sekarang
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-white/60 text-xs font-semibold mb-3 uppercase tracking-wider">💡 Tips Live</p>
            <ul className="text-white/40 text-xs space-y-2">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0"/>Pastikan koneksi internet Anda stabil</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0"/>Gunakan pencahayaan yang baik</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0"/>Izinkan akses kamera dan mikrofon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
