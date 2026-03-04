"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

const API_BASE = "https://admin.agpaiidigital.org";

type HasilType = {
  paket: string;
  skor: number;
  kkm: number;
  benar: number;
  total: number;
  waktu_mulai: string;
  waktu_selesai: string;
  soal: {
    id: number;
    pertanyaan: string;
    jawaban_user: string;
    jawaban_benar: string;
    is_benar: boolean;
    pembahasan: string;
  }[];
};

export default function ResultPage() {
  const params = useParams();
  const latihanId = params.id as string;
  const formatTanggalJam = (isoString: string) => {
    if (!isoString) return { tanggal: "-", jam: "-" };

    const date = new Date(isoString);

    const tanggal = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const jam =
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB";

    return { tanggal, jam };
  };

  const [data, setData] = useState<HasilType | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSoal, setOpenSoal] = useState<number | null>(null);

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/cbt/latihan/${latihanId}/hasil`,
        );
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching hasil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHasil();
  }, [latihanId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat hasil latihan...</p>
        </div>
      </div>
    );
  }

  const skor = Number(data.skor);
  const kkm = Number(data.kkm);

  const isLulus = skor >= kkm;
  const persentase = Math.round((data.benar / data.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white pt-10 pb-24 px-6 rounded-b-3xl shadow-2xl relative overflow-hidden">
        {/* Back Button */}
        <Link href="/cbt">
          <button className="absolute top-6 left-6 text-white/90 hover:text-white transition p-2 rounded-full hover:bg-white/10">
            ← Kembali
          </button>
        </Link>

        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold mb-1">{data.paket}</h1>
          <p className="text-sm opacity-80">Hasil Latihan</p>

          {/* Skor Circle dengan SVG */}
          <div className="relative w-40 h-40 mx-auto mt-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeOpacity="0.2"
              />
              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={isLulus ? "#fbbf24" : "#f87171"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${persentase * 3.27} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold">
                {Math.round(Number(data.skor))}
              </span>{" "}
              <span className="text-sm opacity-80">dari 100</span>
            </div>
          </div>

          {/* Status Lulus */}
          <div className="mt-6 flex flex-col items-center gap-2">
            {isLulus ? (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-5 py-2 rounded-full">
                <CheckCircleIcon className="w-6 h-6" />
                <span className="font-semibold">LULUS</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-5 py-2 rounded-full">
                <XCircleIcon className="w-6 h-6" />
                <span className="font-semibold">TIDAK LULUS</span>
              </div>
            )}
            <p className="text-sm opacity-80">
              {data.benar} benar dari {data.total} soal • {persentase}%
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="-mt-16 px-5">
        {/* Detail Pengerjaan */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            Detail Pengerjaan
          </h3>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Waktu Mulai</p>
              <div className="font-medium text-gray-800 mt-1">
                {(() => {
                  const { tanggal, jam } = formatTanggalJam(data.waktu_mulai);
                  return (
                    <>
                      <div>{tanggal}</div>
                      <div className="text-sm text-gray-500">{jam}</div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <p className="text-gray-500">Waktu Selesai</p>
              <div className="font-medium text-gray-800 mt-1">
                {(() => {
                  const { tanggal, jam } = formatTanggalJam(data.waktu_selesai);
                  return (
                    <>
                      <div>{tanggal}</div>
                      <div className="text-sm text-gray-500">{jam}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Pembahasan Soal */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">
          Pembahasan Soal
        </h3>

        <div className="space-y-4">
          {data.soal.map((soal, index) => (
            <div
              key={soal.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() =>
                  setOpenSoal(openSoal === soal.id ? null : soal.id)
                }
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      soal.is_benar ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Soal No. {index + 1}
                    </p>
                    <p
                      className={`text-sm mt-0.5 ${
                        soal.is_benar ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {soal.is_benar ? "Benar" : "Salah"}
                    </p>
                  </div>
                </div>
                <ChevronDownIcon
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    openSoal === soal.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSoal === soal.id && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 animate-fadeIn">
                  <div className="space-y-4 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">
                        Pembahasan:
                      </p>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: soal.pembahasan }}
                      />
                    </div>

                    {/* Always show answers regardless of user input */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100/50">
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                          Jawabanmu
                        </p>
                        <p
                          className={`font-medium ${
                            soal.is_benar ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {soal.jawaban_user || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                          Jawaban Benar
                        </p>
                        <p className="font-medium text-green-600">
                          {soal.jawaban_benar}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
