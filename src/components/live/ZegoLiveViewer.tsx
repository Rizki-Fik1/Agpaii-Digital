"use client";
import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

interface ZegoLiveViewerProps {
  roomId: string;
  liveId: string;
  userId: string;
  userName: string;
}

export default function ZegoLiveViewer({
  roomId,
  liveId,
  userId,
  userName,
}: ZegoLiveViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);

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
        // Generate token
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

        // Join room as viewer
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Audience,
            },
          },
          showPreJoinView: false,
          showLeavingView: false,
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: false,
          showMyCameraToggleButton: false,
          showMyMicrophoneToggleButton: false,
          showTextChat: true,
          showUserList: true, // Enable viewer list (Instagram-like)
          maxUsers: 1000,
          layout: "Auto",
          showLayoutButton: false,
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
  }, [roomId, userId, userName]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen max-w-[480px] mx-auto bg-black"
    />
  );
}
