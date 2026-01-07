"use client";
import { useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  MOCK_MATERIALS,
  MOCK_EXERCISES,
  MOCK_DISCUSSIONS,
  MOCK_CLASS_INFO,
} from "@/constants/student-data";
import Link from "next/link";
import { getImage } from "@/utils/function/function";

type TabType = "materi" | "latihan" | "diskusi" | "profile";

export default function KelasPage() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("materi");
  const [newDiscussion, setNewDiscussion] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "materi", label: "Materi", icon: <BookOpenIcon className="size-5" /> },
    { id: "latihan", label: "Latihan", icon: <ClipboardDocumentListIcon className="size-5" /> },
    { id: "diskusi", label: "Diskusi", icon: <ChatBubbleBottomCenterTextIcon className="size-5" /> },
    { id: "profile", label: "Profile", icon: <UserCircleIcon className="size-5" /> },
  ];

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
    // Reset input
    e.target.value = "";
  };

  const handleAddDiscussion = () => {
    if (newDiscussion.trim() || selectedImages.length > 0 || videoUrl) {
      // Mock - just clear the inputs
      setNewDiscussion("");
      setSelectedImages([]);
      setVideoUrl("");
      setShowAddModal(false);
      alert("Diskusi berhasil ditambahkan! (Mock)");
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/beranda" className="p-1">
              <ChevronLeftIcon className="size-6" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{MOCK_CLASS_INFO.name}</h1>
              <p className="text-xs text-teal-100">{MOCK_CLASS_INFO.school}</p>
            </div>
          </div>
          {/* Profile Icon */}
          <button 
            onClick={() => setActiveTab("profile")}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <UserCircleIcon className="size-7" />
          </button>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-sm">
            <span className="font-medium">Guru:</span> {MOCK_CLASS_INFO.teacher.name}
          </p>
          <p className="text-xs text-teal-100 mt-1">
            {MOCK_CLASS_INFO.totalStudents} siswa terdaftar
          </p>
        </div>
      </div>



      {/* Tab Content */}
      <div className="p-4">
        {/* Materi Tab */}
        {activeTab === "materi" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Materi Pembelajaran</h2>
            {MOCK_MATERIALS.map((material) => (
              <div
                key={material.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    "p-2 rounded-lg",
                    material.type === "pdf" ? "bg-red-100" : "bg-blue-100"
                  )}>
                    {material.type === "pdf" ? (
                      <BookOpenIcon className="size-6 text-red-600" />
                    ) : (
                      <svg className="size-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.5 16.5v-9l7 4.5-7 4.5z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-700">{material.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {material.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">{material.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Latihan Tab */}
        {activeTab === "latihan" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Latihan Soal</h2>
            {MOCK_EXERCISES.map((exercise) => (
              <div
                key={exercise.id}
                className={clsx(
                  "bg-white border rounded-xl p-4 shadow-sm",
                  exercise.isCompleted ? "border-green-200" : "border-slate-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-700">{exercise.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{exercise.totalQuestions} soal</span>
                      <span>•</span>
                      <span>{exercise.duration} menit</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Deadline: {exercise.deadline}
                    </p>
                  </div>
                  <div className="text-right">
                    {exercise.isCompleted ? (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Selesai
                        </span>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          {exercise.score}/100
                        </p>
                      </div>
                    ) : (
                      <button className="px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition">
                        Kerjakan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diskusi Tab */}
        {activeTab === "diskusi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">Diskusi Kelas</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Tambah
              </button>
            </div>

            {/* Discussions List with Media */}
            {MOCK_DISCUSSIONS.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src="https://avatar.iran.liara.run/public"
                    alt={discussion.authorName}
                    className="size-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 text-sm">
                        {discussion.authorName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {discussion.createdAt}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{discussion.content}</p>
                    
                    {/* Images Grid */}
                    {discussion.images && discussion.images.length > 0 && (
                      <div className={clsx(
                        "mt-3 gap-2",
                        discussion.images.length === 1 ? "flex" : "grid grid-cols-2"
                      )}>
                        {discussion.images.map((img, idx) => (
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
                    {discussion.video && (
                      <div className="mt-3">
                        <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-slate-900">
                          <iframe
                            src={discussion.video}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    
                    <button className="flex items-center gap-1 text-xs text-teal-600 mt-3 font-medium hover:text-teal-700 transition">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      {discussion.replies} balasan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Profil Siswa</h2>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
              <img
                src={
                  (auth?.avatar && getImage(auth.avatar)) ||
                  "https://avatar.iran.liara.run/public"
                }
                alt={auth?.name}
                className="size-24 rounded-full mx-auto border-4 border-teal-500"
              />
              <h3 className="text-xl font-semibold text-slate-700 mt-4">
                {auth?.name || "Nama Siswa"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {auth?.email || "email@siswa.com"}
              </p>
              <span className="inline-block mt-3 px-4 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                Siswa
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-slate-700 mb-3">Informasi Kelas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Kelas</span>
                  <span className="text-slate-700 font-medium">{MOCK_CLASS_INFO.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guru Pengampu</span>
                  <span className="text-slate-700 font-medium">{MOCK_CLASS_INFO.teacher.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sekolah</span>
                  <span className="text-slate-700 font-medium">{MOCK_CLASS_INFO.school}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-slate-700 mb-3">Statistik</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-teal-600">
                    {MOCK_MATERIALS.length}
                  </p>
                  <p className="text-xs text-slate-500">Materi</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-500">
                    {MOCK_EXERCISES.filter((e) => e.isCompleted).length}/{MOCK_EXERCISES.length}
                  </p>
                  <p className="text-xs text-slate-500">Latihan</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {MOCK_DISCUSSIONS.length}
                  </p>
                  <p className="text-xs text-slate-500">Diskusi</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-end justify-around h-16 px-2">
          {/* First 2 tabs */}
          {tabs.slice(0, 2).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition"
            >
              <div
                className={clsx(
                  "transition-colors",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.icon}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          ))}
          
          {/* Center Plus Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center -mt-6 px-3"
          >
            <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <PlusIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1">Posting</span>
          </button>
          
          {/* Last 2 tabs */}
          {tabs.slice(2, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition"
            >
              <div
                className={clsx(
                  "transition-colors",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.icon}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Discussion Modal */}
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
              <h3 className="text-lg font-semibold text-slate-700">Tambah Diskusi</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <textarea
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              placeholder="Tulis pertanyaan atau diskusi baru..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-teal-500"
              rows={4}
              autoFocus
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
                onClick={handleAddDiscussion}
                disabled={!newDiscussion.trim() && selectedImages.length === 0 && !videoUrl}
                className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
