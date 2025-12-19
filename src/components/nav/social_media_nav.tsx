"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  ChatBubbleLeftIcon,
  HomeIcon,
  HeartIcon as HeartOutlineIcon,
  UserIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SocialMediaNavbar() {
  const { auth } = useAuth();
  const pathname = usePathname();
  const hiddenNavPages = ["/social-media/post", "/profile/edit"];
  const isNavHidden = () => {
    return hiddenNavPages.some((page) => pathname.includes(page));
  };

  return (
    !isNavHidden() && (
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white px-0 py-0 flex justify-around items-center z-[99]">
        <Link
          href="/social-media"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 ${pathname === "/social-media" ? "text-teal-700" : "text-slate-400"}`}
        >
          <HomeIcon className="size-6 mb-0.5" />
          <span className="text-xs">Beranda</span>
        </Link>
        <Link
          href="/social-media/liked"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 ${pathname === "/social-media/liked" ? "text-teal-700" : "text-slate-400"}`}
        >
          <HeartOutlineIcon className="size-6 mb-0.5" />
          <span className="text-xs">Disukai</span>
        </Link>
        <Link
          href="/social-media/post/new"
          className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-teal-700"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-700 mb-0.5">
            <PlusIcon className="size-6 text-white" />
          </div>
          <span className="text-xs">Posting</span>
        </Link>
        <Link
          href="/social-media/chat"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 ${pathname.startsWith("/social-media/chat") ? "text-teal-700" : "text-slate-400"}`}
        >
          <ChatBubbleLeftIcon className="size-6 mb-0.5" />
          <span className="text-xs">Pesan</span>
        </Link>
        <Link
          href={`/profile/${auth.id}`}
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 ${pathname.startsWith("/profile") ? "text-teal-700" : "text-slate-400"}`}
        >
          <UserIcon className="size-6 mb-0.5" />
          <span className="text-xs">Profil</span>
        </Link>
      </div>
    )
  );
}