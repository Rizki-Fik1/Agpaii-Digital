"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeftIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useAuth } from "@/utils/context/auth_context";

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { auth } = useAuth();

  const [discussion, setDiscussion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyPreview, setReplyPreview] = useState<string | null>(null);
  const [replyVideo, setReplyVideo] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const normalizeYoutubeEmbed = (url?: string) => {
    if (!url) return null;
    if (url.includes("embed")) return url;

    if (url.includes("watch")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  };

  // ================= FETCH DETAIL =================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal ambil detail");

        const json = await res.json();
        setDiscussion(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // ================= LIKE POST =================
  const handleLike = async () => {
    if (!auth || !discussion) return;

    const liked = discussion.likes.some((l: any) => l.user_id === auth.id);

    // optimistic
    setDiscussion((prev: any) => ({
      ...prev,
      likes: liked
        ? prev.likes.filter((l: any) => l.user_id !== auth.id)
        : [...prev.likes, { user_id: auth.id }],
    }));

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions/${id}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  // ================= SEND REPLY =================
  const handleReply = async () => {
    if (!replyText.trim() && !replyImage && !replyVideo) return;

    const formData = new FormData();
    formData.append("content", replyText);
    if (replyImage) formData.append("image", replyImage);
    if (replyVideo) formData.append("youtube_url", replyVideo);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions/${id}/reply`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!res.ok) return alert("Gagal mengirim balasan");

    const json = await res.json();

    setDiscussion((prev: any) => ({
      ...prev,
      replies: [...prev.replies, json.data],
    }));

    setReplyText("");
    setReplyImage(null);
    setReplyPreview(null);
    setReplyVideo("");
  };

  if (loading || !discussion) {
    return <p className="p-4 text-sm text-slate-400">Memuat...</p>;
  }

  const isLiked = discussion.likes.some((l: any) => l.user_id === auth?.id);

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-teal-600 text-white p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="font-semibold">Detail Diskusi</h1>
        </div>
      </div>

      {/* POST */}
      <div className="p-4 border-b">
        <p className="font-semibold text-sm">{discussion.user.name}</p>
        <p className="text-sm mt-2">{discussion.content}</p>

        {discussion.image_url && (
          <img src={discussion.image_url} className="mt-3 rounded-lg" />
        )}

        {normalizeYoutubeEmbed(discussion.youtube_url) && (
          <iframe
            className="mt-3 w-full aspect-video rounded-lg"
            src={normalizeYoutubeEmbed(discussion.youtube_url)!}
            allowFullScreen
          />
        )}

        <div className="flex gap-6 mt-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-sm"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            {discussion.likes.length}
          </button>

          <span className="flex items-center gap-1 text-sm">
            <ChatBubbleLeftIcon className="w-5 h-5" />
            {discussion.replies.length}
          </span>
        </div>
      </div>

      {/* REPLIES */}
      <div className="divide-y">
        {discussion.replies.map((r: any) => (
          <div key={r.id} className="p-4">
            <p className="text-xs font-semibold">{r.user.name}</p>
            <p className="text-sm">{r.content}</p>
          </div>
        ))}
      </div>

      {/* REPLY FORM */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 max-w-[480px] mx-auto">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Tulis balasan..."
          className="w-full border rounded-lg p-2 text-sm"
          rows={2}
        />

        <div className="flex items-center gap-2 mt-2">
          {/* <label className="cursor-pointer">
            <PhotoIcon className="w-5 h-5" />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setReplyImage(f);
                setReplyPreview(URL.createObjectURL(f));
              }}
            />
          </label> */}

          {/* <button
            onClick={() => {
              const url = prompt("URL YouTube");
              if (url) setReplyVideo(url);
            }}
          >
            <VideoCameraIcon className="w-5 h-5" />
          </button> */}

          <button
            onClick={handleReply}
            className="ml-auto px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
