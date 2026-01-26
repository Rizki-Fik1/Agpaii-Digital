"use client";
import API from "@/utils/api/config";
import {
  PhotoIcon,
  DocumentPlusIcon,
  PlayIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/crop/createCroppedImage";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPostPage() {
  const router = useRouter();

  function convertYouTubeToEmbed(url: string) {
    if (!url) return "";
    if (url.includes("youtu.be"))
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    if (url.includes("watch?v="))
      return url.replace("watch?v=", "embed/");
    return url;
  }

  /* ==============================
      STATE
  ============================== */
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeMode, setYoutubeMode] = useState(false);

  /* ==============================
      STATE CROP
  ============================== */
  const [cropMode, setCropMode] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const openCropper = (file: File) => {
    const imgURL = URL.createObjectURL(file);
    setCropImageSrc(imgURL);
    setCropMode(true);
  };

  const applyCrop = async () => {
    const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
    setImages([croppedFile]);
    setCropMode(false);
  };

  /* ==============================
      VALIDASI FILE <= 5MB
  ============================== */
  const validateFileSize = (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`Ukuran file maksimal 5MB.\n(${file.name}) terlalu besar.`);
      return false;
    }
    return true;
  };

  /* ==============================
      RESET MEDIA
  ============================== */
  const resetAllExcept = (type: "image" | "document" | "video" | "youtube") => {
    if (type !== "image") {
      setImages([]);
      setOriginalImage(null);
    }
    if (type !== "document") setDocuments([]);
    if (type !== "video") setVideos([]);
    if (type !== "youtube") {
      setYoutubeUrl("");
      setYoutubeMode(false);
    }
  };

  /* ==============================
      SUBMIT POST - Tidak dipakai lagi, diganti dengan direct API call di handleSubmit
  ============================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length === 0) {
      alert("Teks harus diisi sebelum posting!");
      return;
    }
    
    // Simpan data posting ke sessionStorage untuk preview
    const postData = {
      body: text,
      youtubeUrl: youtubeUrl,
      image: images.length > 0 ? URL.createObjectURL(images[0]) : null,
      document: documents.length > 0 ? documents[0].name : null,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem("pendingPost", JSON.stringify(postData));
    sessionStorage.removeItem("postingComplete");
    sessionStorage.removeItem("uploadError");
    sessionStorage.setItem("uploadProgress", "0");
    
    // Redirect dulu
    router.push("/social-media");
    
    // Mulai upload di background dengan optimasi
    const data = new FormData();
    data.append("body", text);
    if (youtubeUrl) data.append("youtube_url", youtubeUrl);
    
    // Append files dengan kompresi untuk gambar
    if (originalImage) {
      // Kompresi gambar original jika lebih dari 1MB
      if (originalImage.size > 1024 * 1024) {
        try {
          const compressed = await compressImage(originalImage);
          data.append("full_image", compressed);
        } catch (err) {
          data.append("full_image", originalImage);
        }
      } else {
        data.append("full_image", originalImage);
      }
    }
    
    images.forEach((f) => data.append("files[]", f));
    documents.forEach((f) => data.append("document", f));
    videos.forEach((f) => data.append("files[]", f));
    
    // Abort controller untuk cancel upload jika diperlukan
    const abortController = new AbortController();
    
    try {
      const res = await API.post("post", data, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: abortController.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            sessionStorage.setItem("uploadProgress", percentCompleted.toString());
            
            // Dispatch event untuk update real-time
            window.dispatchEvent(new CustomEvent("uploadProgress", { 
              detail: { progress: percentCompleted } 
            }));
          }
        },
      });
      
      if (res.status === 200) {
        // Simpan data post yang baru dibuat untuk optimistic update
        sessionStorage.setItem("newPostData", JSON.stringify(res.data));
        sessionStorage.setItem("postingComplete", "true");
        window.dispatchEvent(new CustomEvent("postingComplete"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      
      // Jangan set error jika upload di-cancel
      if (error.name !== 'CanceledError') {
        sessionStorage.setItem("uploadError", "true");
        window.dispatchEvent(new CustomEvent("uploadError", {
          detail: { message: error.message }
        }));
      }
    }
  };

  // Fungsi kompresi gambar
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max width/height 1920px
          let width = img.width;
          let height = img.height;
          const maxSize = 1920;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            0.85 // Quality 85%
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const mediaUsed =
    images.length > 0 ||
    documents.length > 0 ||
    videos.length > 0 ||
    youtubeUrl.length > 0;

  return (
    <div className="pb-20">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >
        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-[99] max-w-[480px] mx-auto bg-teal-700 text-white px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1"
          >
            <ArrowLeftIcon className="size-6 text-white" />
          </button>
          <h1 className="font-semibold text-lg">Buat Postingan</h1>
          <div className="w-6"></div>
        </div>

        {/* MAIN CONTENT */}
        <div className="pt-20 px-4 pb-6 bg-white min-h-screen">
          {/* BORDERED POSTING SECTION */}
          <div className="border border-slate-300 rounded-lg p-4 bg-white">
            {/* TEXTAREA */}
            <textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              placeholder="Ketik sesuatu..."
              className="w-full border-0 resize-none px-0 py-4 text-lg placeholder-slate-400 focus:outline-none focus:ring-0 bg-white"
              rows={6}
            ></textarea>

            {/* YOUTUBE INPUT */}
            {youtubeMode && (
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Tempel link YouTube disini…"
                  value={youtubeUrl}
                  onChange={(e) => {
                    resetAllExcept("youtube");
                    setYoutubeUrl(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 mt-6 justify-between">
              {/* MEDIA ICONS */}
              {!mediaUsed && (
                <div className="flex gap-3">
                  {/* Upload Gambar */}
                  <label className="cursor-pointer">
                    <div className="bg-teal-100 p-3 rounded-lg hover:bg-teal-200 transition">
                      <PhotoIcon className="size-6 text-teal-600" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        const file = e.target.files[0];
                        if (!validateFileSize(file)) return;
                        resetAllExcept("image");
                        setOriginalImage(file);
                        openCropper(file);
                      }}
                    />
                  </label>

                  {/* Upload Dokumen */}
                  <label className="cursor-pointer">
                    <div className="bg-teal-100 p-3 rounded-lg hover:bg-teal-200 transition">
                      <DocumentPlusIcon className="size-6 text-teal-600" />
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        const file = e.target.files[0];
                        if (!validateFileSize(file)) return;
                        resetAllExcept("document");
                        setDocuments([file]);
                      }}
                    />
                  </label>

                  {/* YouTube Button */}
                  <button
                    type="button"
                    onClick={() => {
                      resetAllExcept("youtube");
                      setYoutubeMode(!youtubeMode);
                    }}
                    className="bg-teal-100 p-3 rounded-lg hover:bg-teal-200 transition"
                  >
                    <PlayIcon className="size-6 text-teal-600" />
                  </button>
                </div>
              )}

              {/* POSTING BUTTON */}
              <button
                disabled={text.length === 0}
                type="submit"
                className="disabled:bg-slate-300 bg-teal-600 hover:bg-teal-700 transition rounded-full text-white px-8 py-3 text-sm font-medium"
              >
                Posting
              </button>
            </div>
          </div>

          {/* MEDIA PREVIEW SECTION BELOW FORM */}
          {mediaUsed && (
            <div className="mt-8 space-y-6">
              <h3 className="font-semibold text-lg text-slate-800">Preview Media</h3>

              {/* IMAGE PREVIEW */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">📷 Gambar</p>
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={URL.createObjectURL(images[0])}
                      className="w-full h-64 object-cover"
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages([]);
                        setOriginalImage(null);
                      }}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* DOCUMENT PREVIEW */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">📄 Dokumen</p>
                  <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <DocumentPlusIcon className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{documents[0].name}</p>
                        <p className="text-sm text-slate-500">
                          {(documents[0].size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments([])}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* YOUTUBE PREVIEW */}
              {youtubeUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">🎥 YouTube</p>
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <iframe
                      className="w-full h-64 rounded-lg"
                      src={convertYouTubeToEmbed(youtubeUrl)}
                      allowFullScreen
                      title="YouTube Preview"
                    ></iframe>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl("");
                        setYoutubeMode(false);
                      }}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* CROP MODAL */}
      {cropMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit Gambar</h2>
            
            <div className="relative w-full h-80 bg-slate-100 mb-4 rounded-lg overflow-hidden">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Zoom: {(zoom * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCropMode(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
