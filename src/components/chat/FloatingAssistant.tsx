"use client";

import React, { useState } from "react";
import AssistantChatUI from "./AssistantChatUI";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
      {/* Floating Button */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[9990]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#009788] to-teal-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none"
        >
          {isOpen ? (
            <XMarkIcon className="w-8 h-8" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-7 h-7 md:w-8 md:h-8" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 md:w-[400px] md:h-[600px] z-[9999] bg-white overflow-hidden flex flex-col shadow-2xl md:rounded-3xl md:border md:border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <AssistantChatUI isPopup={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
