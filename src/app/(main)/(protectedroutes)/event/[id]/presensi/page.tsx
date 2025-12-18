"use client";

import { useParams, useSearchParams } from "next/navigation";
import API from "@/utils/api/config";
import { useQuery, useMutation } from "@tanstack/react-query";
import TopBar from "@/components/nav/topbar";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";
import { useState } from "react";
import { toast } from "sonner";

export default function EventPresensiPage() {
  const { id: eventId } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const { auth } = useAuth();
  const userKta = auth?.kta_id; 


  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [token, setToken] = useState("");

  // GET SESSIONS SESUAI ROUTE LARAVEL
  const fetchSessions = async () => {
    const res = await API.get(`/event/sessions/show/${eventId}/${auth.id}`);
    return res.data;
  };


  const { data: sessions, refetch } = useQuery({
    queryKey: ["event-sessions", eventId, userId],
    queryFn: fetchSessions,
  });

  // POST PRESENSI SESUAI ROUTE LARAVEL
  const presensiMutation = useMutation({
    mutationFn: async () =>
      API.post(
        `/event/${selectedSession.event_id}/sessions/${selectedSession.id}/users/${userKta}/presents`,
        { token }
      ),

    onSuccess: (res: any) => {
      if (res.data.success) {
        toast.success(res.data.message || "Presensi berhasil");
        refetch();
      } else {
        toast.error(res.data.message || "Token salah");
      }
    },
    onError: () => toast.error("Presensi gagal"),
    onSettled: () => {
      setShowTokenModal(false);
      setToken("");
    },
  });

  // DOWNLOAD SERTIFIKAT SESUAI ROUTE LARAVEL
  const downloadCertificate = async () => {
    try {
      const res = await API.get(`/event/participants/${eventId}/${auth.id}`);

      const items = res.data?.data;

      if (!items || items.length === 0) {
        toast.error("Sertifikat belum tersedia");
        return;
      }

      // Ambil sertifikat pertama (atau bisa pilih berdasarkan session_id)
      const certificate = items[0].certificate;

      if (!certificate) {
        toast.error("Sertifikat belum tersedia");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_STORAGE_URL}/${certificate}`;

      window.open(url, "_blank");
      toast.success("Sertifikat berhasil diunduh");

    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil sertifikat");
    }
  };

    
    
  const allSessionsCompleted = sessions?.every((s: any) => s.presents);

  return (
    <div className="pt-[4.21rem] px-6 pb-20">
      <TopBar withBackButton>Presensi Acara</TopBar>

      <h1 className="font-semibold text-lg mt-6">Keterangan Presensi</h1>

      {/* HEADER */}
      <div className="mt-4 grid grid-cols-3 bg-[#009788] text-white text-sm p-3 rounded-t-md">
        <div className="text-center">Sesi</div>
        <div className="text-center">Nama</div>
        <div className="text-center">Waktu</div>
      </div>

      {/* LIST SESSION */}
      <div className="border border-slate-300 rounded-b-md divide-y">
        {sessions?.map((s: any, index: number) => (
          <div
            key={s.id}
            className="grid grid-cols-3 text-sm p-3 bg-slate-100"
          >
            <div className="text-center">{index + 1}</div>
            <div className="text-center">{s.session_name}</div>
            <div className="text-center">
              {s.presents
                ? moment(s.presents.present_time).format("DD MMM YY HH:mm")
                : "-"}
            </div>
          </div>
        ))}
      </div>

      {/* BUTTON PRESENSI */}
      <div className="mt-6 flex flex-col gap-3">
        {sessions?.map((s: any) =>
          s.presents ? (
            <button
              key={s.id}
              className="w-full py-3 bg-gray-300 text-gray-600 rounded-md"
              disabled
            >
              Sudah Absen {s.session_name}
            </button>
          ) : (
            <button
              key={s.id}
              className="w-full py-3 bg-[#009788] text-white rounded-md"
              onClick={() => {
                setSelectedSession(s);
                setShowConfirmModal(true);
              }}
            >
              Presensi {s.session_name}
            </button>
          )
        )}
      </div>

      {/* BUTTON DOWNLOAD SERTIFIKAT */}
      <button
        onClick={() => allSessionsCompleted && downloadCertificate()}
        disabled={!allSessionsCompleted}
        className={`w-full mt-6 py-3 rounded-md 
          ${allSessionsCompleted 
            ? "bg-[#DD9303] text-white" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        Download Sertifikat
      </button>



      {/* MODAL CONFIRM */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-sm">
            <h2 className="font-semibold text-lg">Absen dulu ya</h2>
            <p className="mt-2 text-sm">
              Sebelum mengikuti acara, kamu harus absen terlebih dahulu.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md"
              >
                Nanti
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowTokenModal(true);
                }}
                className="px-4 py-2 bg-[#009788] text-white rounded-md"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT TOKEN */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-sm">
            <h2 className="font-semibold text-lg text-center mb-4">
              Masukkan Token
            </h2>

            <div className="bg-gray-200 px-6 py-3">
              <input
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.toUpperCase())
                }
                className="w-full text-center text-xl tracking-[6px] font-bold bg-transparent outline-none"
                placeholder="••••••"
              />
            </div>

            <button
              onClick={() => {

                const expectedToken = String(selectedSession.event_id) + String(selectedSession.id);

                if (token !== expectedToken) {
                  toast.error("Token tidak valid");
                  return;
                }

                presensiMutation.mutate();
              }}
              className="w-full mt-6 py-2.5 bg-[#009788] text-white rounded-md"
            >
              Submit
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
