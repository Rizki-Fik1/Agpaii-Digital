"use client";

import API from "@/utils/api/config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post as PostType } from "@/types/post/post";
import { useInView } from "react-intersection-observer";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import Loader from "@/components/loader/loader";
import { getImage } from "@/utils/function/function";
import {
  ArrowLeftIcon,
  PencilIcon,
  BuildingLibraryIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import SocialMediaNavbar from "@/components/nav/social_media_nav";

import UserAvatar from "@/components/ui/user-avatar";

function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Profile() {
  const router = useRouter();
  const { auth: auth } = useAuth();
  const { id } = useParams();
  const [postCount, setPostCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"foto" | "teks">("foto");
  const { ref, inView } = useInView();

  /* ---------------- FETCH PROFILE ---------------- */
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await API.get(`user/${id}`);
      if (res.status === 200) return res.data;
    },
  });

  /* ---------------- FETCH POSTS ---------------- */
  const fetchPosts = async ({ pageParam }: { pageParam: number }) => {
    const res = await API.get(`/user/${profile?.id}/post?page=${pageParam}`);
    if (res.status === 200) {
      setPostCount(res.data.total);

      return {
        currentPage: pageParam,
        data: res.data.data as PostType[],
        nextPage:
          res.data.next_page_url !== null
            ? parseInt(res.data.next_page_url.split("=")[1])
            : undefined,
      };
    }
  };

  const {
    data: posts,
    isLoading,
    isPending,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    enabled: !!profile,
    queryKey: ["posts", id?.toString()],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  if (profileLoading) return null;

  /* ---------------- EXTRACT YOUTUBE ID ---------------- */
  function extractYoutubeId(url: string) {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^?&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
    ];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) return match[1];
    }
    return null;
  }

  return (
    <div className="pb-28 bg-white min-h-screen">
      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-[99] max-w-[480px] mx-auto bg-teal-700 text-white px-4 py-4 flex items-center">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeftIcon className="size-6 text-white" />
        </button>
        <h1 className="font-semibold text-lg ml-3 flex-grow">Profil</h1>
        {auth.id === profile?.id && (
          <Link
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-white transition flex items-center gap-1"
            href={"/profile/edit/social-media"}
          >
            <PencilIcon className="size-4" />
            Edit Profil
          </Link>
        )}
      </div>

      <div className="pt-16">
        {/* COVER IMAGE */}
        <div className="relative">
          <img
            src={
              (profile?.banner !== null && getImage(profile.banner.src)) ||
              "/img/post.png"
            }
            alt="banner"
            className="w-full h-40 object-cover"
          />

          {/* PROFILE PICTURE - OVERLAPPING */}
          <div className="flex justify-start -mt-16 relative z-10 px-4">
            <div className="border-4 border-white rounded-full overflow-hidden bg-white">
              <UserAvatar
                src={profile?.avatar}
                name={profile.name}
                className="w-32 h-32 text-4xl"
              />
            </div>
          </div>
        </div>

        {/* USER INFO SECTION */}
        <div className="px-4 pt-6 pb-4">
          {/* NAME */}
          <h1 className="font-bold text-xl text-slate-900">{profile.name}</h1>

          {/* KTA & LOCATION */}
          <div className="text-sm text-slate-600 mt-1">
            {profile?.kta_id && (
              <p className="font-medium">
                No. KTA{" "}
                <span className="font-semibold text-[#009788]">
                  {profile?.kta_id}
                </span>
              </p>
            )}
            {profile?.profile.school_place && (
              <div className="flex items-center gap-1 mt-1">
                <BuildingLibraryIcon className="size-4 text-slate-600" />
                <span>{profile.profile.school_place}</span>
              </div>
            )}
            {profile?.profile.home_address && (
              <div className="flex items-center gap-1 mt-1">
                <MapPinIcon className="size-4 text-slate-600" />
                <span>{profile.profile.home_address}</span>
              </div>
            )}
          </div>

          {/* STATS SECTION */}
          <div className="flex justify-around mt-6 py-4 border-t border-b border-slate-200">
            <div className="text-center">
              <p className="font-bold text-lg text-slate-900">{postCount}</p>
              <p className="text-xs text-slate-500">Postingan</p>
            </div>
            <div
              onClick={() => router.push(`/profile/${profile.id}/modules`)}
              className="text-center cursor-pointer hover:opacity-80 transition"
            >
              <p className="font-bold text-lg text-slate-900">
                {profile?.modules_learn_count ?? 0}
              </p>
              <p className="text-xs text-slate-500">Modul</p>
            </div>

            <div className="text-center">
              <p className="font-bold text-lg text-slate-900">
                {profile?.created_at.split("-")[0]}
              </p>
              <p className="text-xs text-slate-500">Bergabung</p>
            </div>
          </div>

          {/* BIO SECTION */}
          {profile?.profile.long_bio && (
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Bio</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile?.profile.long_bio}
              </p>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 px-4">
          <button
            onClick={() => setActiveTab("foto")}
            className={`flex-1 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "foto"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-600"
            }`}
          >
            Foto & Video
          </button>
          <button
            onClick={() => setActiveTab("teks")}
            className={`flex-1 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "teks"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-600"
            }`}
          >
            Teks & Dokumen
          </button>
        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-3 gap-1">
          {isPending || isLoading ? (
            <div className="col-span-3 flex justify-center py-16">
              <Loader className="size-8" />
            </div>
          ) : (
            posts?.pages.map((page: any, index) => (
              <div key={index} className="contents">
                {page?.data.length > 0
                  ? page?.data.map((post: any, i: number) => {
                      const youtubeId = extractYoutubeId(post.youtube_url);
                      const hasImage = post.images && post.images.length > 0;
                      const hasYoutube = !hasImage && youtubeId;
                      const hasDocument =
                        !hasImage && !hasYoutube && post.document;

                      // Filter berdasarkan tab
                      // Tab "foto" = Foto & Video (images + YouTube)
                      // Tab "teks" = Teks & Dokumen (text-only + documents)
                      if (activeTab === "foto" && !hasImage && !hasYoutube)
                        return null;
                      if (activeTab === "teks" && (hasImage || hasYoutube))
                        return null;

                      return (
                        <Link
                          key={i}
                          href={"/social-media/post/" + post.id}
                          className="aspect-square relative bg-slate-200 overflow-hidden hover:opacity-80 transition"
                        >
                          {/* IMAGE */}
                          {hasImage && (
                            <img
                              className="w-full h-full object-cover"
                              src={getImage(post.images[0].src)}
                            />
                          )}

                          {/* YOUTUBE */}
                          {hasYoutube && (
                            <div className="w-full h-full relative">
                              <img
                                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                className="w-full h-full object-cover opacity-80"
                              />

                              {/* PLAY ICON */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/80 rounded-full p-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="black"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>

                              {/* BADGE */}
                              <div className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm">
                                YouTube
                              </div>
                            </div>
                          )}

                          {/* DOCUMENT BADGE */}
                          {hasDocument && (
                            <div className="w-full h-full flex items-center justify-center bg-slate-600 text-white text-xs p-2 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">📄</span>
                                <span className="text-[9px] truncate px-1 line-clamp-2">
                                  {post.document.split("/").pop()}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* TEXT ONLY */}
                          {!hasImage && !hasYoutube && !hasDocument && (
                            <div
                              style={{ backgroundImage: "url(/img/post.png)" }}
                              className="bg-cover bg-center w-full h-full flex px-4 py-4 text-center"
                            >
                              <p className="text-xs text-white m-auto break-words line-clamp-3">
                                {trimText(post.body, 50)}
                              </p>
                            </div>
                          )}
                        </Link>
                      );
                    })
                  : null}
              </div>
            ))
          )}
        </div>

        {/* EMPTY STATE */}
        {!isPending && !isLoading && posts?.pages[0]?.data.length === 0 && (
          <div className="p-4 w-full text-center pt-16 text-slate-600">
            Tidak Ada Postingan
          </div>
        )}
        <div ref={ref}></div>
      </div>

      {/* Bottom Navigation Bar */}
      <SocialMediaNavbar />
    </div>
  );
}
