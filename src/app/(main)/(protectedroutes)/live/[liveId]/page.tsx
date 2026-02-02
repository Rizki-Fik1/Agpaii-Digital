"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@firebase";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import {
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const ZegoLiveViewer = dynamic(() => import("@/components/live/ZegoLiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-white text-sm">Memuat live stream...</div>
    </div>
  ),
});

interface Viewer {
  userId: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

interface LiveData {
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  roomId: string;
  status: "live" | "ended";
  viewers?: Viewer[];
}

export default function WatchLivePage() {
  const params = useParams();
  const liveId = params.liveId as string;
  const router = useRouter();
  const { auth: user } = useAuth();
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showViewers, setShowViewers] = useState(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!liveId) return;

    const liveRef = doc(db, "lives", liveId);
    const unsubscribe = onSnapshot(
      liveRef,
      (snapshot) => {
        if (hasNavigatedRef.current) return;
        
        if (snapshot.exists()) {
          const data = snapshot.data() as LiveData;
          setLive(data);

          if (data.status === "ended") {
            hasNavigatedRef.current = true;
            unsubscribe();
            alert("Live telah berakhir");
            router.replace("/live");
          }
        } else {
          hasNavigatedRef.current = true;
          unsubscribe();
          alert("Live tidak ditemukan");
          router.replace("/live");
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

  const handleLeave = () => {
    hasNavigatedRef.current = true;
    router.replace("/live");
  };

  const viewerCount = live?.viewers?.length || 0;



  if (!live) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Live tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <ZegoLiveViewer
        roomId={live.roomId}
        liveId={liveId}
        userId={String(user?.id)}
        userName={user?.name || "Viewer"}
        userAvatar={user?.avatar || ""}
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
              {/* Viewer Count - Clickable */}
              <button
                onClick={() => setShowViewers(true)}
                className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-black/70 transition-colors"
              >
                <UserGroupIcon className="size-4" />
                {viewerCount}
              </button>
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

      {/* Viewers Modal */}
      {showViewers && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowViewers(false)}
          />
          <div className="relative bg-slate-900 rounded-t-2xl w-full max-w-[480px] max-h-[60vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">
                Penonton ({viewerCount})
              </h3>
              <button
                onClick={() => setShowViewers(false)}
                className="text-white/60 hover:text-white"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
            
            {/* Viewers List */}
            <div className="overflow-y-auto max-h-[50vh] p-4">
              {viewerCount === 0 ? (
                <p className="text-white/50 text-center py-8">
                  Belum ada penonton
                </p>
              ) : (
                <div className="space-y-3">
                  {live.viewers?.map((viewer, index) => (
                    <div key={`${viewer.userId}-${index}`} className="flex items-center gap-3">
                      <img
                        src={getImage(viewer.avatar) || "/img/profileplacholder.png"}
                        alt={viewer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{viewer.name}</p>
                        <p className="text-white/50 text-xs">Menonton</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
