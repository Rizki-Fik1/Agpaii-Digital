"use client";
import React, { useState, useEffect, useRef } from "react";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiEdit3,
  FiSave,
  FiCamera,
} from "react-icons/fi";
import { toast } from "sonner";
import API from "@/utils/api/config";
import { AxiosError } from "axios";

export default function MitraProfilePage() {
  const { auth, setAuth, refetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editing
  const [formData, setFormData] = useState({
    name: "",
    instansi: "",
    email: "",
    phone: "",
    pic: "",
    logo: "", // URL for preview
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (auth) {
      setFormData({
        name: auth.name || "",
        // Fallback sequence: brand_name (from backend) -> instansi_name (legacy/alt) -> name
        instansi:
          auth.brand_name ||
          auth.instansi_name ||
          auth.name ||
          "Nama Instansi Belum Diisi",
        email: auth.email || "",
        // Fallback sequence: phone (backend) -> no_hp (frontend state)
        phone: auth.phone || auth.no_hp || "",
        pic: auth.pic_name || "Nama PIC Belum Diisi",
        logo:
          auth.logo_mitra || auth.logo
            ? (auth.logo_mitra || auth.logo).startsWith("http")
              ? auth.logo_mitra || auth.logo
              : `https://file.agpaiidigital.org/${auth.logo_mitra || auth.logo}`
            : null,
      });
    }
  }, [auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setFormData((prev) => ({
        ...prev,
        logo: URL.createObjectURL(file), // For preview
      }));
    }
  };

  const handleSave = async () => {
    if (!auth?.id) return;
    setLoading(true);

    try {
      const payload = new FormData();

      // Match AuthController@updateMitra validation rules
      // 'brand_name' => 'required|string|min:3',
      // 'pic_name'   => 'required|string|min:3',
      // 'email'      => 'required|email|unique:users,email,' . $user->id,
      // 'no_hp'      => 'required|min:10',
      // 'logo'       => 'nullable|image|mimes:jpg,jpeg,png|max:4096',

      payload.append("brand_name", formData.instansi);
      payload.append("pic_name", formData.pic);
      payload.append("email", formData.email);
      payload.append("no_hp", formData.phone);

      // Logo
      if (logoFile) {
        payload.append("logo", logoFile);
      }

      // Method Spoofing for Laravel properties
      payload.append("_method", "PUT");

      console.log(
        "DEBUG: Submit Profile Update to /mitra/" + auth.id,
        Object.fromEntries(payload.entries()),
      );

      // Use the specific route provided: Route::put('/mitra/{user}', 'AuthController@updateMitra');
      const res = await API.post(`/mitra/${auth.id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data) {
        toast.success("Profil berhasil diperbarui!");
        setIsEditing(false);
        setLogoFile(null);

        // Refresh auth context
        if (refetch) {
          await refetch();
        } else {
          // Fallback manual update if refetch undefined
          const updatedData = res.data.data || {};
          setAuth({
            ...auth,
            ...updatedData,
            // Ensure we map back the backend response fields to auth context fields if names differ
            brand_name: updatedData.brand_name || formData.instansi,
            pic_name: updatedData.pic_name || formData.pic,
            phone: updatedData.phone || formData.phone,
            logo_mitra:
              updatedData.logo_mitra ||
              (logoFile ? URL.createObjectURL(logoFile) : auth.logo_mitra),
          });
        }
      }
    } catch (error: any) {
      console.error("Gagal update profil:", error);
      const msg = error?.response?.data?.message || "Gagal memperbarui profil";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[4.5rem] bg-gray-50 min-h-screen pb-24">
      <TopBar>Profil Mitra</TopBar>

      <div className="px-5">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-500 to-teal-600"></div>
          <div className="relative pt-6">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden relative group">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <FiBriefcase className="w-8 h-8" />
                </div>
              )}
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiCamera className="text-white w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-800">
              {formData.instansi}
            </h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
            className={`absolute top-28 right-4 p-2 rounded-full shadow-md transition-all ${
              isEditing
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-white text-gray-600 hover:text-green-600"
            } ${loading ? "opacity-70 cursor-wait" : ""}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <FiSave className="w-5 h-5" />
            ) : (
              <FiEdit3 className="w-5 h-5" />
            )}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setLogoFile(null);
                // Reset form to auth
                if (auth)
                  setFormData({
                    name: auth.name || "",
                    instansi:
                      auth.brand_name ||
                      auth.instansi_name ||
                      auth.name ||
                      "Nama Instansi Belum Diisi",
                    email: auth.email || "",
                    phone: auth.phone || auth.no_hp || "",
                    pic: auth.pic_name || "Nama PIC Belum Diisi",
                    logo:
                      auth.logo_mitra || auth.logo
                        ? (auth.logo_mitra || auth.logo).startsWith("http")
                          ? auth.logo_mitra || auth.logo
                          : `https://file.agpaiidigital.org/${auth.logo_mitra || auth.logo}`
                        : null,
                  });
              }}
              className="absolute top-28 left-4 p-2 rounded-full shadow-md bg-white text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
              title="Batal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Info Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          <h3 className="font-bold text-gray-800 border-b pb-2">
            Informasi Mitra
          </h3>

          <div className="space-y-4">
            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Nama Instansi
              </label>
              <div
                className={`flex items-center gap-3 border-b pb-2 ${isEditing ? "border-green-300" : "border-gray-100"}`}
              >
                <FiBriefcase className="text-green-500 w-5 h-5" />
                <input
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleChange}
                  disabled // Nama Instansi tidak boleh diedit user
                  className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500 opacity-70 cursor-not-allowed"
                  placeholder="Masukkan nama instansi"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Nama PIC
              </label>
              <div
                className={`flex items-center gap-3 border-b pb-2 ${isEditing ? "border-green-300" : "border-gray-100"}`}
              >
                <FiUser className="text-green-500 w-5 h-5" />
                <input
                  name="pic"
                  value={formData.pic}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500"
                  placeholder="Masukkan nama PIC"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Email
              </label>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <FiMail className="text-green-500 w-5 h-5" />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // Email biasanya dikunci
                  className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Nomor HP
              </label>
              <div
                className={`flex items-center gap-3 border-b pb-2 ${isEditing ? "border-green-300" : "border-gray-100"}`}
              >
                <FiPhone className="text-green-500 w-5 h-5" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar?")) {
                localStorage.removeItem("access_token");
                setAuth(null);
                window.location.href = "/";
              }
            }}
            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Keluar
          </button>
          <p className="text-center text-gray-400 text-xs mt-4">
            Versi Aplikasi 1.0.0 &copy; 2024 AGPAII Digital
          </p>
        </div>
      </div>
    </div>
  );
}
