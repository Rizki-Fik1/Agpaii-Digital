"use client";
import { Post as PostType } from "@/types/post/post";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import Post from "@/components/post/post";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/utils/context/auth_context";
import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { getImage } from "@/utils/function/function";

export default function SocialMedia() {
  const { ref, inView } = useInView();
  const { auth: user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State untuk search dan modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // searchQuery akan dipakai sebagai parameter query
  const [searchQuery, setSearchQuery] = useState("");
  // State untuk loading saat pencarian
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  // State untuk pending post preview
  const [pendingPost, setPendingPost] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(false);
  
  // State untuk editing post preview
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editError, setEditError] = useState(false);

  // Check for pending post on mount
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPost");
    if (pending) {
      const postData = JSON.parse(pending);
      setPendingPost(postData);
      setUploadProgress(0);
      
      // Tambahkan delay kecil untuk memastikan UI ter-render sebelum progress mulai
      setTimeout(() => {
        const initialProgress = sessionStorage.getItem("uploadProgress");
        if (initialProgress) {
          setUploadProgress(parseInt(initialProgress));
        }
      }, 50);
    }
    
    // Check for editing post
    const editing = sessionStorage.getItem("editingPost");
    if (editing) {
      const editData = JSON.parse(editing);
      setEditingPost(editData);
      setEditProgress(0);
      
      setTimeout(() => {
        const initialProgress = sessionStorage.getItem("editProgress");
        if (initialProgress) {
          setEditProgress(parseInt(initialProgress));
        }
      }, 50);
    }
  }, []);
  
  // Monitor upload progress in real-time using both polling and events
  useEffect(() => {
    if (!pendingPost) return;
    
    const checkProgress = () => {
      const progress = sessionStorage.getItem("uploadProgress");
      if (progress) {
        const progressNum = parseInt(progress);
        if (progressNum !== uploadProgress) {
          setUploadProgress(progressNum);
        }
      }
    };
    
    // Listen to custom upload progress events
    const handleProgressEvent = (event: any) => {
      const progress = event.detail.progress;
      setUploadProgress(progress);
    };
    
    // Listen to upload error events
    const handleErrorEvent = (event: any) => {
      console.error("Upload error:", event.detail?.message);
      setUploadError(true);
    };
    
    window.addEventListener("uploadProgress", handleProgressEvent);
    window.addEventListener("uploadError", handleErrorEvent);
    
    // Check immediately
    checkProgress();
    
    // Poll every 50ms as backup
    const interval = setInterval(checkProgress, 50);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("uploadProgress", handleProgressEvent);
      window.removeEventListener("uploadError", handleErrorEvent);
    };
  }, [pendingPost, uploadProgress]);
  
  // Monitor edit progress in real-time
  useEffect(() => {
    if (!editingPost) return;
    
    const checkProgress = () => {
      const progress = sessionStorage.getItem("editProgress");
      if (progress) {
        const progressNum = parseInt(progress);
        if (progressNum !== editProgress) {
          setEditProgress(progressNum);
        }
      }
    };
    
    const handleProgressEvent = (event: any) => {
      const progress = event.detail.progress;
      setEditProgress(progress);
    };
    
    const handleErrorEvent = (event: any) => {
      console.error("Edit error:", event.detail?.message);
      setEditError(true);
    };
    
    window.addEventListener("editProgress", handleProgressEvent);
    window.addEventListener("editError", handleErrorEvent);
    
    checkProgress();
    
    const interval = setInterval(checkProgress, 50);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("editProgress", handleProgressEvent);
      window.removeEventListener("editError", handleErrorEvent);
    };
  }, [editingPost, editProgress]);

  // Fungsi untuk menghandle submit search
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Set loading sebelum refetch data
    setIsSearchLoading(true);
    // Update query untuk refetch data
    setSearchQuery(searchInput);
  };

  const fetchPosts = async ({ pageParam }: { pageParam: number }) => {
    const searchParam = searchQuery
      ? `&search=${encodeURIComponent(searchQuery)}`
      : "";
    const res = await API.get(`post?page=${pageParam}${searchParam}`);
    if (res.status === 200) {
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

  const { data, isLoading, error, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", searchQuery],
      queryFn: fetchPosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
    });
  
  // Complete progress when data is loaded
  useEffect(() => {
    let hasCompleted = false;
    
    const handlePostingComplete = async () => {
      const postingComplete = sessionStorage.getItem("postingComplete");
      const newPostData = sessionStorage.getItem("newPostData");
      
      if (pendingPost && postingComplete === "true" && !hasCompleted) {
        hasCompleted = true;
        
        // Set progress to 100%
        setUploadProgress(100);
        
        // Optimistic update - tambahkan post baru ke cache langsung
        if (newPostData) {
          try {
            const newPost = JSON.parse(newPostData);
            
            // Update cache dengan post baru di posisi paling atas
            queryClient.setQueryData(["posts", searchQuery], (oldData: any) => {
              if (!oldData) return oldData;
              
              const firstPage = oldData.pages[0];
              if (!firstPage) return oldData;
              
              // Tambahkan post baru di awal array data
              const updatedFirstPage = {
                ...firstPage,
                data: [newPost, ...firstPage.data]
              };
              
              return {
                ...oldData,
                pages: [updatedFirstPage, ...oldData.pages.slice(1)]
              };
            });
          } catch (err) {
            console.error("Failed to parse new post data:", err);
          }
        }
        
        // Invalidate untuk background sync (tanpa menunggu)
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        
        // Clear preview immediately setelah optimistic update
        setTimeout(() => {
          setPendingPost(null);
          setUploadProgress(0);
          sessionStorage.removeItem("pendingPost");
          sessionStorage.removeItem("postingComplete");
          sessionStorage.removeItem("uploadProgress");
          sessionStorage.removeItem("newPostData");
        }, 500);
      }
    };
    
    // Listen to posting complete event
    const eventHandler = () => {
      if (!hasCompleted) {
        handlePostingComplete();
      }
    };
    
    window.addEventListener("postingComplete", eventHandler);
    
    // Check once immediately
    handlePostingComplete();
    
    return () => {
      window.removeEventListener("postingComplete", eventHandler);
    };
  }, [pendingPost, queryClient, searchQuery]);

  // Handle edit post completion (similar to posting complete)
  useEffect(() => {
    if (!editingPost) return;
    
    let hasCompleted = false;
    
    const handleEditComplete = async () => {
      const editComplete = sessionStorage.getItem("editComplete");
      const updatedPostData = sessionStorage.getItem("updatedPostData");
      
      if (editComplete === "true" && !hasCompleted) {
        hasCompleted = true;
        
        setEditProgress(100);
        
        // Optimistic update - update post di cache langsung
        if (updatedPostData) {
          try {
            const updatedPost = JSON.parse(updatedPostData);
            
            // Update cache dengan post yang sudah diedit
            queryClient.setQueryData(["posts", searchQuery], (oldData: any) => {
              if (!oldData) return oldData;
              
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  data: page.data.map((post: any) => 
                    post.id === updatedPost.id ? updatedPost : post
                  )
                }))
              };
            });
          } catch (err) {
            console.error("Failed to parse updated post data:", err);
          }
        }
        
        // Invalidate untuk background sync
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        
        setTimeout(() => {
          setEditingPost(null);
          setEditProgress(0);
          sessionStorage.removeItem("editingPost");
          sessionStorage.removeItem("editComplete");
          sessionStorage.removeItem("editProgress");
          sessionStorage.removeItem("updatedPostData");
        }, 500);
      }
    };
    
    const eventHandler = () => {
      if (!hasCompleted) {
        handleEditComplete();
      }
    };
    
    window.addEventListener("editComplete", eventHandler);
    handleEditComplete();
    
    return () => {
      window.removeEventListener("editComplete", eventHandler);
    };
  }, [editingPost, queryClient, searchQuery]);

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, fetchNextPage]);

  // Monitor loading dari react-query untuk menutup modal saat pencarian selesai
  useEffect(() => {
    if (isSearchLoading && !isLoading) {
      setIsSearchLoading(false);
      setIsSearchOpen(false);
    }
  }, [isLoading, isSearchLoading]);

  if (error) return <div>{error.message}</div>;

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 sm:px-5 py-5 bg-teal-700 flex items-center z-[9999]">
        <button
          onClick={() => router.back()}
          className="flex items-center"
        >
          <svg className="size-6 cursor-pointer text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold ml-3 flex-grow">Diskusi AGPAII</h1>
        <Link href="/social-media/notification" className="p-1">
          <BellIcon className="size-6 text-white" />
        </Link>
      </div>

      {/* User Avatar + Search Bar */}
      <div className="sticky top-[4.5rem] z-40 bg-white border-b border-slate-200 px-4 py-4 mt-2 flex items-center gap-3">
        <img
          src={
            (user?.avatar !== null && getImage(user.avatar)) ||
            "/img/profileplacholder.png"
          }
          alt="user-avatar"
          className="rounded-full size-11 min-w-11 min-h-11 object-cover border border-slate-200"
        />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5 text-slate-500"
        >
          <MagnifyingGlassIcon className="size-5" />
          <span className="text-sm">Cari Diskusi...</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col bg-white pt-8 mt-8">
        {/* Pending Post Preview with Progress Bar */}
        {pendingPost && (
          <div className={`relative flex flex-col pb-6 max-w-[480px] transition-opacity duration-300 ${uploadError ? 'opacity-100' : uploadProgress < 100 ? 'opacity-60' : 'opacity-100'}`}>
            {/* Progress Bar */}
            <div className="h-1 bg-teal-200 overflow-hidden">
              {uploadError ? (
                <div className="h-full w-full bg-red-600" />
              ) : uploadProgress === 0 ? (
                <div className="h-full w-full bg-teal-600 animate-pulse" />
              ) : uploadProgress === 100 ? (
                <div className="h-full w-full bg-green-600 animate-pulse" />
              ) : (
                <div 
                  className="h-full bg-teal-600 transition-all duration-100 ease-linear"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
            </div>
            
            {/* Header */}
            <div className="flex px-4 py-4 gap-3 items-start">
              <img
                src={
                  (user?.avatar !== null && getImage(user.avatar)) ||
                  "/img/profileplacholder.png"
                }
                alt="user-avatar"
                className="rounded-full size-10 min-w-10 min-h-10 object-cover border border-slate-200"
              />
              <div className="-mt-0.5">
                <p className="text-sm font-medium">{user?.name || "Anda"}</p>
                <p className="text-[0.85rem] text-slate-600">
                  {user?.role?.display_name} {user?.profile?.school_place}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[0.8rem] text-slate-500">Baru saja</span>
                  {uploadError ? (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Gagal mengunggah
                    </span>
                  ) : uploadProgress < 100 ? (
                    <span className="text-xs text-teal-600 font-medium">
                      • Mengunggah {uploadProgress}%
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Memuat postingan...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Media Area */}
            <div className="w-full overflow-hidden">
              {/* Image */}
              {pendingPost.image && (
                <div className="h-[23rem] bg-black">
                  <img 
                    src={pendingPost.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* YouTube */}
              {!pendingPost.image && pendingPost.youtubeUrl && (
                <div className="mx-4 mt-2 rounded-lg overflow-hidden border border-slate-300 relative h-[270px]">
                  <div className="bg-slate-200 w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs px-3 py-2 flex items-center gap-2">
                    <div className="bg-red-600 rounded-sm px-1.5 py-0.5 text-[10px] font-bold">YouTube</div>
                    <span className="truncate">{pendingPost.youtubeUrl}</span>
                  </div>
                </div>
              )}
              
              {/* Text Only */}
              {!pendingPost.image && !pendingPost.youtubeUrl && (
                <div
                  style={{ backgroundImage: "url(/img/post.png)" }}
                  className="flex justify-center items-center size-full bg-cover bg-center px-8 text-white text-xl font-medium text-center h-[23rem]"
                >
                  {pendingPost.body.length > 125 ? pendingPost.body.slice(0, 125) + "..." : pendingPost.body}
                </div>
              )}
            </div>

            {/* Document Preview */}
            {pendingPost.document && (
              <div className="mx-4 mt-3">
                <p className="text-sm font-medium text-slate-700 mb-2">📄 Dokumen Terlampir</p>
                <div className="block relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg className="size-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{pendingPost.document}</p>
                      <p className="text-sm text-slate-500 mt-0.5">Sedang mengunggah...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Like / Comment Section */}
            <div className="flex flex-col px-4">
              <div className="flex items-center justify-between pb-2 pt-4 px-1">
                <div className="flex gap-4 items-center opacity-50">
                  <div className="flex gap-1.5 items-center">
                    <svg className="size-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <span className="text-sm font-medium opacity-50">0 Suka</span>

              {/* Body Text */}
              <div className="inline items-center text-sm mt-2 text-slate-800">
                <span className="font-semibold pr-2">{user?.name || "Anda"}</span>
                <span className="text-slate-600">
                  {pendingPost.body.length > 125 ? pendingPost.body.slice(0, 125) + "..." : pendingPost.body}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Editing Post Preview with Progress Bar */}
        {editingPost && (
          <div className={`relative flex flex-col pb-6 max-w-[480px] transition-opacity duration-300 ${editError ? 'opacity-100' : editProgress < 100 ? 'opacity-60' : 'opacity-100'}`}>
            {/* Progress Bar */}
            <div className="h-1 bg-blue-200 overflow-hidden">
              {editError ? (
                <div className="h-full w-full bg-red-600" />
              ) : editProgress === 0 ? (
                <div className="h-full w-full bg-blue-600 animate-pulse" />
              ) : editProgress === 100 ? (
                <div className="h-full w-full bg-green-600 animate-pulse" />
              ) : (
                <div 
                  className="h-full bg-blue-600 transition-all duration-100 ease-linear"
                  style={{ width: `${editProgress}%` }}
                />
              )}
            </div>
            
            {/* Header */}
            <div className="flex px-4 py-4 gap-3 items-start">
              <img
                src={
                  (user?.avatar !== null && getImage(user.avatar)) ||
                  "/img/profileplacholder.png"
                }
                alt="user-avatar"
                className="rounded-full size-10 min-w-10 min-h-10 object-cover border border-slate-200"
              />
              <div className="-mt-0.5">
                <p className="text-sm font-medium">{user?.name || "Anda"}</p>
                <p className="text-[0.85rem] text-slate-600">
                  {user?.role?.display_name} {user?.profile?.school_place}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[0.8rem] text-slate-500">Baru saja</span>
                  {editError ? (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Gagal menerapkan edit
                    </span>
                  ) : editProgress < 100 ? (
                    <span className="text-xs text-blue-600 font-medium">
                      • Menerapkan edit {editProgress}%
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Menerapkan edit...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Media Area */}
            <div className="w-full overflow-hidden">
              {editingPost.image && (
                <div className="h-[23rem] bg-black">
                  <img 
                    src={editingPost.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {!editingPost.image && editingPost.youtubeUrl && (
                <div className="mx-4 mt-2 rounded-lg overflow-hidden border border-slate-300 relative h-[270px]">
                  <div className="bg-slate-200 w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {!editingPost.image && !editingPost.youtubeUrl && (
                <div
                  style={{ backgroundImage: "url(/img/post.png)" }}
                  className="flex justify-center items-center size-full bg-cover bg-center px-8 text-white text-xl font-medium text-center h-[23rem]"
                >
                  {editingPost.body.length > 125 ? editingPost.body.slice(0, 125) + "..." : editingPost.body}
                </div>
              )}
            </div>

            {editingPost.document && (
              <div className="mx-4 mt-3">
                <p className="text-sm font-medium text-slate-700 mb-2">📄 Dokumen Terlampir</p>
                <div className="block relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg className="size-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{editingPost.document}</p>
                      <p className="text-sm text-slate-500 mt-0.5">Sedang mengunggah...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Like / Comment Section */}
            <div className="flex flex-col px-4">
              <div className="flex items-center justify-between pb-2 pt-4 px-1">
                <div className="flex gap-4 items-center opacity-50">
                  <div className="flex gap-1.5 items-center">
                    <svg className="size-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <span className="text-sm font-medium opacity-50">0 Suka</span>

              {/* Body Text */}
              <div className="inline items-center text-sm mt-2 text-slate-800">
                <span className="font-semibold pr-2">{user?.name || "Anda"}</span>
                <span className="text-slate-600">
                  {editingPost.body.length > 125 ? editingPost.body.slice(0, 125) + "..." : editingPost.body}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading &&
          data?.pages.map((page, iPage) => {
            // Default value untuk page?.data jika undefined
            const pageData = page?.data || [];
            // Pisahkan pinned dan non-pinned data
            const pinnedData = pageData.filter(
              (item) => item.is_pinned === true || item.is_pinned === 1,
            );
            const nonPinnedData = pageData.filter(
              (item) => !item.is_pinned && item.is_pinned !== 1,
            );
            // Gabungkan pinnedData di awal
            const sortedData = [...pinnedData, ...nonPinnedData];
            return (
              <div className="flex flex-col" key={iPage}>
                {sortedData.length > 0 ? (
                  sortedData.map((post, i) => (
                    <Post key={i} post={post} />
                  ))
                ) : (
                  <div className="h-screen flex items-center justify-center">
                    <h1 className="text-slate-500">Tidak Ada postingan</h1>
                  </div>
                )}
              </div>
            );
          })}
        <span
          ref={ref}
          className="px-6 py-2 text-sm cursor-pointer text-slate-300 text-center mx-auto"
        >
          {isFetchingNextPage ? "Harap Tunggu..." : ""}
        </span>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Cari Diskusi</h2>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Masukkan kata kunci"
                disabled={isSearchLoading}
                className="w-full border border-slate-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  disabled={isSearchLoading}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSearchLoading}
                  className="px-4 py-2 rounded-md bg-teal-700 text-white flex items-center gap-2 hover:bg-teal-800"
                >
                  {isSearchLoading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  Cari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
