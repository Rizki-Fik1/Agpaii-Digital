"use client";
import TopBar from "@/components/nav/topbar";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import API from "@/utils/api/config";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";

export default function NewRPP() {
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [grades] = useState([
    { id: "5", label: "TK" },
    { id: "1", label: "SD" },
    { id: "2", label: "SMP" },
    { id: "3", label: "SMA" },
    { id: "4", label: "SMK" },
    { id: "9", label: "SLB" },
  ]);
  const router = useRouter();
  const { auth } = useAuth();

  const { acceptedFiles, getInputProps, getRootProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const [credentials, setCredentials] = useState({
    topic: "",
    subject: "",
    grade_id: "",
    duration: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!credentials.topic || !credentials.subject || !credentials.grade_id || !credentials.duration) {
      alert("Mohon lengkapi semua field");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("topic", credentials.topic);
      formData.append("subject", credentials.subject);
      formData.append("grade_id", credentials.grade_id);
      formData.append("duration", credentials.duration);
      
      if (image) {
        formData.append("image", image);
      }

      const response = await API.post("/lesson-plan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        // Invalidate semua RPP queries supaya list ter-refresh
        queryClient.removeQueries({ queryKey: ["rpps"] });
        alert("RPP berhasil dibuat!");
        router.push("/rpp");
      }
    } catch (error: any) {
      console.error("Error creating RPP:", error);
      const errorMessage = error.response?.data?.message || error.message || "Gagal membuat RPP. Silakan coba lagi.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-[4.21rem] pb-8">
      <TopBar withBackButton>Buat RPP</TopBar>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 pt-8">
        <div
          {...getRootProps({
            className:
              "rounded-md h-56 border flex justify-center items-center border-slate-300 relative cursor-pointer hover:border-slate-400 transition",
          })}
        >
          <input {...getInputProps()} />
          <label className="text-slate-500 flex justify-center items-center flex-col cursor-pointer">
            Upload Gambar Disini
            <span className="text-xs text-slate-400 mt-1">Klik atau drag & drop</span>
          </label>
          {image && (
            <div className="absolute size-full">
              <img
                className="size-full object-cover object-center rounded-md"
                src={URL.createObjectURL(image as Blob)}
                alt="Preview"
              />
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                }}
                className="p-1 rounded-full absolute -top-2 -right-2 bg-white border border-slate-400 cursor-pointer hover:bg-red-50 transition"
              >
                <XMarkIcon className="size-5" />
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-medium mt-6">Detail Informasi</h1>
          <input
            type="text"
            name="topic"
            value={credentials.topic}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-md border border-slate-200 focus:border-[#009788] focus:ring-1 focus:ring-[#009788] outline-none"
            placeholder="Materi Pokok"
            required
          />
          <input
            type="text"
            name="subject"
            value={credentials.subject}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-md border border-slate-200 focus:border-[#009788] focus:ring-1 focus:ring-[#009788] outline-none"
            placeholder="Mata Pelajaran"
            required
          />
          <select
            name="grade_id"
            value={credentials.grade_id}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-md border border-slate-200 focus:border-[#009788] focus:ring-1 focus:ring-[#009788] outline-none"
            required
          >
            <option value="" disabled>
              Pilih Jenjang & Kelas
            </option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="duration"
            value={credentials.duration}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-md border border-slate-200 focus:border-[#009788] focus:ring-1 focus:ring-[#009788] outline-none"
            placeholder="Durasi (contoh: 2x45 menit)"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#009788] hover:bg-[#00867a] disabled:bg-slate-400 disabled:cursor-not-allowed rounded-md px-4 py-2 text-white mt-8 transition font-medium"
        >
          {isSubmitting ? "Menyimpan..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
