"use client";

import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api/config";
import { useState, useEffect } from "react";
import clsx from "clsx";
import TopBar from "@/components/nav/topbar";
import { getImage } from "@/utils/function/function";
import { toast } from "sonner";

export default function EventParticipantsPage() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState("all");

  const [participants, setParticipants] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);


  /* ============================
     GET SESSIONS
  ============================ */
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await API.get(`/event/${eventId}`);
        setSessions(res.data.session_detail || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, [eventId]);

  /* ============================
     FETCH PARTICIPANTS (RN style)
  ============================ */
  const fetchParticipants = async (keyword = "", session = "all") => {
    setIsLoading(true);

    try {
      const res = await API.get(`/event/search-participants`, {
        params: {
          event_id: eventId,
          keyword,
          session,
        },
      });

      setParticipants(res.data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil peserta");
      console.error(err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchParticipants("", "all");
  }, []);

  /* ============================
     HANDLE SEARCH + SESSION FILTER
  ============================ */
  const handleSearch = (text) => {
    setSearch(text);
    fetchParticipants(text, selectedSession);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSession(sessionId);
    fetchParticipants(search, sessionId);
  };

  const handleDeleteSertif = async (userId) => {
    try {
      await API.delete('/event/delete-sertif', {
        data: { event_id: eventId, user_id: userId }
      });

      toast.success("Sertifikat berhasil dihapus");
      fetchParticipants(search, selectedSession);
    } catch (err) {
      toast.error("Gagal menghapus sertifikat");
    }
  };


  const handleUploadSertif = async () => {
    if (!uploadFile) {
      toast.error("Silakan pilih file dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("event_id", eventId);
    formData.append("user_id", selectedUser);
    formData.append("file", uploadFile);

    try {
      setUploading(true);

      const res = await API.post("/event/upload-sertif", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Sertifikat berhasil diupload");

      setShowUploadModal(false);
      setUploadFile(null);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal upload sertifikat");
    }

    setUploading(false);
  };


  return (
    <div className="pt-[4.21rem] pb-20">
      <TopBar withBackButton href={`/event/${eventId}`}>
        Peserta Acara
      </TopBar>

      {/* SEARCH */}
      <div className="px-4 mt-6">
        <input
          className="w-full border border-slate-300 rounded-full px-4 py-3 bg-slate-100 text-sm"
          placeholder="Cari peserta"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* SESSION FILTER */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto">
        <button
          className={clsx(
            "px-4 py-2 rounded-full text-sm border whitespace-nowrap",
            selectedSession === "all"
              ? "bg-[#009788] text-white"
              : "bg-white border-slate-300"
          )}
          onClick={() => handleSelectSession("all")}
        >
          Semua
        </button>

        {sessions.map((s) => (
          <button
            key={s.id}
            className={clsx(
              "px-4 py-2 rounded-full whitespace-nowrap text-sm border",
              selectedSession === s.id
                ? "bg-[#009788] text-white"
                : "bg-white border-slate-300"
            )}
            onClick={() => handleSelectSession(s.id)}
          >
            {s.session_name}
          </button>
        ))}
      </div>

      {/* ADD PARTICIPANT */}
      <div className="mt-6 px-4">
        <button
          onClick={() => router.push(`/event/${eventId}/peserta/add`)}
          className="flex items-center justify-center w-full h-14 rounded-md bg-[#009788] text-white shadow"
        >
          + Tambah Peserta Manual
        </button>
      </div>

      {/* PARTICIPANTS LIST */}
      <div className="mt-4 px-4">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border-b py-4"
          >
            {/* LEFT SIDE → KLIK KE PROFIL */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push(`/profile/${p.user.id}`)}
            >
              <img
                src={getImage(p?.user.avatar) || "/img/default-user.png"}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{p.user?.name}</div>
                <div className="text-xs text-slate-500">{p.user?.email}</div>
              </div>
            </div>

            {/* RIGHT SIDE → BUTTON UPLOAD SERTIF */}
            <div className="flex items-center gap-3">

              {/* Ikon Lihat Sertifikat */}
              {p.certificate && (
                <a
                  href={process.env.NEXT_PUBLIC_STORAGE_URL + "/" + p.certificate}
                  target="_blank"
                  title="Lihat Sertifikat"
                  className="text-blue-600 text-xl"
                >
                  👁️
                </a>
              )}

              {/* Ikon Hapus Sertifikat */}
              {p.certificate && (
                <button
                  onClick={() => handleDeleteSertif(p.user.id)}
                  title="Hapus Sertifikat"
                  className="text-red-600 text-xl"
                >
                  🗑️
                </button>
              )}

              {/* Upload Sertif */}
              <button
                onClick={() => {
                  setSelectedUser(p.user.id);
                  setShowUploadModal(true);
                }}
                title="Upload Sertifikat"
                className="px-3 py-1 text-sm bg-[#DD9303] text-white rounded-md"
              >
                Upload
              </button>
            </div>



          </div>
        ))}

        {!isLoading && participants.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm">
            Tidak ada peserta ditemukan
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6 text-sm text-slate-500">
            Mengambil data...
          </div>
        )}
      </div>
      {showUploadModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-4">
    <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg">

      <h2 className="text-lg font-semibold mb-4 text-center">
        Upload Sertifikat Peserta
      </h2>

      {/* FILE INPUT */}
      <input
        type="file"
        onChange={(e) => setUploadFile(e.target.files[0])}
        className="w-full border p-2 rounded"
      />

      {/* BUTTON */}
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={() => {
            setShowUploadModal(false);
            setUploadFile(null);
            setSelectedUser(null);
          }}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Batal
        </button>

        <button
          onClick={handleUploadSertif}
          className="px-4 py-2 bg-[#009788] text-white rounded"
          disabled={uploading}
        >
          {uploading ? "Mengupload..." : "Upload"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
