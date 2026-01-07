"use client";
import { useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import {
  ChevronLeftIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { MOCK_FORUM_POSTS } from "@/constants/student-data";
import Link from "next/link";
import clsx from "clsx";

export default function ForumPage() {
  const { auth } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setSelectedImages((prev) => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = "";
  };

  const handleAddPost = () => {
    if (newPost.trim() || selectedImages.length > 0 || videoUrl) {
      setNewPost("");
      setSelectedImages([]);
      setVideoUrl("");
      alert("Postingan berhasil ditambahkan! (Mock)");
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/kelas" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Forum Publik</h1>
            <p className="text-xs text-teal-100">Diskusi untuk seluruh sekolah</p>
          </div>
        </div>
      </div>

      {/* New Post Form with Media Support */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex gap-3">
          <img
            src="https://avatar.iran.liara.run/public"
            alt="You"
            className="size-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Bagikan sesuatu dengan teman-temanmu..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-teal-500"
              rows={3}
            />
            
            {/* Media Preview */}
            {(selectedImages.length > 0 || videoUrl) && (
              <div className="mt-3 space-y-2">
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoUrl && (
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                    <span className="text-xs text-slate-600 truncate flex-1">{videoUrl}</span>
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
            
            {/* Media Buttons & Submit */}
            <div className="flex items-center gap-2 mt-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg cursor-pointer transition">
                <PhotoIcon className="w-4 h-4" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition"
              >
                <VideoCameraIcon className="w-4 h-4" />
                Video
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleAddPost}
                disabled={!newPost.trim() && selectedImages.length === 0 && !videoUrl}
                className="flex items-center gap-2 px-4 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="size-4" />
                Posting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List with Media */}
      <div className="divide-y divide-slate-200">
        {MOCK_FORUM_POSTS.map((post) => {
          const isLiked = likedPosts.includes(post.id);
          return (
            <div key={post.id} className="p-4 bg-white hover:bg-slate-50 transition">
              <div className="flex gap-3">
                <img
                  src="https://avatar.iran.liara.run/public"
                  alt={post.authorName}
                  className="size-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {/* Author Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 text-sm">
                        {post.authorName}
                      </span>
                      <span className="text-xs text-teal-600 ml-2 bg-teal-50 px-2 py-0.5 rounded-full">
                        {post.authorRole}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{post.createdAt}</span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Images Grid */}
                  {post.images && post.images.length > 0 && (
                    <div className={clsx(
                      "mt-3 gap-2",
                      post.images.length === 1 ? "flex" : "grid grid-cols-2"
                    )}>
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open(img, "_blank")}
                        />
                      ))}
                    </div>
                  )}

                  {/* Video Embed */}
                  {post.video && (
                    <div className="mt-3">
                      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-slate-900">
                        <iframe
                          src={post.video}
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
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition"
                    >
                      {isLiked ? (
                        <HeartSolidIcon className="size-5 text-red-500" />
                      ) : (
                        <HeartIcon className="size-5" />
                      )}
                      <span className={isLiked ? "text-red-500" : ""}>
                        {post.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 transition">
                      <ChatBubbleLeftIcon className="size-5" />
                      <span>{post.comments}</span>
                    </button>
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
    </div>
  );
}
