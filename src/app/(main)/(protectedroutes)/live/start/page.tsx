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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
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
        status: "live",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 py-4 flex items-center z-50">
        <button
          onClick={() => router.replace("/live")}
          className="p-2 bg-white/10 rounded-full backdrop-blur-sm"
        >
          <ArrowLeftIcon className="size-6 text-white" />
        </button>
        <h1 className="text-white font-bold text-lg ml-3">Mulai Live</h1>
      </div>

      {/* Content */}
      <div className="pt-20 px-4 pb-8">
        {/* Preview Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          {/* User Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={getImage(user?.avatar) || "/img/profileplacholder.png"}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
            />
            <div>
              <p className="text-white font-semibold text-lg">{user?.name || "User"}</p>
              <p className="text-white/60 text-sm">Siap untuk live?</p>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-white/80 text-sm mb-2 font-medium">
              Judul Live
            </label>
            <div className="relative">
              <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/40" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis judul yang menarik..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                maxLength={100}
              />
            </div>
            <p className="text-white/40 text-xs mt-2 text-right">{title.length}/100</p>
          </div>

          {/* Preview */}
          <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <div className="text-center">
              <VideoCameraIcon className="size-16 text-white/30 mx-auto mb-2" />
              <p className="text-white/50 text-sm">Preview kamera akan muncul di sini</p>
            </div>
            {/* Live Badge Preview */}
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartLive}
            disabled={!title.trim() || isStarting}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Memulai...
              </>
            ) : (
              <>
                <VideoCameraIcon className="size-6" />
                Mulai Live Sekarang
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-white/60 text-sm font-medium mb-2">💡 Tips:</p>
          <ul className="text-white/40 text-xs space-y-1">
            <li>• Pastikan koneksi internet Anda stabil</li>
            <li>• Gunakan pencahayaan yang baik</li>
            <li>• Izinkan akses kamera dan mikrofon</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
