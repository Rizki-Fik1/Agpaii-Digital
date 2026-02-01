"use client";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import Comment from "@/components/post/comment";
import { CommentTree } from "@/components/post/CommentTree";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import moment from "moment";
import "moment/locale/id";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Pagination } from "swiper/modules";
import { SwiperSlide, Swiper } from "swiper/react";
import Image from "next/image";

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
function getYoutubeId(url: string) {
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
  const [modalOpen, setmodalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { auth: user } = useAuth();

  /* ---------------- FETCH POST ---------------- */
  const fetchPost = async () => {
    const res = await API.get("post/" + id);
    if (res.status === 200) return res.data;
  };
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: fetchPost,
  });

  /* ---------------- DELETE POST ---------------- */
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await API.delete("/post/" + id);
      if (res.status === 200) return res.data.message;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      
      // Snapshot previous value untuk rollback
      const previousPosts = queryClient.getQueryData(["posts"]);
      
      // Optimistic update: hapus post dari cache SEMUA query keys
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((post: any) => post.id !== parseInt(id as string))
          }))
        };
      });
      
      return { previousPosts };
    },
    onSuccess: async () => {
      // Tutup modal dan redirect SETELAH API berhasil
      setmodalOpen(false);
      
      // Toast dan redirect bersamaan
      toast.success("Postingan berhasil dihapus");
      router.back();
      
      // Background sync
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err, variables, context: any) => {
      // Rollback jika error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setmodalOpen(false);
      toast.error("Gagal menghapus postingan");
    },
  });

  /* ---------------- COMMENT POST ---------------- */
  const [isSending, setIsSending] = useState(false);
  
  const { mutate: commentPost } = useMutation({
    mutationFn: async (commentText: string) => {
      const res = await API.post(`/post/${id}/comment`, { comment: commentText });
      if (res.status === 200) return res.data;
      throw new Error("Failed to post comment");
    },
    onMutate: () => {
      // Show sending state briefly
      setIsSending(true);
    },
    onSuccess: () => {
      toast.success("Berhasil post Komentar");
      setComment("");
      // Silently sync in background
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
    onError: () => {
      toast.error("Gagal mengirim komentar");
    },
    onSettled: () => {
      setIsSending(false);
    },
  });

  if (error) return error.message;

  const youtubeId = post ? getYoutubeId(post.youtube_url) : null;

  const openImageModal = (imageSrc: string) => {
    // Prioritaskan full_image jika ada, otherwise pakai imageSrc dari images
    const modalSrc = post.full_image ? getImage(post.full_image) : imageSrc;
    setSelectedImage(modalSrc);
    setShowImageModal(true);
  };

  return (
    <>
      {/* DELETE MODAL */}
      <Modal show={modalOpen} onClose={() => setmodalOpen(false)}>
        <img src="/img/trash.svg" className="size-44" alt="" />
        <p>
          Apakah anda yakin ingin menghapus <br /> postingan ini?
        </p>
        <div className="flex justify-center pt-8 gap-3">
          <button
            onClick={() => deletePost()}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md cursor-pointer bg-[#009788] text-white hover:bg-[#007d6f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {isDeleting ? "Menghapus..." : "Hapus Postingan"}
          </button>
          <button
            onClick={() => setmodalOpen(false)}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md border border-slate-300 cursor-pointer hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
        </div>
      </Modal>

      {/* FULL IMAGE MODAL */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-4 -right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              ×
            </button>
            <div className="relative w-[90vw] h-[90vh]">
              <Image
                src={selectedImage}
                alt="Full Image"
                fill
                className="object-contain"
                onError={() => setShowImageModal(false)} // Close on error
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="pt-[4.1rem] pb-20">
        <TopBar withBackButton>Detail Post</TopBar>
        {/* COMMENT BAR */}
        <form
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim() && !isSending) {
              commentPost(comment);
            }
          }}
          className="fixed bg-white bottom-0 max-w-[478.5px] py-3 w-full px-4 border-t border-slate-300 flex gap-4"
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            type="text"
            className="px-4 py-2 border border-dashed border-slate-400 rounded-full text-sm flex-grow"
            placeholder="Tulis Komentar"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!comment.trim() || isSending}
            className={clsx(
              "ms-auto p-2 rounded-full transition-all active:scale-90",
              !comment.trim() || isSending ? "bg-slate-300" : "bg-[#009788]"
            )}
          >
            <PaperAirplaneIcon className={clsx(
              "size-5",
              !comment.trim() || isSending ? "text-slate-500" : "text-white"
            )} />
          </button>
        </form>
        {/* LOADING */}
        {isLoading ? (
          <div className="flex mt-40 justify-center items-center">
            <Loader className="size-12" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* HEADER */}
            <div className="flex gap-4 px-4 py-5 items-center">
              <Image
                src={post.author_id.avatar ? getImage(post.author_id.avatar) : "/img/profileplacholder.png"}
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
                alt={post.author_id.name}
              />
              <div>
                <h1 className="text-sm font-medium">{post.author_id.name}</h1>
                <p className="text-neutral-600 text-xs mt-0.5">
                  {post.author_id.profile.school_place}
                </p>
              </div>
              {post.author_id.id === user.id && (
                <div className="ml-auto flex items-center gap-2">

                  {/* BUTTON EDIT */}
                  <div
                    onClick={() => router.push(`/social-media/post/edit/${post.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="bg-blue-600 text-sm px-3 py-2 text-white border border-slate-200 rounded-md">
                      Edit
                    </div>
                  </div>

                  {/* BUTTON DELETE */}
                  <div
                    onClick={() => setmodalOpen(true)}
                    className="cursor-pointer"
                  >
                    <div className="bg-red-600 text-sm px-3 py-2 text-white border border-slate-200 rounded-md">
                      Hapus
                    </div>
                  </div>

                </div>
              )}

            </div>
            {/* BODY TEXT */}
            <div
              className="px-4 py-3 text-slate-700 text-[0.9rem]"
              dangerouslySetInnerHTML={createMarkup(post.body)}
            ></div>
            <span className="text-sm text-slate-500 px-4">
              {moment(post.created_at).locale("id").fromNow()}
            </span>
            {/* ================= MEDIA AREA ================= */}
            <div className="w-full mt-4">
              {/* CASE 1 — IMAGES */}
              {post.images.length > 0 && (
                <Swiper
                  className="mySwiper max-h-[16rem]"
                  pagination={{ dynamicBullets: true }}
                  modules={[Pagination]}
                >
                  {post.images.map((image: any, i: number) => (
                    <SwiperSlide
                      key={i}
                      className="bg-black max-h-[16rem] overflow-hidden"
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={getImage(image.src)}
                          alt="Post Image"
                          fill
                          className="object-cover mx-auto cursor-pointer"
                          onClick={() => openImageModal(getImage(image.src))}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              {/* CASE 2 — YOUTUBE EMBED */}
              {post.images.length === 0 && youtubeId && (
                <div className="mx-4 mt-2 rounded-lg overflow-hidden border border-slate-300 relative" style={{ height: "260px" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    className="w-full h-full"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs px-3 py-2 flex items-center gap-2 pointer-events-none">
                    <div className="bg-red-600 rounded-sm px-1.5 py-0.5 text-[10px] font-bold">
                      YouTube
                    </div>
                    <span className="truncate">{post.youtube_url}</span>
                  </div>
                </div>
              )}
              {/* CASE 3 — TEXT ONLY */}
              {post.images.length === 0 && !youtubeId && (
                <div
                  style={{ backgroundImage: "url(/img/post.png)" }}
                  className="flex h-[17rem] justify-center items-center bg-cover bg-center text-white text-xl font-medium px-8 text-center"
                >
                  {trimText(post.body, 125)}
                </div>
              )}
            </div>
            {/* ================= DOCUMENT BADGE ================= */}
            {post.document && (
              <a
                href={getImage(post.document)}
                target="_blank"
                className="mx-4 mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-full text-xs text-blue-800 font-medium w-fit shadow-sm"
              >
                <span className="text-lg">📄</span>
                <span className="truncate max-w-[180px]">
                  {extractFileName(post.document)}
                </span>
              </a>
            )}
            {/* ================= COMMENTS ================= */}
            {/* ================= COMMENTS ================= */}
            <div className="px-4 py-4 mt-4">
              <CommentTree comments={post.comments} postId={post.id} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}