"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db } from "@firebase";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import {
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

// Dynamically import Zego component (client-side only)
const ZegoLiveViewer = dynamic(() => import("@/components/live/ZegoLiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
    </div>
  ),
});

interface LiveData {
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  roomId: string;
  status: "live" | "ended";
  viewerCount: number;
}

export default function WatchLivePage() {
  const params = useParams();
  const liveId = params.liveId as string;
  const router = useRouter();
  const { auth: user } = useAuth();
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!liveId) return;

    // Subscribe to live document
    const liveRef = doc(db, "lives", liveId);
    const unsubscribe = onSnapshot(
      liveRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as LiveData;
          setLive(data);

          // If live has ended, show message and redirect
          if (data.status === "ended") {
            alert("Live telah berakhir");
            router.push("/live");
          }
        } else {
          alert("Live tidak ditemukan");
          router.push("/live");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching live:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [liveId, router]);

  // Increment viewer count when joining
  useEffect(() => {
    if (!liveId || hasJoined || !live) return;

    const incrementViewers = async () => {
      try {
        const liveRef = doc(db, "lives", liveId);
        await updateDoc(liveRef, {
          viewerCount: increment(1),
        });
        setHasJoined(true);
      } catch (error) {
        console.error("Error incrementing viewers:", error);
      }
    };

    incrementViewers();

    // Decrement when leaving
    return () => {
      if (hasJoined) {
        const liveRef = doc(db, "lives", liveId);
        updateDoc(liveRef, {
          viewerCount: increment(-1),
        }).catch(console.error);
      }
    };
  }, [liveId, hasJoined, live]);

  const handleLeave = () => {
    router.push("/live");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Live tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Zego Viewer Component */}
      <ZegoLiveViewer
        roomId={live.roomId}
        liveId={liveId}
        userId={String(user?.id)}
        userName={user?.name || "Viewer"}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="pointer-events-auto absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between max-w-[480px] mx-auto">
            {/* Host Info */}
            <div className="flex items-center gap-3">
              <img
                src={getImage(live.hostAvatar) || "/img/profileplacholder.png"}
                alt={live.hostName}
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
              />
              <div>
                <p className="text-white font-semibold text-sm">{live.hostName}</p>
                <p className="text-white/60 text-xs">{live.title}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Viewer Count */}
              <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                <UserGroupIcon className="size-4" />
                {live.viewerCount}
              </div>
              {/* Close Button */}
              <button
                onClick={handleLeave}
                className="bg-black/50 p-2 rounded-full"
              >
                <XMarkIcon className="size-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-16 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
        </div>
      </div>
    </div>
  );
}
