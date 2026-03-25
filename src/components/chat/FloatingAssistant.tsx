"use client";

import React, { useState } from "react";
import AssistantChatUI from "./AssistantChatUI";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hanya tampilkan icon melayang di halaman tertentu: 
  // - Tidak di halaman login/auth
  // - Tampil di getting-started, menu sosial media, dll.
  // - Tidak tampil di dalam room obrolan asisten aslinya sendiri
  const isAuthPage = pathname?.startsWith("/auth");
  const isDedicatedChatPage = pathname?.includes("/chat/assistant");

  if (isAuthPage || isDedicatedChatPage) {
    return null;
  }

  return (
    <>
      <div className="md:hidden fixed bottom-24 right-4 z-[9900]">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-[#009788] to-teal-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7" />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] bg-white overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AssistantChatUI isPopup={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
