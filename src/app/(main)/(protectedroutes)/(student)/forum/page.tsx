"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import {
  ChevronLeftIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  PlusIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { MOCK_FORUM_POSTS } from "@/constants/student-data";
import Link from "next/link";
import clsx from "clsx";

export default function ForumPage() {
  const { auth } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [videoUrl, setVideoUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [likeLoading, setLikeLoading] = useState<number | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeYoutubeEmbed = (url?: string) => {
    if (!url) return null;

    if (url.includes("youtube.com/embed/")) return url;

    if (url.includes("youtube.com/watch")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  };

  useEffect(() => {
    const fetchGlobalDiscussions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch diskusi global");

        const json = await res.json();
        setPosts(json.data || []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalDiscussions();
  }, []);

  const handleLike = async (postId: number) => {
    if (!auth) return;

    // 1. OPTIMISTIC UPDATE
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        const alreadyLiked = p.likes.some((l: any) => l.user_id === auth.id);

        return {
          ...p,
          likes: alreadyLiked
            ? p.likes.filter((l: any) => l.user_id !== auth.id)
            : [...p.likes, { user_id: auth.id }],
        };
      })
    );

    // 2. API CALL (BACKGROUND)
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Like gagal");
    } catch (err) {
      console.error(err);

      // 3. ROLLBACK JIKA ERROR
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;

          const alreadyLiked = p.likes.some((l: any) => l.user_id === auth.id);

          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((l: any) => l.user_id !== auth.id)
              : [...p.likes, { user_id: auth.id }],
          };
        })
      );
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    setSelectedImages((prev) => [...prev, ...fileArray]);

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setImagePreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const handleAddPost = async () => {
    if (!newPost.trim() && selectedImages.length === 0 && !videoUrl) return;

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      formData.append("content", newPost);

      // GLOBAL → JANGAN KIRIM class_id
      if (videoUrl) {
        formData.append("youtube_url", videoUrl);
      }

      if (selectedImages.length > 0) {
        formData.append("image", selectedImages[0]);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Gagal posting diskusi");

      const json = await res.json();

      // prepend ke list
      setPosts((prev) => [
        {
          ...json.data,
          likes: [],
          replies: [],
        },
        ...prev,
      ]);

      // reset
      setNewPost("");
      setSelectedImages([]);
      setVideoUrl("");
      setShowAddModal(false);
    } catch (err) {
      alert("Gagal mengirim diskusi");
    }
  };

  const getUserRoleLabel = (user: any) => {
    if (user?.role_id == 8) return "Siswa";
    return "Guru";
  };

  const getUserRoleStyle = (user: any) => {
    return user?.role_id == 8
      ? "bg-teal-50 text-teal-600"
      : "bg-indigo-50 text-indigo-600";
  };

  const isPostLiked = (post: any) => {
    if (!auth) return false;
    return post.likes?.some((l: any) => l.user_id === auth.id);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/beranda" className="p-1">
            <ChevronLeftIcon className="size-6 text-white" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Forum Publik</h1>
            <p className="text-xs text-teal-100">
              Diskusi untuk seluruh sekolah
            </p>
          </div>
        </div>
      </div>

      {/* Posts List with Media */}
      <div className="divide-y divide-slate-200">
        {loading && (
          <p className="p-4 text-sm text-slate-400">Memuat diskusi...</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="p-4 text-sm text-slate-400">Belum ada diskusi</p>
        )}

        {posts.map((post) => {
          const liked = isPostLiked(post);
          return (
            <div
              key={post.id}
              className="p-4 bg-white hover:bg-slate-50 transition"
            >
              <div className="flex gap-3">
                <img
                  src="https://avatar.iran.liara.run/public"
                  alt={post.user.name}
                  className="size-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {/* Author Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 text-sm">
                        {post.user.name}
                      </span>
                      <span
                        className={clsx(
                          "text-xs ml-2 px-2 py-0.5 rounded-full font-medium",
                          getUserRoleStyle(post.user)
                        )}
                      >
                        {getUserRoleLabel(post.user)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(post.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Images Grid */}
                  {post.image_url && (
                    <div className="mt-3">
                      <img
                        src={post.image_url}
                        alt="Diskusi"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => window.open(post.image_url, "_blank")}
                      />
                    </div>
                  )}

                  {/* Video Embed */}
                  {normalizeYoutubeEmbed(post.youtube_url) && (
                    <div className="mt-3">
                      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={normalizeYoutubeEmbed(post.youtube_url)!}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={likeLoading === post.id}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 disabled:opacity-50"
                    >
                      {liked ? (
                        <HeartSolidIcon className="size-5 text-red-500" />
                      ) : (
                        <HeartIcon className="size-5" />
                      )}
                      <span className={liked ? "text-red-500" : ""}>
                        {post.likes.length}
                      </span>
                    </button>
                    <Link href={`/forum/${post.id}`}>
                      <button className="flex items-center gap-1 text-sm text-slate-500">
                        <ChatBubbleLeftIcon className="size-5" />
                        <span>{post.replies.length}</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      <div className="p-8 text-center">
        <p className="text-sm text-slate-400">Tidak ada postingan lagi</p>
      </div>

      {/* Bottom Navigation Bar with Plus Button */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-end justify-around h-16 px-2">
          {/* Home */}
          <Link
            href="/beranda"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition"
          >
            <HomeIcon className="size-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-400">
              Beranda
            </span>
          </Link>

          {/* Center Plus Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center -mt-6 px-3"
          >
            <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <PlusIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1">
              Posting
            </span>
          </button>

          {/* Forum (Active) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition">
            <ChatBubbleLeftRightIcon className="size-5 text-teal-600" />
            <span className="text-[10px] font-medium text-teal-600">Forum</span>
          </div>
        </div>
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl p-4 pb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Buat Postingan
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Bagikan sesuatu dengan teman-temanmu..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-teal-500"
              rows={4}
              autoFocus
            />

            {/* Media Preview */}
            {(selectedImages.length > 0 || videoUrl) && (
              <div className="mt-3 space-y-2">
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative">
                        <img
                          src={src}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          onClick={() => {
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setImagePreviews((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoUrl && (
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                    <span className="text-xs text-slate-600 truncate flex-1">
                      {videoUrl}
                    </span>
                    <button
                      onClick={() => setVideoUrl("")}
                      className="text-red-500 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Media Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg cursor-pointer transition">
                <PhotoIcon className="w-5 h-5" />
                Foto
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                onClick={() => {
                  const url = prompt("Masukkan URL video YouTube:");
                  if (url) {
                    let embedUrl = url;
                    if (url.includes("youtube.com/watch")) {
                      const videoId = url.split("v=")[1]?.split("&")[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (url.includes("youtu.be/")) {
                      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                    setVideoUrl(embedUrl);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition"
              >
                <VideoCameraIcon className="w-5 h-5" />
                Video
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleAddPost}
                disabled={
                  !newPost.trim() && selectedImages.length === 0 && !videoUrl
                }
                className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Posting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
