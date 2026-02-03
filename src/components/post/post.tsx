import { Post as PostType } from "@/types/post/post";
import API from "@/utils/api/config";
import {
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
import Loader from "../loader/loader";
import { getImage } from "@/utils/function/function";
import { useAuth } from "@/utils/context/auth_context";
import { TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import Modal from "@/components/modal/modal";
/* ---------------- TEXT UTILS ---------------- */
function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}
function createMarkup(text: string) {
  const replacedText = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$&" class="text-blue-500" target="_blank" rel="noopener noreferrer">$&</a>',
  );
  return { __html: replacedText };
}
/* ---------------- YOUTUBE UTIL ---------------- */
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
/* ---------------- FILE NAME UTIL ---------------- */
function extractFileName(path: string) {
  if (!path) return "";
  return path.split("/").pop() || path;
}
/* ---------------- MAIN COMPONENT ---------------- */
import UserAvatar from "../ui/user-avatar";

/* ---------------- MAIN COMPONENT ---------------- */
export default function Post({
  post,
  onImageClick,
}: {
  post: PostType;
  onImageClick?: () => void;
}) {
  const queryClient = useQueryClient();
  const { auth: user } = useAuth();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [likeConfirmed, setLikeConfirmed] = useState(false);
  const youtubeId = getYoutubeId(post.youtube_url || "");
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLikeUnlikePost = async (liked: boolean) => {
    return API[liked ? "post" : "delete"](`post/${post.id}/like`);
  };

  const { mutate: likeUnlikePost } = useMutation<any, Error, boolean, { prevLiked: boolean; prevCount: number }>({
    mutationFn: handleLikeUnlikePost,
    onMutate: async (nextLiked) => {
      // Save previous state for rollback
      return { prevLiked: isLiked, prevCount: likesCount };
    },
    onError: (_, __, context) => {
      // rollback kalau gagal
      if (context) {
        setIsLiked(context.prevLiked);
        setLikesCount(context.prevCount);
      }
    },
  });

  const handleLikeClick = () => {
    const nextLiked = !isLiked;

    // 🔥 UI LANGSUNG BERUBAH
    setIsLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : c - 1));

    // 🔄 Backend jalan di belakang
    likeUnlikePost(nextLiked);
  };

  // Delete mutation
  const handleDeletePost = async () => {
    if (!user || post.author_id !== user.id) return;
    
    // Optimistic update: langsung tutup modal dan hapus dari UI
    setDeleteModalOpen(false);
    toast.info("Menghapus postingan...");
    
    try {
      const res = await API.delete(`/post/${post.id}`);
      if (res.status === 200) {
        toast.success("Postingan berhasil dihapus");
        // Background sync
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        return res.data.message;
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Gagal menghapus postingan. Silakan coba lagi.");
    }
  };
  const openImageModal = (imageSrc: string) => {
    // Prioritaskan full_image jika ada, otherwise pakai imageSrc dari images
    const modalSrc = post.full_image ? getImage(post.full_image) : imageSrc;
    setSelectedImage(modalSrc);
    setShowImageModal(true);
  };
  const handleDeleteClick = () => {
    if (user && post.author_id === user.id) {
      setDeleteModalOpen(true);
    }
  };
  const confirmDelete = () => {
    handleDeletePost();
  };
  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };
  return (
    <div className="relative flex flex-col pb-6 max-w-[480px]">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex px-4 py-4 gap-3 items-start">
        <UserAvatar
          src={post.author.avatar}
          name={post.author.name}
          className="rounded-full size-10 min-w-10 min-h-10 border border-slate-200 text-sm"
        />
        <div className="-mt-0.5">
          <Link
            href={"/profile/" + post.author_id}
            className="text-sm font-medium"
          >
            {post.author.name}
          </Link>
          <p className="text-[0.85rem] text-slate-600">
            {post.author.role.display_name} {post.author.profile.school_place}
          </p>
          <span className="text-[0.8rem] mt-1.5 text-slate-500">
            {moment(post.created_at).locale("id").fromNow()}
          </span>
        </div>
        {/* EDIT & DELETE BUTTONS */}
        {user && post.author_id === user.id && (
          <div className="ml-auto flex items-center gap-2">
            {/* EDIT BUTTON */}
            <Link
              href={`/social-media/post/edit/${post.id}`}
              className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
              title="Edit postingan"
            >
              <PencilIcon className="size-4" />
            </Link>
            {/* DELETE BUTTON */}
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
              title="Hapus postingan"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
      {/* ---------------- MEDIA AREA ---------------- */}
      <div className="w-full overflow-hidden">
        {/* GAMBAR */}
        {post.images.length > 0 ? (
          <Swiper
            className="mySwiper h-[23rem]"
            pagination={{ dynamicBullets: true }}
            modules={[Pagination]}
          >
            {post.images.map((image, i) => (
              <SwiperSlide key={i} className="bg-black">
                <img
                  src={getImage(image.src)}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => {
                    const imgSrc = getImage(image.src);
                    openImageModal(imgSrc);
                    onImageClick && onImageClick();
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : null}
        {/* YOUTUBE EMBED */}
        {post.images.length === 0 && youtubeId && (
          <div
            className="mx-4 mt-2 rounded-lg overflow-hidden border border-slate-300 relative"
            style={{ height: "270px" }}
          >
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
        {/* TEKS ONLY */}
        {post.images.length === 0 && !youtubeId && (
          <div
            style={{ backgroundImage: "url(/img/post.png)" }}
            className="flex justify-center items-center size-full bg-cover bg-center px-8 text-white text-xl font-medium text-center h-[23rem]"
          >
            {trimText(post.body, 125)}
          </div>
        )}
      </div>
      {/* ---------------- DOCUMENT PREVIEW ---------------- */}
      {post.document && (
        <div className="mx-4 mt-3">
          <p className="text-sm font-medium text-slate-700 mb-2">
            📄 Dokumen Terlampir
          </p>
          <a
            href={getImage(post.document)}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
                <svg
                  className="size-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate group-hover:text-blue-700 transition">
                  {extractFileName(post.document)}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Klik untuk membuka dokumen
                </p>
              </div>
              <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
      )}
      {/* ---------------- LIKE / COMMENT ---------------- */}
      <div className="flex flex-col px-4">
        <div className="flex items-center justify-between pb-2 pt-4 px-1">
          {/* LEFT: Like & Comment */}
          <div className="flex gap-4 items-center *:cursor-pointer">
            <span onClick={handleLikeClick}>
              <div className="flex gap-1.5 items-center">
                {isLiked ? (
                  <HeartSolidIcon className="fill-red-700 size-7" />
                ) : (
                  <HeartIcon className="text-slate-500 size-7" />
                )}
              </div>
            </span>

            <Link
              href={"/social-media/post/" + post.id}
              className="flex items-center gap-1.5"
            >
              <ChatBubbleOvalLeftIcon className="size-6 text-slate-500" />
            </Link>
          </div>

          {/* RIGHT: PRODUCT BADGE */}
          {post.product_id && (
            <Link
              href={`/marketplace/${post.product_id}`}
              className="inline-flex items-center gap-1.5 px-2 py-1 
                         bg-green-50 border border-green-300 rounded-full
                         text-[14px] text-green-800 font-large shadow-sm hover:bg-green-100"
            >
              <span>🛒</span>
              <span>Lihat Produk</span>
            </Link>
          )}
        </div>

        <span className="text-sm font-medium">{likesCount} Suka</span>

        {/* ---------------- BODY TEXT ---------------- */}
        <div className="inline items-center text-sm mt-2 text-slate-800">
          <span className="font-semibold pr-2">{post.author.name}</span>
          <div
            dangerouslySetInnerHTML={createMarkup(trimText(post.body, 125))}
            className="inline text-slate-600"
          ></div>
          {post.body.length > 125 && (
            <Link
              href={"/social-media/post/" + post.id}
              className="text-slate-500 text-sm ml-2"
            >
              Selengkapnya
            </Link>
          )}
        </div>
        {post.comments_count > 0 && (
          <Link
            className="text-sm text-neutral-700 mt-2"
            href={"/social-media/post/" + post.id}
          >
            Lihat semua {post.comments_count} komentar
          </Link>
        )}
      </div>
      {/* ---------------- MODAL FULL IMAGE ---------------- */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white/80 rounded-full p-2 text-gray-700 hover:bg-white shadow-lg"
          >
            <XMarkIcon className="size-6" />
          </button>

          <img
            src={selectedImage}
            alt="Full Image"
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
            onError={() => setShowImageModal(false)}
          />
        </div>
      )}

      {/* ---------------- DELETE MODAL ---------------- */}
      <Modal show={deleteModalOpen} onClose={cancelDelete}>
        <div className="text-center p-6">
          <TrashIcon className="size-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
