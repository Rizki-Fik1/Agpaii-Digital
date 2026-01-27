"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  HeartIcon,
  HomeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

export default function SocialMediaNavbar() {
  const { auth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("beranda");
  const hiddenNavPages = ["/social-media/post", "/profile/edit"];
  const isNavHidden = () => {
    return hiddenNavPages.some((page) => pathname.includes(page));
  };

  const navList: {
    label: string;
    icon: ReactNode;
    link: string;
    active?: boolean;
    id: string;
  }[] = [
    {
      id: "beranda",
      label: "Beranda",
      icon: <HomeIcon className="size-6" />,
      active: pathname === "/social-media",
      link: "/social-media",
    },
    {
      id: "disukai",
      label: "Disukai",
      icon: <HeartIcon className="size-6" />,
      active: pathname === "/social-media/liked",
      link: "/social-media/liked",
    },
    {
      id: "posting",
      label: "Posting",
      icon: <PlusIcon className="size-6" />,
      link: "/social-media/post/new",
      active: false,
    },
    {
      id: "pesan",
      label: "Pesan",
      icon: <ChatBubbleLeftIcon className="size-6" />,
      link: "/social-media/chat",
      active: pathname === "/social-media/chat",
    },
    {
      id: "profil",
      label: "Profil",
      icon: <UserIcon className="size-6" />,
      link: `/profile/${auth.id}`,
      active: pathname === `/profile/${auth.id}`,
    },
  ];

  return (
    !isNavHidden() && (
      <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-stretch justify-around h-16">
          {navList.map((list, i) => {
            const isPostingButton = list.id === "posting";
            const isChatConversation =
              pathname.startsWith("/social-media/chat/") &&
              pathname !== "/social-media/chat";

            if (isPostingButton && isChatConversation) return null;

            if (isPostingButton) {
              return (
                <Link
                  key={i}
                  href={list.link}
                  className="flex-1 flex flex-col items-center justify-center relative"
                >
                  <div className="absolute -top-6 bg-teal-600 rounded-full p-3 shadow-lg hover:bg-teal-700 transition text-white">
                    <PlusIcon className="size-7" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-auto mb-1">
                    {list.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={i}
                href={list.link}
                onClick={() => setActiveTab(list.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition"
              >
                <div
                  className={clsx(
                    "transition-colors",
                    list.active ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {list.icon}
                </div>
                <span
                  className={clsx(
                    "text-xs font-medium",
                    list.active ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {list.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    )
  );
}
