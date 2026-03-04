"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@firebase";
import { useRouter } from "next/navigation";
import { getImage } from "@/utils/function/function";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Viewer {
  userId: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

interface ZegoLiveHostProps {
  roomId: string;
  liveId: string;
  userId: string;
  userName: string;
}

export default function ZegoLiveHost({
  roomId,
  liveId,
  userId,
  userName,
}: ZegoLiveHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);
  const router = useRouter();
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const peakViewerRef = useRef<number>(0);
  const hasEndedRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const hasStartedLiveRef = useRef<boolean>(false);
  const abortTimeoutRef = useRef<any>(null);

  const viewerCount = viewers.length;

  // Function to end live stream
  const endLive = useCallback(async (shouldNavigate = true, targetRoute = "/live") => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    try {
      const liveRef = doc(db, "lives", liveId);
      if (!hasStartedLiveRef.current) {
        // If they never actually started the live stream, mark as aborted so it doesn't show in history
        await updateDoc(liveRef, {
          status: "aborted",
        });
      } else {
        await updateDoc(liveRef, {
          status: "ended",
          endedAt: serverTimestamp(),
          peakViewers: peakViewerRef.current,
        });
      }
    } catch (error) {
      console.error("Error ending live:", error);
    }
    if (shouldNavigate) {
      router.replace(targetRoute);
    }
  }, [liveId, router]);

  // Real-time viewers subscription
  useEffect(() => {
    const liveRef = doc(db, "lives", liveId);
    const unsubscribe = onSnapshot(liveRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const viewersList = data.viewers || [];
        setViewers(viewersList);
        if (viewersList.length > peakViewerRef.current) {
          peakViewerRef.current = viewersList.length;
        }
      }
    });
    return () => unsubscribe();
  }, [liveId]);

  // Zego Cloud Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0");
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

    if (!appID) {
      console.error("ZEGO_APP_ID is not configured");
      return;
    }

    const handleBeforeUnload = () => {
      endLive();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const initZego = async () => {
      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Host,
            },
          },
          showPreJoinView: false,
          showLeavingView: false,
          showRoomTimer: false,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showTextChat: true,
          showUserList: false,
          maxUsers: 1000,
          layout: "Auto",
          showLayoutButton: false,
          autoHideFooter: false,
          onLiveStart: async () => {
            try {
              hasStartedLiveRef.current = true;
              const liveRef = doc(db, "lives", liveId);
              await updateDoc(liveRef, { status: "live" });
            } catch (error) {
              console.error("Error updating status to live:", error);
            }
          },
          onLeaveRoom: () => {
            endLive();
          },
          onReturnToHomeScreenClicked: () => {
            endLive(true, "/live/start");
          },
          onLiveEnd: () => {
            endLive();
          },
        });
      } catch (error) {
        console.error("Error initializing Zego:", error);
      }
    };

    if (abortTimeoutRef.current) {
      clearTimeout(abortTimeoutRef.current);
      abortTimeoutRef.current = null;
    }

    initZego();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      abortTimeoutRef.current = setTimeout(() => {
        if (!hasEndedRef.current) {
          endLive(false); // Clean up the garbage document without pushing routing.
        }
      }, 500);

      if (zegoRef.current) {
        try {
          zegoRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying Zego instance:", error);
        }
        zegoRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [roomId, userId, userName, endLive]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* LIVE Badge & Viewer Count */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-red-600 px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
        <button
          onClick={() => setShowViewers(true)}
          className="bg-black/50 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1 hover:bg-black/70 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
          {viewerCount}
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full"
      />

      {/* Viewers Modal */}
      {showViewers && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowViewers(false)}
          />
          <div className="relative bg-slate-900 rounded-t-2xl w-full max-w-[480px] max-h-[60vh] overflow-hidden">
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
            
            <div className="overflow-y-auto max-h-[50vh] p-4">
              {viewerCount === 0 ? (
                <p className="text-white/50 text-center py-8">
                  Belum ada penonton
                </p>
              ) : (
                <div className="space-y-3">
                  {viewers.map((viewer, index) => (
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

