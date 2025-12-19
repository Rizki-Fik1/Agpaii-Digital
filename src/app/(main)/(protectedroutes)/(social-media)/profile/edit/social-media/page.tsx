"use client";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { CameraIcon } from "@heroicons/react/24/solid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import Modal from "@/components/modal/modal";
import { Area } from "react-easy-crop";

const getImage = (url: string) =>
  `${process.env.NEXT_PUBLIC_STORAGE_URL}/${url}`;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

async function generateCroppedImg(imageSrc: string, pixelCrop: Area) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 1);
  });
}


export default function SocialMediaEditPage() {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [data, setData] = useState<{
    avatar: File | string | null;
    banner: File | string | null;
    long_bio: string | null;
  }>({
    avatar: null,
    banner: null,
    long_bio: null,
  });

  // Avatar crop states
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [croppedAreaPixelsAvatar, setCroppedAreaPixelsAvatar] = useState<Area | null>(null);

  // Banner crop states
  const [showBannerCrop, setShowBannerCrop] = useState(false);
  const [tempBannerFile, setTempBannerFile] = useState<File | null>(null);
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [bannerZoom, setBannerZoom] = useState(1);
  const [croppedAreaPixelsBanner, setCroppedAreaPixelsBanner] = useState<Area | null>(null);

  useEffect(() => {
    console.log(auth);
    setData({
      avatar: auth.avatar ?? null,
      banner: !!auth.banner ? auth.banner.src : null,
      long_bio: auth.profile.long_bio,
    });
  }, [auth]);

  const getUserAvatar = (avatar: any) => {
    return typeof avatar == "string"
      ? getImage(avatar)
      : URL.createObjectURL(avatar as any);
  };

  const getUserBanner = (banner: any) =>
    typeof banner === "string" ? getImage(banner) : URL.createObjectURL(banner);

  const handleAvatarCropComplete = async () => {
    if (!tempAvatarFile || !croppedAreaPixelsAvatar) return;

    try {
      const croppedImage = await generateCroppedImg(
        URL.createObjectURL(tempAvatarFile),
        croppedAreaPixelsAvatar
      );
      const croppedFile = new File([croppedImage], "cropped-avatar.jpg", { type: "image/jpeg" });
      setData((prev) => ({ ...prev, avatar: croppedFile }));
      toast.success("Avatar berhasil di-crop");
    } catch (error) {
      console.error("Error cropping avatar:", error);
      toast.error("Gagal crop avatar");
    } finally {
      setShowAvatarCrop(false);
      setTempAvatarFile(null);
      setCroppedAreaPixelsAvatar(null);
    }
  };

  const handleBannerCropComplete = async () => {
    if (!tempBannerFile || !croppedAreaPixelsBanner) return;

    try {
      const croppedImage = await generateCroppedImg(
        URL.createObjectURL(tempBannerFile),
        croppedAreaPixelsBanner
      );
      const croppedFile = new File([croppedImage], "cropped-banner.jpg", { type: "image/jpeg" });
      setData((prev) => ({ ...prev, banner: croppedFile }));
      toast.success("Banner berhasil di-crop");
    } catch (error) {
      console.error("Error cropping banner:", error);
      toast.error("Gagal crop banner");
    } finally {
      setShowBannerCrop(false);
      setTempBannerFile(null);
      setCroppedAreaPixelsBanner(null);
    }
  };

  const updateBio = async (data: any) => {
    try {
      const res = await API.put(`/user/${auth.id}/profile`, { long_bio: data });
      if (res.status == 200) return res.data;
    } catch (error: any) {
      console.log(error);
    }
  };

  const updateAvatar = async (data: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", data);
      const res = await API.post(`/user/${auth.id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status == 200) return res.data;
    } catch (error) {
      console.log("error on update avatar", error);
    }
  };

  const updateBanner = async (data: File) => {
    try {
      const formData = new FormData();
      formData.append("banner", data);
      const res = await API.post(`/user/${auth.id}/banner`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status == 200) return res.data;
    } catch (error) {
      console.log("error on update banner", error);
    }
  };

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: async (d: typeof data) => {
      await Promise.all([
        updateBio(d.long_bio),
        (d.avatar as any) instanceof File && updateAvatar(d.avatar as any),
        (d.banner as any) instanceof File && updateBanner(d.banner as any),
      ]);
    },
    onSuccess: async () => {
      toast.success("Data Berhasil di Update");
      await queryClient.invalidateQueries({
        queryKey: ["auth"],
      });
      router.push("/profile/edit");
    },
  });

  return (
    <div className="pt-[3.7rem] pb-20 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <TopBar withBackButton>Profile Sosmed</TopBar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Banner Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
            <div className="flex flex-col gap-4 p-6">
              <div>
                <label htmlFor="banner" className="block text-xl font-semibold text-slate-700 mb-3">
                  Banner Profil
                </label>
                <p className="text-xs text-slate-500 mb-4">Ukuran rekomendasi: 1600 x 400 px</p>
                <input
                  type="file"
                  name=""
                  id="banner"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTempBannerFile(e.target.files[0]);
                      setShowBannerCrop(true);
                    }
                  }}
                  accept="image/*"
                  hidden
                />
                <div className="relative w-full aspect-[16/7] overflow-hidden rounded-lg border-2 border-dashed border-slate-300 hover:border-[#009788] transition-colors duration-200 bg-slate-50 group cursor-pointer">
                  {!!data.banner && (
                    <img
                      className="size-full object-center object-cover"
                      src={getUserBanner(data.banner)}
                      alt="banner"
                    />
                  )}
                  <label
                    htmlFor="banner"
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/0 group-hover:bg-black/10 transition-colors duration-200"
                  >
                    <CameraIcon className="size-10 text-slate-400 group-hover:text-[#009788] transition-colors" />
                    <span className="text-xs text-slate-500 mt-2">Klik untuk ubah</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bio Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 h-full">
              <div className="p-6">
                <label className="block text-xl font-semibold text-slate-700 mb-3">
                  Biografi
                </label>
                <p className="text-xs text-slate-500 mb-4">Ceritakan tentang diri Anda kepada komunitas</p>
                <textarea
                  onChange={(e) =>
                    setData((d) => ({ ...d, long_bio: e.target.value } as any))
                  }
                  value={(data.long_bio as any) || ""}
                  placeholder="Tulis biografi Anda di sini..."
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#009788] focus:ring-opacity-50 transition-all duration-200 font-[400] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
              <div className="p-6">
                <label htmlFor="avatar" className="block text-xl font-semibold text-slate-700 mb-3">
                  Foto Profil
                </label>
                <p className="text-xs text-slate-500 mb-4">Format: Persegi (1:1)</p>
                <input
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTempAvatarFile(e.target.files[0]);
                      setShowAvatarCrop(true);
                    }
                  }}
                  type="file"
                  name=""
                  id="avatar"
                  accept="image/*"
                  hidden
                />
                <div className="w-full aspect-square relative rounded-lg border-2 border-dashed border-slate-300 hover:border-[#009788] transition-colors duration-200 overflow-hidden bg-slate-50 group cursor-pointer">
                  {!!data.avatar && (
                    <img
                      src={getUserAvatar(data.avatar)}
                      className="size-full object-cover object-center"
                      alt="avatar"
                    />
                  )}
                  <label
                    htmlFor="avatar"
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/0 group-hover:bg-black/10 transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center">
                      <CameraIcon className="size-8 text-slate-400 group-hover:text-[#009788] transition-colors" />
                      <span className="text-xs text-slate-500 mt-2">Ubah</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          {updating ? (
            <div className="flex justify-center items-center py-4">
              <Loader className="size-8" />
            </div>
          ) : (
            <button
              className="w-full px-6 py-3 bg-gradient-to-r from-[#009788] to-[#008078] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-[#008078] hover:to-[#006b60] transition-all duration-200 flex items-center justify-center text-base"
              onClick={() => update(data)}
            >
              Simpan Perubahan
            </button>
          )}
        </div>
      </div>

      {/* Avatar Crop Modal */}
      <Modal show={showAvatarCrop} onClose={() => setShowAvatarCrop(false)}>
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-slate-800">📸 Crop Foto Profil</h2>
          <p className="text-sm text-slate-500 mb-6">Atur posisi dan ukuran foto Anda</p>
          <div className="relative h-72 bg-black rounded-lg overflow-hidden shadow-lg">
            <Cropper
              image={tempAvatarFile ? URL.createObjectURL(tempAvatarFile) : ""}
              crop={avatarCrop}
              zoom={avatarZoom}
              aspect={1}
              onCropChange={setAvatarCrop}
              onZoomChange={setAvatarZoom}
              onCropComplete={(_, croppedAreaPixels) => {
                setCroppedAreaPixelsAvatar(croppedAreaPixels);
              }}
            />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                🔍 Zoom
              </label>
              <span className="text-sm font-semibold text-[#009788]">{Math.round(avatarZoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={avatarZoom}
              onChange={(e) => setAvatarZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#009788]"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAvatarCrop(false)}
              className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleAvatarCropComplete}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#009788] to-[#008078] text-white rounded-lg font-medium hover:shadow-md transition-all"
            >
              Simpan Crop
            </button>
          </div>
        </div>
      </Modal>

      {/* Banner Crop Modal */}
      <Modal show={showBannerCrop} onClose={() => setShowBannerCrop(false)}>
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-slate-800">🎨 Crop Banner Profil</h2>
          <p className="text-sm text-slate-500 mb-6">Atur posisi dan ukuran banner Anda</p>
          <div className="relative h-64 bg-black rounded-lg overflow-hidden shadow-lg">
            <Cropper
              image={tempBannerFile ? URL.createObjectURL(tempBannerFile) : ""}
              crop={bannerCrop}
              zoom={bannerZoom}
              aspect={16 / 7}
              onCropChange={setBannerCrop}
              onZoomChange={setBannerZoom}
              onCropComplete={(_, croppedAreaPixels) => {
                setCroppedAreaPixelsBanner(croppedAreaPixels);
              }}
            />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                🔍 Zoom
              </label>
              <span className="text-sm font-semibold text-[#009788]">{Math.round(bannerZoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={bannerZoom}
              onChange={(e) => setBannerZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#009788]"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowBannerCrop(false)}
              className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleBannerCropComplete}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#009788] to-[#008078] text-white rounded-lg font-medium hover:shadow-md transition-all"
            >
              Simpan Crop
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}