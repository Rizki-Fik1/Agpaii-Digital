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
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6 sticky top-0 z-20 shadow-md">
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
            <div className="flex justify-center p-8">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <ChatBubbleLeftRightIcon className="size-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">Belum ada diskusi</p>
            </div>
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
                    src={
                      post.user.avatar?.startsWith("http")
                        ? post.user.avatar
                        : `http://file.agpaiidigital.org/${post.user.avatar}`
                    }
                    alt={post.user.name}
                    className="size-12 rounded-full flex-shrink-0 object-cover"
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
                            "text-[10px] ml-2 px-2 py-0.5 rounded-full font-medium inline-block relative -top-0.5",
                            getUserRoleStyle(post.user)
                          )}
                        >
                          {getUserRoleLabel(post.user)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-slate-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Images Grid */}
                    {post.image_url && (
                      <div className="mt-3">
                        <img
                          src={post.image_url}
                          alt="Diskusi"
                          className="w-full h-48 object-cover rounded-xl border border-slate-100 cursor-pointer"
                          onClick={() => window.open(post.image_url, "_blank")}
                        />
                      </div>
                    )}

                    {/* Video Embed */}
                    {normalizeYoutubeEmbed(post.youtube_url) && (
                      <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-sm border border-slate-200">
                        <iframe
                          src={normalizeYoutubeEmbed(post.youtube_url)!}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        disabled={likeLoading === post.id}
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {liked ? (
                          <HeartSolidIcon className="size-5 text-red-500" />
                        ) : (
                          <HeartIcon className="size-5" />
                        )}
                        <span className={liked ? "text-red-500 font-medium" : "font-medium"}>
                          {post.likes.length}
                        </span>
                      </button>
                      <Link href={`/forum/${post.id}`}>
                        <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors">
                          <ChatBubbleLeftIcon className="size-5" />
                          <span className="font-medium">{post.replies.length}</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {posts.length > 0 && (
          <div className="p-8 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">Tidak ada postingan lagi</p>
          </div>
        )}

        {/* Bottom Navigation Bar with Plus Button */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-end justify-around h-16 px-2 relative">
            <Link
              href="/beranda"
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 hover:bg-slate-50 transition-colors rounded-xl"
            >
              <HomeIcon className="size-5 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400">
                Beranda
              </span>
            </Link>

            {/* Center Plus Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center -mt-8 px-3 relative z-10 group"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(20,184,166,0.4)] border-4 border-white group-hover:scale-105 transition-transform duration-300">
                <PlusIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1">
                Posting
              </span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl">
              <ChatBubbleLeftRightIcon className="size-5 text-teal-600" />
              <span className="text-[10px] font-bold text-teal-600">Forum</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block w-full min-h-screen bg-slate-50 pt-0">
         <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Forum Diskusi</h1>
                <p className="text-slate-500 mt-1">Diskusikan topik belajar, tanya jawab, atau berbagi informasi dengan teman dan guru.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               
               {/* Main Feed */}
               <div className="lg:col-span-3 space-y-6">
                  
                  {/* Create Post Card Desktop */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex gap-4 items-start">
                     <img
                        src={(auth?.avatar && `http://file.agpaiidigital.org/${auth.avatar}`) || "/img/profileplacholder.png"}
                        alt="Avatar"
                        className="size-12 rounded-full object-cover border border-slate-100"
                     />
                     <div className="flex-1">
                        <button 
                           onClick={() => setShowAddModal(true)}
                           className="w-full text-left bg-slate-100 hover:bg-slate-200 text-slate-500 p-3.5 rounded-xl text-sm transition-colors border border-transparent hover:border-slate-300"
                        >
                           Bagikan sesuatu dengan anggota sekolah...
                        </button>
                        <div className="flex items-center gap-3 mt-3 ml-1">
                           <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors">
                              <PhotoIcon className="size-5 text-emerald-500" />
                              Foto
                           </button>
                           <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors">
                              <VideoCameraIcon className="size-5 text-rose-500" />
                              Video
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Feed Items */}
                  {loading && (
                    <div className="flex justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                       <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                    </div>
                  )}

                  {!loading && posts.length === 0 && (
                    <div className="p-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl mx-auto mb-5 shadow-inner">
                        <ChatBubbleLeftRightIcon className="size-10 text-slate-300" />
                      </div>
                      <p className="text-slate-800 font-bold text-lg mb-1">Belum ada diskusi</p>
                      <p className="text-sm">Jadilah yang pertama memulai topik baru!</p>
                    </div>
                  )}

                  <div className="space-y-6 pb-20">
                     {posts.map((post) => {
                        const liked = isPostLiked(post);
                        return (
                           <div
                             key={post.id}
                             className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                           >
                              <div className="p-5">
                                 <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-3 items-center">
                                       <img
                                          src={
                                            post.user.avatar?.startsWith("http")
                                              ? post.user.avatar
                                              : `http://file.agpaiidigital.org/${post.user.avatar}`
                                          }
                                          alt={post.user.name}
                                          className="size-12 rounded-full flex-shrink-0 object-cover border border-slate-100"
                                       />
                                       <div>
                                          <div className="flex items-center gap-2">
                                             <span className="font-bold text-slate-800 text-sm">
                                               {post.user.name}
                                             </span>
                                             <span
                                                className={clsx(
                                                  "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                                                  getUserRoleStyle(post.user)
                                                )}
                                             >
                                               {getUserRoleLabel(post.user)}
                                             </span>
                                          </div>
                                          <span className="text-xs text-slate-400 font-medium">
                                            {new Date(post.created_at).toLocaleString("id-ID")}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Content */}
                                 <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                                   {post.content}
                                 </p>

                                 {/* Grid Images */}
                                 {post.image_url && (
                                   <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
                                     <img
                                       src={post.image_url}
                                       alt="Diskusi"
                                       className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                       onClick={() => window.open(post.image_url, "_blank")}
                                     />
                                   </div>
                                 )}

                                 {/* Embed Video */}
                                 {normalizeYoutubeEmbed(post.youtube_url) && (
                                   <div className="mt-4 relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-inner border border-slate-200">
                                     <iframe
                                       src={normalizeYoutubeEmbed(post.youtube_url)!}
                                       className="absolute inset-0 w-full h-full"
                                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                       allowFullScreen
                                     />
                                   </div>
                                 )}
                              </div>

                              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-8 bg-slate-50/50">
                                 <button
                                   onClick={() => handleLike(post.id)}
                                   disabled={likeLoading === post.id}
                                   className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 disabled:opacity-50 transition-colors py-1 group"
                                 >
                                   <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors">
                                      {liked ? (
                                        <HeartSolidIcon className="size-5 text-red-500 drop-shadow-sm" />
                                      ) : (
                                        <HeartIcon className="size-5" />
                                      )}
                                   </div>
                                   <span className={clsx("font-semibold", liked ? "text-red-500" : "")}>
                                     {post.likes.length} Suka
                                   </span>
                                 </button>
                                 <Link href={`/forum/${post.id}`}>
                                   <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors py-1 group">
                                     <div className="p-1.5 rounded-full group-hover:bg-teal-50 transition-colors">
                                        <ChatBubbleLeftIcon className="size-5" />
                                     </div>
                                     <span className="font-semibold">{post.replies.length} Komentar</span>
                                   </button>
                                 </Link>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Right Sidebar Desktop */}
               <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-[6.5rem] self-start">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="size-5 text-teal-600" />
                        Info Forum
                     </h3>
                     <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        Jaga sopan santun dan etika dalam berdiskusi. Hormati pendapat teman maupun guru yang memberikan informasi.
                     </p>
                     <div className="space-y-3 mt-6">
                        <div className="flex items-center gap-3">
                           <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><PlusIcon className="size-4" /></div>
                           <p className="text-xs font-semibold text-slate-700">Mulai diskusi baru</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><HeartSolidIcon className="size-4" /></div>
                           <p className="text-xs font-semibold text-slate-700">Apresiasi jawaban terbaik</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Add Post Modal (Shared) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-[480px] md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-slate-100 bg-white md:rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-800">
                Buat Postingan Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto">
               <textarea
                 value={newPost}
                 onChange={(e) => setNewPost(e.target.value)}
                 placeholder="Bagikan sesuatu atau ajukan pertanyaan di sini..."
                 className="w-full border border-slate-200 rounded-xl p-4 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50 transition-all shadow-inner min-h-[120px]"
                 rows={4}
                 autoFocus
               />

               {/* Media Preview */}
               {(selectedImages.length > 0 || videoUrl) && (
                 <div className="mt-4 space-y-3">
                   {selectedImages.length > 0 && (
                     <div className="flex gap-3 flex-wrap">
                       {imagePreviews.map((src, idx) => (
                         <div key={src} className="relative group shadow-sm rounded-xl">
                           <img
                             src={src}
                             alt="Preview"
                             className="w-20 h-20 object-cover rounded-xl border border-slate-200"
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
                             className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform"
                           >
                             <XMarkIcon className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                   {videoUrl && (
                     <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-xl shadow-sm">
                       <VideoCameraIcon className="size-5 text-red-500 flex-shrink-0" />
                       <span className="text-sm text-red-800 truncate flex-1 font-medium">
                         {videoUrl}
                       </span>
                       <button
                         onClick={() => setVideoUrl("")}
                         className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                       >
                         Hapus
                       </button>
                     </div>
                   )}
                 </div>
               )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 md:px-6 md:py-4 border-t border-slate-100 bg-slate-50 md:rounded-b-2xl flex items-center justify-between gap-2 mt-auto">
               <div className="flex items-center gap-2">
                 <label className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-emerald-600 shadow-sm rounded-xl cursor-pointer transition-all">
                   <PhotoIcon className="w-5 h-5" />
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
                   className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-rose-500 shadow-sm rounded-xl transition-all"
                 >
                   <VideoCameraIcon className="w-5 h-5" />
                 </button>
               </div>
               
               <button
                 onClick={handleAddPost}
                 disabled={
                   !newPost.trim() && selectedImages.length === 0 && !videoUrl
                 }
                 className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
               >
                 Posting
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
