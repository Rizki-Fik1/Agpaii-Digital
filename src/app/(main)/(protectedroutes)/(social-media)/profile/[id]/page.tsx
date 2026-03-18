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
  CalendarDaysIcon,
  IdentificationIcon,
  PhotoIcon,
  DocumentTextIcon,
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
    <div className="pb-28 bg-white md:bg-[#FAFBFC] min-h-screen lg:pr-[240px] xl:pr-[280px]">
      {/* ===== FIXED HEADER ===== */}
      <div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 lg:right-[240px] xl:right-[280px] z-[99] bg-gradient-to-r from-[#004D40] to-[#00897B] text-white shadow-sm transition-all">
        <div className="max-w-[480px] md:max-w-none xl:max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeftIcon className="size-5 text-white" />
          </button>
          <h1 className="font-semibold text-lg ml-3 flex-grow">Profil</h1>
          {auth.id === profile?.id && (
            <Link
              className="text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-white transition flex items-center gap-1.5 font-medium"
              href={"/profile/edit/social-media"}
            >
              <PencilIcon className="size-4" />
              Edit Profil
            </Link>
          )}
        </div>
      </div>

      <div className="pt-16 md:pt-20">
        {/* ===== COVER + PROFILE SECTION ===== */}
        <div className="md:max-w-5xl md:mx-auto">
          {/* Cover Image */}
          <div className="relative">
            <img
              src={
                (profile?.banner !== null && getImage(profile.banner.src)) ||
                "/img/post.png"
              }
              alt="banner"
              className="w-full h-40 md:h-56 lg:h-64 object-cover md:rounded-b-3xl"
            />
            {/* Gradient overlay on desktop */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:rounded-b-3xl" />
          </div>

          {/* Profile Info Card */}
          <div className="relative px-4 md:px-8 -mt-16 md:-mt-20 z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
              {/* Avatar + Name Row */}
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Avatar — self-start prevents stretch on mobile */}
                <div className="self-start border-4 border-white rounded-full overflow-hidden bg-white shadow-lg md:shadow-xl flex-shrink-0 w-28 h-28 md:w-36 md:h-36" style={{minWidth: '7rem', minHeight: '7rem'}}>
                  <img
                    src={profile?.avatar ? getImage(profile.avatar) : '/icons/avatar.jpg'}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/icons/avatar.jpg'; }}
                  />
                </div>

                {/* Name + Meta — full width on mobile, beside avatar on desktop */}
                <div className="flex-1 md:pb-2 w-full">
                  <h1 className="font-bold text-xl md:text-2xl text-slate-900">{profile.name}</h1>
                  <div className="text-sm text-slate-500 mt-1 space-y-1">
                    {profile?.kta_id && (
                      <div className="flex items-center gap-1.5">
                        <IdentificationIcon className="size-4 text-[#009788]" />
                        <span>
                          No. KTA{" "}
                          <span className="font-semibold text-[#009788]">{profile?.kta_id}</span>
                        </span>
                      </div>
                    )}
                    {profile?.profile.school_place && (
                      <div className="flex items-center gap-1.5">
                        <BuildingLibraryIcon className="size-4 text-slate-400" />
                        <span>{profile.profile.school_place}</span>
                      </div>
                    )}
                    {profile?.profile.home_address && (
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="size-4 text-slate-400" />
                        <span>{profile.profile.home_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit button on desktop (inside card) */}
                {auth.id === profile?.id && (
                  <div className="hidden md:block">
                    <Link
                      className="inline-flex items-center gap-2 bg-[#009788] hover:bg-[#00867a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                      href={"/profile/edit/social-media"}
                    >
                      <PencilIcon className="size-4" />
                      Edit Profil
                    </Link>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex mt-6 md:mt-8">
                <div className="flex-1 flex justify-around py-4 bg-slate-50 md:bg-[#FAFBFC] rounded-2xl border border-slate-100">
                  <div className="text-center px-4">
                    <p className="font-bold text-lg md:text-xl text-slate-900">{postCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Postingan</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div
                    onClick={() => router.push(`/profile/${profile.id}/modules`)}
                    className="text-center cursor-pointer hover:opacity-80 transition px-4"
                  >
                    <p className="font-bold text-lg md:text-xl text-slate-900">
                      {profile?.modules_learn_count ?? 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Modul</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center px-4">
                    <p className="font-bold text-lg md:text-xl text-slate-900">
                      {profile?.created_at.split("-")[0]}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Bergabung</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile?.profile.long_bio && (
                <div className="mt-5 md:mt-6 p-4 bg-slate-50 md:bg-[#FAFBFC] rounded-2xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700 text-sm mb-2">Bio</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {profile?.profile.long_bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===== TABS ===== */}
          <div className="mt-6 md:mt-8 md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 md:overflow-hidden">
            <div className="flex border-b border-slate-200 px-4 md:px-8">
              <button
                onClick={() => setActiveTab("foto")}
                className={`flex-1 py-3.5 font-medium text-sm border-b-2 transition flex items-center justify-center gap-2 ${
                  activeTab === "foto"
                    ? "border-[#009788] text-[#009788]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <PhotoIcon className="size-4" />
                Foto & Video
              </button>
              <button
                onClick={() => setActiveTab("teks")}
                className={`flex-1 py-3.5 font-medium text-sm border-b-2 transition flex items-center justify-center gap-2 ${
                  activeTab === "teks"
                    ? "border-[#009788] text-[#009788]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <DocumentTextIcon className="size-4" />
                Teks & Dokumen
              </button>
            </div>

            {/* POSTS GRID */}
            <div className="grid grid-cols-3 gap-0.5 md:gap-1 md:p-2">
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
                          const hasDocument = !hasImage && !hasYoutube && post.document;

                          if (activeTab === "foto" && !hasImage && !hasYoutube) return null;
                          if (activeTab === "teks" && (hasImage || hasYoutube)) return null;

                          return (
                            <Link
                              key={i}
                              href={"/social-media/post/" + post.id}
                              className="aspect-square relative bg-slate-200 overflow-hidden hover:opacity-80 transition md:rounded-xl"
                            >
                              {/* IMAGE */}
                              {hasImage && (
                                <img className="w-full h-full object-cover" src={getImage(post.images[0].src)} />
                              )}

                              {/* YOUTUBE */}
                              {hasYoutube && (
                                <div className="w-full h-full relative">
                                  <img
                                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                    className="w-full h-full object-cover opacity-80"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/80 rounded-full p-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="w-6 h-6">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm">
                                    YouTube
                                  </div>
                                </div>
                              )}

                              {/* DOCUMENT */}
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
              <div className="p-4 w-full text-center py-16 text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <PhotoIcon className="size-12 text-slate-300" />
                  <p className="text-sm">Belum ada postingan</p>
                </div>
              </div>
            )}
            <div ref={ref}></div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <SocialMediaNavbar />
    </div>
  );
}
