"use client";

import TopBar from "@/components/nav/topbar";
import { useRouter, useParams } from "next/navigation";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";
import Link from "next/link";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { auth } = useAuth();

  const fetchEvent = async () => {
    const res = await API.get("/event/" + id);
    return res.status === 200 ? res.data : null;
  };

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: fetchEvent,
  });

  const formatWaktu = (date) =>
    moment(date).locale("id").format("dddd, DD MMMM YYYY - HH:mm") + " WIB";

  if (!event) return null;

  return (
    <div className="pt-[4.21rem] px-5 pb-10">
      <TopBar withBackButton href="https://web.agpaiidigital.org/event/">
        Detail Event
      </TopBar>


      {/* Gambar */}
      <div className="mt-6 w-full aspect-video rounded-md overflow-hidden">
        <img
          src={
            event.image ? getImage(event.image) : "/img/agpaii_splash.svg"
          }
          className="w-full h-full object-cover"
        />
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mt-4 bg-white shadow px-3 py-2 rounded-md w-fit">
        <img
          src={event.user?.avatar ? getImage(event.user.avatar) : "/img/avatar.png"}
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="text-sm font-medium">{event.user?.name}</p>
      </div>

      {/* Nama */}
      <h1 className="font-semibold text-xl mt-5">{event.name}</h1>

      {/* Info Detail */}
      <div className="mt-4 flex flex-col gap-3 text-sm text-gray-700">
        <div>
          <span className="font-semibold text-gray-500">Waktu:</span>
          <div className="font-medium">
            {formatWaktu(event.start_at)}
            <br />
            {formatWaktu(event.end_at)}
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-500">Kategori:</span>{" "}
          {event.category?.name}
        </div>

        <div>
          <span className="font-semibold text-gray-500">Tingkat:</span>{" "}
          {event.fk_event_level?.name}
        </div>

        <div>
          <span className="font-semibold text-gray-500">Sesi:</span>{" "}
          {event.session_detail?.length} sesi
        </div>

        {event.type === "Luring" ? (
          <>
            <div>
              <span className="font-semibold text-gray-500">Tempat:</span>{" "}
              {event.address}
            </div>

            {event.city && (
              <div>
                <span className="font-semibold text-gray-500">Kota:</span>{" "}
                {event.city?.name + " - " + event.province?.name}
              </div>
            )}
          </>
        ) : (
          <div>
            <span className="font-semibold text-gray-500">Tautan:</span>{" "}
            <a
              href={event.link}
              className="text-blue-500 underline"
              target="_blank"
            >
              {event.link}
            </a>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-500">Fasilitas:</span>{" "}
          {event.facilities}
        </div>

        <div>
          <span className="font-semibold text-gray-500">Jenis:</span>{" "}
          {event.type}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mt-6">
        <h1 className="font-semibold text-lg mb-2">Deskripsi</h1>
        <div
          className="text-gray-700 text-sm"
          dangerouslySetInnerHTML={{
            __html: event.description
              ?.replace(/\n/g, "<br>")
              .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$&" target="_blank" class="text-blue-500 underline">$&</a>'
              ),
          }}
        ></div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-10 flex flex-col gap-3">
        {auth?.id === event.user_id ? (
          <>
            {/* Generate Token */}
            <button
              onClick={() => router.push(`/event/${event.id}/token`)}
              className="w-full py-3 bg-[#009788] text-white rounded-md"
            >
              Generate Token Acara
            </button>
        
         {/* List Peserta */}
            <button
              onClick={() =>
                router.push(`/event/${event.id}/peserta`)
              }
              className="w-full py-3 bg-[#009788] text-white rounded-md"
            >
              List Peserta
            </button>

            {/* Edit */}
            <button
              onClick={() =>
                router.push(`/event/edit/${event.id}`)
              }
              className="w-full py-3 bg-[#009788] text-white rounded-md"
            >
              Edit
            </button>

            {/* Hapus */}
            <button
              onClick={() => router.push(`/event/${event.id}/delete`)}
              className="w-full py-3 bg-red-500 text-white rounded-md"
            >
              Hapus Acara
            </button>
          </>
        ) : (
          <>
            {/* Tombol PRESENSI */}
            <button
              onClick={() =>
                router.push(`/event/${event.id}/presensi?user=${auth?.id}`)
              }
              className="w-full py-3 bg-[#009788] text-white rounded-md"
            >
              Presensi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
