"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter, useParams } from "next/navigation";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";

dayjs.locale("id");

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { auth } = useAuth();

  const fetchEvent = async () => {
    const res = await API.get(`/event/${id}`);
    return res.status === 200 ? res.data : null;
  };

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: fetchEvent,
  });

  const formatWaktu = (date: string) =>
    dayjs(date).format("dddd, DD MMMM YYYY - HH:mm") + " WIB";

  const getJangkauanLabel = (type: string) => {
    switch (type) {
      case "ALL":
        return { label: "Semua Wilayah", badge: "bg-blue-100 text-blue-800" };
      case "DPP":
        return { label: "DPP (Pusat)", badge: "bg-purple-100 text-purple-800" };
      case "DPW":
        return {
          label: "DPW (Provinsi)",
          badge: "bg-orange-100 text-orange-800",
        };
      case "DPD":
        return {
          label: "DPD (Kota/Kabupaten)",
          badge: "bg-green-100 text-green-800",
        };
      default:
        return { label: type, badge: "bg-gray-100 text-gray-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#009788] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail acara...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-[4.21rem] px-5 pb-10 text-center">
        <TopBar withBackButton>Detail Event</TopBar>
        <p className="mt-10 text-gray-500">Acara tidak ditemukan.</p>
      </div>
    );
  }

  const jangkauan = getJangkauanLabel(event.event_type);

  return (
    <div className="pt-[4.21rem] px-5 pb-10 bg-gray-50 min-h-screen">
      <TopBar withBackButton href="/event">
        Detail Event
      </TopBar>

      {/* Banner */}
      <div className="mt-6 w-full aspect-video rounded-xl overflow-hidden shadow-md">
        <img
          src={event.image ? getImage(event.image) : "/img/agpaii_splash.svg"}
          alt={event.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mt-5 bg-white shadow-sm px-4 py-3 rounded-xl">
        <img
          src={
            event.user?.avatar ? getImage(event.user.avatar) : "/img/avatar.png"
          }
          alt={event.user?.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#009788]/20"
        />
        <div>
          <p className="text-xs text-gray-500">Dibuat oleh</p>
          <p className="font-semibold text-gray-800">
            {event.user?.name || "Unknown"}
          </p>
        </div>
      </div>

      {/* Nama Acara */}
      <h1 className="font-bold text-2xl mt-6 text-gray-900">{event.name}</h1>

      {/* Jangkauan Acara - Badge */}
      <div className="mt-3">
        <span className="text-sm font-medium text-gray-600">Jangkauan:</span>
        <span
          className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold ${jangkauan.badge}`}
        >
          {jangkauan.label}
        </span>
      </div>

      {/* Detail Info */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5 space-y-4 text-gray-700">
        <div className="flex items-start gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Waktu:
          </span>
          <div className="font-medium">
            <div>{formatWaktu(event.start_at)}</div>
            <div className="text-gray-500">s/d</div>
            <div>{formatWaktu(event.end_at)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Kategori:
          </span>
          <span>{event.category?.name || "-"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Tingkat:
          </span>
          <span>{event.fk_event_level?.name || "-"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Sesi:
          </span>
          <span>{event.session_detail?.length || 0} sesi</span>
        </div>

        {/* Lokasi atau Link */}
        {event.type === "Luring" ? (
          <>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-500 min-w-[80px]">
                Tempat:
              </span>
              <span>{event.address || "-"}</span>
            </div>

            {(event.event_type === "DPW" || event.event_type === "DPD") &&
              event.province && (
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-500 min-w-[80px]">
                    Provinsi:
                  </span>
                  <span className="font-medium text-[#009788]">
                    {event.province?.name}
                  </span>
                </div>
              )}

            {event.event_type === "DPD" && event.city && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-500 min-w-[80px]">
                  Kota/Kab:
                </span>
                <span className="font-medium text-[#009788]">
                  {event.city?.name}, {event.province?.name}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-start gap-3">
            <span className="font-semibold text-gray-500 min-w-[80px]">
              Tautan:
            </span>
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009788] underline break-all"
            >
              {event.link || "-"}
            </a>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Jenis:
          </span>
          <span className="px-3 py-1 bg-[#009788]/10 text-[#009788] rounded-full text-sm font-medium">
            {event.type}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <span className="font-semibold text-gray-500 min-w-[80px]">
            Fasilitas:
          </span>
          <span>{event.facilities || "-"}</span>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mt-7 bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-lg mb-3 text-gray-900">
          Deskripsi Acara
        </h2>
        <div
          className="text-gray-700 text-sm leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: (event.description || "")
              .replace(/\n/g, "<br>")
              .replace(
                /(https?:\/\/[^\s<]+[^\s<.,!?])/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#009788] underline">$1</a>'
              ),
          }}
        />
      </div>

      {/* Tombol Aksi */}
      <div className="mt-10 flex flex-col gap-3">
        {auth?.id === event.user_id ? (
          <>
            <button
              onClick={() => router.push(`/event/${event.id}/token`)}
              className="w-full py-3.5 bg-[#009788] text-white rounded-xl font-semibold hover:bg-[#007a6e] transition"
            >
              Generate Token Acara
            </button>

            <button
              onClick={() => router.push(`/event/${event.id}/peserta`)}
              className="w-full py-3.5 bg-[#009788] text-white rounded-xl font-semibold hover:bg-[#007a6e] transition"
            >
              Lihat Daftar Peserta
            </button>

            <button
              onClick={() => router.push(`/event/edit/${event.id}`)}
              className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              Edit Acara
            </button>

            <button
              onClick={() => router.push(`/event/${event.id}/delete`)}
              className="w-full py-3.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Hapus Acara
            </button>
          </>
        ) : (
          <button
            onClick={() =>
              router.push(`/event/${event.id}/presensi?user=${auth?.id}`)
            }
            className="w-full py-4 bg-[#009788] text-white rounded-xl font-bold text-lg hover:bg-[#007a6e] transition shadow-lg"
          >
            PRESENSI SEKARANG
          </button>
        )}
      </div>
    </div>
  );
}
