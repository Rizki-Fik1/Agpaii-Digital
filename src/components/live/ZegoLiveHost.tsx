"use client";
import { useEffect, useRef, useCallback } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
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

  useEffect(() => {
    if (!containerRef.current) return;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0");
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

    if (!appID) {
      console.error("ZEGO_APP_ID is not configured");
      return;
    }

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
      if (zegoRef.current) {
        try {
          zegoRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying Zego instance:", error);
        }
        zegoRef.current = null;
      }
    };
  }, [roomId, userId, userName, endLive]);

  return (
    <div className="min-h-screen bg-black">
      <div
        ref={containerRef}
        className="w-full h-screen max-w-[480px] mx-auto"
      />
    </div>
  );
}
