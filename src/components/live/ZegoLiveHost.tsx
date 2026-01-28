"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@firebase";
import { useRouter } from "next/navigation";

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
  const [viewerCount, setViewerCount] = useState<number>(0);

  // Function to end live stream
  const endLive = useCallback(async () => {
    try {
      const liveRef = doc(db, "lives", liveId);
      await updateDoc(liveRef, {
        status: "ended",
        endedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error ending live:", error);
    }
    router.push("/live");
  }, [liveId, router]);

  // Real-time viewer count subscription
  useEffect(() => {
    const liveRef = doc(db, "lives", liveId);
    // Subscribe to viewer count
    const unsubscribe = onSnapshot(liveRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setViewerCount(data.viewerCount || 0);
      }
    });
    return () => unsubscribe();
  }, [liveId]);

  // Zego Cloud Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0");
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

    if (!appID) {
      console.error("ZEGO_APP_ID is not configured");
      return;
    }

    // Safety cleanup when closing tab
    const handleBeforeUnload = async () => {
      endLive();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const initZego = async () => {
      try {
        // Generate tokens
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName
        );

        // Create instance
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoRef.current = zp;

        // Join room as host
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
          showRoomTimer: true,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showTextChat: true,
          showUserList: true, // Enable viewer list (Instagram-like)
          maxUsers: 1000,
          layout: "Auto", // Full screen vertical layout preference
          showLayoutButton: false,
          onLeaveRoom: () => {
             // We don't call endLive here immediately because sometimes onLeaveRoom triggers early? 
             // Actually it's fine, but let's stick to the callback.
            endLive();
          },
          onLiveEnd: () => {
            endLive();
          },
        });
      } catch (error) {
        console.error("Error initializing Zego:", error);
      }
    };

    initZego();

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (zegoRef.current) {
        try {
          zegoRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying Zego instance:", error);
        }
        zegoRef.current = null;
      }
      // Try to end live on unmount to prevent stale sessions
      endLive();
    };
  }, [roomId, userId, userName, endLive]);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Instagram-like LIVE Badge & Viewer Count */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-red-600 px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
        <div className="bg-black/50 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path
              fillRule="evenodd"
              d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
              clipRule="evenodd"
            />
          </svg>
          {viewerCount > 0 ? viewerCount : 0}
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-screen max-w-[480px] mx-auto"
      />
    </div>
  );
}
