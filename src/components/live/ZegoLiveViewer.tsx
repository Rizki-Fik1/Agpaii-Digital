"use client";
import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@firebase";

interface ZegoLiveViewerProps {
  roomId: string;
  liveId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export default function ZegoLiveViewer({
  roomId,
  liveId,
  userId,
  userName,
  userAvatar = "",
}: ZegoLiveViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);
  const hasJoinedRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  // Viewer data object
  const viewerData = {
    userId: userId,
    name: userName,
    avatar: userAvatar,
    joinedAt: new Date().toISOString(),
  };

  // Add viewer to list when joining
  const addViewer = async () => {
    if (hasJoinedRef.current) return;
    try {
      const liveRef = doc(db, "lives", liveId);
      await updateDoc(liveRef, {
        viewers: arrayUnion(viewerData),
      });
      hasJoinedRef.current = true;
      console.log("Viewer added to list");
    } catch (error) {
      console.error("Error adding viewer:", error);
    }
  };

  // Remove viewer from list when leaving
  const removeViewer = async () => {
    if (!hasJoinedRef.current) return;
    try {
      const liveRef = doc(db, "lives", liveId);
      await updateDoc(liveRef, {
        viewers: arrayRemove(viewerData),
      });
      hasJoinedRef.current = false;
      console.log("Viewer removed from list");
    } catch (error) {
      console.error("Error removing viewer:", error);
    }
  };

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
              role: ZegoUIKitPrebuilt.Audience,
            },
          },
          showUserList: false,
          onJoinRoom: () => {
            addViewer();
          },
          onLeaveRoom: () => {
            removeViewer();
          },
        });
      } catch (error) {
        console.error("Error initializing Zego:", error);
      }
    };

    const handleBeforeUnload = () => {
      removeViewer();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    initZego();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      isInitializedRef.current = false;
      
      if (zegoRef.current) {
        try {
          zegoRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying Zego instance:", error);
        }
        zegoRef.current = null;
      }
    };
  }, [roomId, liveId, userId, userName]);

  return (
    <div className="min-h-screen bg-black relative -ml-20">
      <div
        ref={containerRef}
        className="w-full h-screen"
      />
    </div>
  );
}
