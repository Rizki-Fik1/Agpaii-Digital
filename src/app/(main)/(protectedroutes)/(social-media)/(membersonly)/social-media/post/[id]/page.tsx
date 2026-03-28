"use client";

import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import { CommentTree } from "@/components/post/CommentTree";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import moment from "moment";
import "moment/locale/id";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/* ---------------- TEXT UTILS ---------------- */
function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

function createMarkup(text: string) {
  const replacedText = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$&" class="text-blue-500" target="_blank" rel="noopener noreferrer">$&</a>'
  );
  return { __html: replacedText };
}

/* ---------------- YOUTUBE UTILS ---------------- */
function getYoutubeId(url: string | null | undefined) {
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

/* ---------------- FILENAME UTILS ---------------- */
function extractFileName(path: string) {
  if (!path) return "";
  return path.split("/").pop() || path;
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function DetailPost() {
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { auth: user } = useAuth();

  /* ---------------- FETCH POST ---------------- */
  const fetchPost = async () => {
    const res = await API.get("post/" + id);
    if (res.status === 200) return res.data;
  };

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: fetchPost,
  });

  const youtubeId = post ? getYoutubeId(post.youtube_url) : null;

  // Sync like state when post loaded
  useMemo(() => {
    if (post) {
      setIsLiked(!!post.is_liked);
      setLikesCount(post.likes_count ?? 0);
    }
  }, [post]);

  /* ---------------- DELETE POST ---------------- */
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await API.delete("/post/" + id);
      if (res.status === 200) return res.data.message;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((p: any) => p.id !== parseInt(id as string)),
          })),
        };
      });

      return { previousPosts };
    },
    onSuccess: async () => {
      setModalOpen(false);
      toast.success("Postingan berhasil dihapus");
      router.back();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setModalOpen(false);
      toast.error("Gagal menghapus postingan");
    },
  });

  /* ---------------- COMMENT POST ---------------- */
  const { mutate: commentPost } = useMutation({
    mutationFn: async (commentText: string) => {
      const res = await API.post(`/post/${id}/comment`, { comment: commentText });
      if (res.status === 200) return res.data;
      throw new Error("Failed to post comment");
    },
    onMutate: () => {
      setIsSending(true);
    },
    onSuccess: () => {
      toast.success("Berhasil post Komentar");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
    onError: () => {
      toast.error("Gagal mengirim komentar");
    },
    onSettled: () => {
      setIsSending(false);
    },
  });

  if (error) return (error as any).message;

  const openImageModal = (imageSrc: string) => {
    const modalSrc = post?.full_image ? getImage(post.full_image) : imageSrc;
    setSelectedImage(modalSrc);
    setShowImageModal(true);
  };

  const handleLikeUnlikePost = async (liked: boolean) => {
    return API[liked ? "post" : "delete"](`post/${id}/like`);
  };

  const { mutate: likeUnlikePost } = useMutation<
    any,
    Error,
    boolean,
    { prevLiked: boolean; prevCount: number }
  >({
    mutationFn: handleLikeUnlikePost,
    onMutate: async () => {
      return { prevLiked: isLiked, prevCount: likesCount };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        setIsLiked(context.prevLiked);
        setLikesCount(context.prevCount);
      }
    },
  });

  const handleLikeClick = () => {
    if (!post) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : Math.max(c - 1, 0)));
    likeUnlikePost(nextLiked);
  };

  return (
    <>
      {/* DELETE MODAL */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <img src="/img/trash.svg" className="size-44" alt="" />
        <p>
          Apakah anda yakin ingin menghapus <br /> postingan ini?
        </p>
        <div className="flex justify-center gap-3 pt-8">
          <button
            onClick={() => deletePost()}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-md bg-[#009788] px-4 py-2 text-white transition hover:bg-[#007d6f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting && (
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {isDeleting ? "Menghapus..." : "Hapus Postingan"}
          </button>
          <button
            onClick={() => setModalOpen(false)}
            disabled={isDeleting}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </Modal>

      {/* FULL IMAGE MODAL */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-h-full max-w-4xl p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -right-4 -top-4 z-10 text-2xl text-white hover:text-gray-300"
            >
              ×
            </button>
            <div className="relative h-[90vh] w-[90vw]">
              <Image
                src={selectedImage}
                alt="Full Image"
                fill
                className="object-contain"
                onError={() => setShowImageModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="min-h-screen bg-slate-50 pb-8 pt-[4.1rem]">
        <TopBar withBackButton>Detail Post</TopBar>

        {/* CONTENT */}
        {isLoading ? (
          <div className="mt-40 flex items-center justify-center">
            <Loader className="size-12" />
          </div>
        ) : post ? (
          <div className="px-4 pb-8 pt-4">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* HEADER */}
                <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-4">
                  <Image
                    src={
                      post.author_id.avatar
                        ? getImage(post.author_id.avatar)
                        : "/img/profileplacholder.png"
                    }
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                    alt={post.author_id.name}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {post.author_id.name}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-500">
                      {post.author_id.profile.school_place}
                    </span>
                    <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {moment(post.created_at).locale("id").fromNow()}
                    </span>
                  </div>

                  {post.author_id.id === user.id && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/social-media/post/edit/${post.id}`)}
                        className="cursor-pointer rounded-full border border-blue-100 bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="cursor-pointer rounded-full border border-red-100 bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* BODY TEXT */}
                <div
                  className="px-4 pt-4 text-[0.95rem] leading-relaxed text-slate-800 [&_a]:font-medium [&_a]:text-[#009788] [&_a]:underline-offset-2 hover:[&_a]:underline"
                  dangerouslySetInnerHTML={createMarkup(post.body)}
                ></div>

                {/* MEDIA AREA */}
                <div className="mt-4 w-full">
                  {/* IMAGES */}
                  {post.images.length > 0 && (
                    <Swiper
                      className="mySwiper max-h-[20rem]"
                      pagination={{ dynamicBullets: true }}
                      modules={[Pagination]}
                    >
                      {post.images.map((image: any, i: number) => (
                        <SwiperSlide
                          key={i}
                          className="max-h-[20rem] bg-black/90"
                        >
                          <div className="relative h-full w-full">
                            <Image
                              src={getImage(image.src)}
                              alt="Post Image"
                              fill
                              className="mx-auto cursor-pointer object-contain"
                              onClick={() => openImageModal(getImage(image.src))}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}

                  {/* YOUTUBE */}
                  {post.images.length === 0 && youtubeId && (
                    <div
                      className="relative mx-4 mt-3 overflow-hidden rounded-xl border border-slate-200"
                      style={{ height: "260px" }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                        className="h-full w-full"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                      <div className="pointer-events-none absolute bottom-0 flex w-full items-center gap-2 bg-black/65 px-3 py-2 text-xs text-white">
                        <div className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">
                          YouTube
                        </div>
                        <span className="truncate">{post.youtube_url}</span>
                      </div>
                    </div>
                  )}

                  {/* TEXT ONLY */}
                  {post.images.length === 0 && !youtubeId && (
                    <div
                      style={{ backgroundImage: "url(/img/post.png)" }}
                      className="relative mx-4 mb-4 flex h-[17rem] items-center justify-center overflow-hidden rounded-xl bg-cover bg-center px-8 text-center text-xl font-semibold text-white"
                    >
                      <div className="absolute inset-0 bg-black/35" />
                      <p className="relative z-10 drop-shadow-md">
                        {trimText(post.body, 125)}
                      </p>
                    </div>
                  )}
                </div>

                {/* LIKE & COUNT (BOTTOM AREA) */}
                <div className="mt-4 px-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={handleLikeClick}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-[#009788]"
                    >
                      {isLiked ? (
                        <HeartSolidIcon className="size-5 text-red-500" />
                      ) : (
                        <HeartIcon className="size-5" />
                      )}
                      <span className="text-sm font-medium">
                        {likesCount} Suka
                      </span>
                    </button>
                    {post.comments?.length ? (
                      <span className="text-xs text-slate-400">
                        {post.comments.length} komentar
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* DOCUMENT BADGE */}
                {post.document && (
                  <a
                    href={getImage(post.document)}
                    target="_blank"
                    className="mx-4 mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800 shadow-sm"
                  >
                    <span className="text-base">📄</span>
                    <span className="max-w-[200px] truncate">
                      {extractFileName(post.document)}
                    </span>
                  </a>
                )}

                {/* COMMENTS */}
                <div className="mt-6 border-t border-slate-100 px-4 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Komentar
                    </h2>
                    <span className="text-xs text-slate-400">
                      {post.comments?.length || 0} komentar
                    </span>
                  </div>

                  {post.comments && post.comments.length > 0 ? (
                    <CommentTree comments={post.comments} postId={post.id} />
                  ) : (
                    <p className="text-xs text-slate-400">
                      Belum ada komentar. Jadilah yang pertama memberikan tanggapan.
                    </p>
                  )}

                  {/* COMMENT INPUT */}
                  <form
                    method="POST"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (comment.trim() && !isSending) {
                        commentPost(comment);
                      }
                    }}
                    className="mt-4 flex items-center gap-3"
                  >
                    <img
                      src={
                        (user?.avatar && getImage(user.avatar)) ||
                        "/img/profileplacholder.png"
                      }
                      alt={user?.name || "User"}
                      className="size-9 rounded-full object-cover"
                    />
                    <div className="flex-1 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        type="text"
                        className="flex-1 border-none bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
                        placeholder="Tulis komentar yang sopan dan bermanfaat..."
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim() || isSending}
                        className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-full text-white transition-all active:scale-90",
                          !comment.trim() || isSending
                            ? "bg-slate-300"
                            : "bg-[#009788] hover:bg-[#007d6f]"
                        )}
                      >
                        <PaperAirplaneIcon className="size-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
