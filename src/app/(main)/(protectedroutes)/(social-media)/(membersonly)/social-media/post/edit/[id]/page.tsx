"use client";
import Loader from "@/components/loader/loader";
import API from "@/utils/api/config";
import {
  PhotoIcon,
  DocumentPlusIcon,
  PlayIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/crop/createCroppedImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditPostPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useParams();

  // States
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeMode, setYoutubeMode] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);
  const [deleteExistingImages, setDeleteExistingImages] = useState(false);
  const [deleteExistingDocument, setDeleteExistingDocument] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");

  const convertYouTubeToEmbed = (url: string) => {
    if (!url) return "";
    if (url.includes("youtu.be"))
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    if (url.includes("watch?v="))
      return url.replace("watch?v=", "embed/");
    return url;
  };

  // LOAD POST EXISTING DATA
  const { data: postData, isLoading: loadingPost } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await API.get(`post/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (postData) {
      setText(postData.body);
      if (postData.youtube_url) {
        setYoutubeMode(true);
        setYoutubeUrl(postData.youtube_url);
      }
      // Fix: Ambil URL asli (asumsi postData.images[0] punya 'src')
      if (postData.images?.length > 0) {
        setExistingImageUrl("https://file.agpaiidigital.org/" + postData.images[0].src);
      }
      // Fix: Ambil URL asli untuk document (asumsi postData.document punya 'path' atau langsung string)
      if (postData.document) {
        setExistingDocument("https://file.agpaiidigital.org/" + (postData.document.path || postData.document));
      }
    }
  }, [postData]);

  // APPLY CROPPING
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
    setExistingImageUrl(null); // Clear UI
  };

  const validateFileSize = (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File maksimum 5MB");
      return false;
    }
    return true;
  };

  const resetMedia = () => {
    setImages([]);
    setExistingImageUrl(null);
    setDocuments([]);
    setExistingDocument(null);
    setYoutubeUrl("");
    setYoutubeMode(false);
  };

  // SUBMIT EDIT
  const updatePost = async () => {
    const data = new FormData();
    data.append("body", text);
    if (youtubeUrl) data.append("youtube_url", youtubeUrl);
    // Tambah new images
    if (images.length > 0) {
      images.forEach((f) => data.append("files[]", f));
    }
    // Tambah new document (single)
    if (documents.length > 0) {
      data.append("document", documents[0]); // Single file
    }
    // Flag untuk menghapus gambar existing jika ada flag delete (baik dihapus manual atau direplace gambar baru)
    if (deleteExistingImages) {
      data.append("clear_images", "1");
    }
    // Flag untuk menghapus document existing jika ada flag delete
    if (deleteExistingDocument) {
      data.append("clear_document", "1");
    }
    // form method spoofing for Laravel
    data.append("_method", "PUT");
    
    // Debug logging
    console.log("Sending data to backend:");
    console.log("- body:", text);
    console.log("- youtube_url:", youtubeUrl);
    console.log("- images count:", images.length);
    console.log("- documents count:", documents.length);
    console.log("- deleteExistingImages:", deleteExistingImages);
    console.log("- deleteExistingDocument:", deleteExistingDocument);
    
    const res = await API.post(`post/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.status === 200) return true;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: updatePost,
    onSuccess: async () => {
      // Invalidate all posts queries to refresh the feed
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Invalidate specific post query
      await queryClient.invalidateQueries({ queryKey: ["post", id] });
      // Redirect to social media feed
      router.push("/social-media");
    },
    onError: (error: any) => {
      console.error("Error updating post:", error);
      console.error("Error response:", error.response?.data);
      alert(
        `Gagal menyimpan postingan: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );
    },
  });

  if (loadingPost)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10" />
      </div>
    );

  return (
    <div className="pb-20">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="flex flex-col px-6 py-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="p-1 rounded-full bg-[#009788]">
            <ArrowLeftIcon className="size-5 text-white" />
          </button>
          <h1 className="font-medium">Edit Postingan</h1>
          {!isPending ? (
            <button
              type="submit"
              className="bg-[#009788] text-white rounded-full px-5 py-1.5 text-sm"
            >
              Simpan
            </button>
          ) : (
            <Loader className="size-6" />
          )}
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Tulis sesuatu..."
          className="border px-4 py-3 bg-slate-200 rounded-md mt-6 resize-none"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Media toolbar */}
        <div className="flex gap-6 justify-end mt-4 pr-2">
          <label className="cursor-pointer flex flex-col items-center">
            <PhotoIcon className="size-8 fill-black" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;
                const file = e.target.files[0];
                if (!validateFileSize(file)) return;
                setExistingImageUrl(null);
                setDeleteExistingImages(true); // Tandai gambar lama untuk dihapus (replace)
                openCropper(file);
              }}
            />
          </label>
          <label className="cursor-pointer flex flex-col items-center">
            <DocumentPlusIcon className="size-8 fill-black" />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;
                const file = e.target.files[0];
                if (!validateFileSize(file)) return;
                setExistingDocument(null);
                setDeleteExistingDocument(true); // Tandai dokumen lama untuk dihapus (replace)
                setDocuments([file]);
              }}
            />
          </label>
          <button
            type="button"
            className="flex flex-col items-center"
            onClick={() => {
              setYoutubeMode(true);
              setYoutubeUrl("");
            }}
          >
            <PlayIcon className="size-8 text-red-600" />
          </button>
        </div>

        {/* MEDIA PREVIEW */}
        <div className="bg-slate-200 p-4 rounded-lg mt-6 space-y-4">
          {/* Existing Image */}
          {existingImageUrl && (
            <div className="relative inline-block">
              <img
                src={existingImageUrl}
                className="w-24 h-24 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setExistingImageUrl(null);
                  setDeleteExistingImages(true);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white border rounded-full p-1 hover:bg-red-600"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          )}
          {/* New image preview */}
          {images.length > 0 && (
            <div className="relative">
              <img
                src={URL.createObjectURL(images[0])}
                className="w-24 h-24 rounded-md object-cover"
              />
              <button
                onClick={() => setImages([])}
                className="absolute -top-2 -right-2 bg-white border rounded-full p-1"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          )}
          {/* Existing Document */}
          {existingDocument && (
            <div className="relative bg-white p-3 rounded-md border">
              <p className="text-sm font-medium pr-8">📄 {existingDocument.split('/').pop()}</p>
              <button
                type="button"
                onClick={() => {
                  setExistingDocument(null);
                  setDeleteExistingDocument(true);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white border rounded-full p-1 hover:bg-red-600"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          )}
          {/* New doc */}
          {documents.length > 0 && (
            <div className="relative bg-white p-3 rounded-md border">
              <p className="text-sm font-medium">📄 {documents[0].name}</p>
              <button
                onClick={() => setDocuments([])}
                className="absolute top-2 right-2 bg-white border rounded-full p-1"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          )}
          {/* YouTube */}
          {youtubeMode && (
            <div>
              <input
                type="text"
                className="w-full bg-white border px-3 py-2 rounded-md"
                placeholder="Tempel link YouTube"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              {youtubeUrl && (
                <iframe
                  className="w-full h-48 rounded-md mt-2"
                  src={convertYouTubeToEmbed(youtubeUrl)}
                />
              )}
            </div>
          )}
        </div>
      </form>

      {/* Crop Modal */}
      {cropMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 w-[90%] max-w-[400px] rounded-md">
            <div className="relative w-full h-[300px] bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCropMode(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={applyCrop}
                className="px-4 py-2 bg-[#009788] text-white rounded-md"
              >
                Simpan Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}