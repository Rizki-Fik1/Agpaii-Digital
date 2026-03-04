"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/utils/context/auth_context";

const API_BASE = "https://admin.agpaiidigital.org";

type HistoryType = {
  id: number;
  paket: string;
  status: string;
  skor: number;
  kkm: number;
  benar: number;
  total: number;
  waktu_mulai: string;
  waktu_selesai: string;
};

export default function HistoryPage() {
  const { auth } = useAuth();
  const [data, setData] = useState<HistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.id) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/cbt/latihan/history/${auth.id}`,
        );
        const json = await res.json();

        if (json.success) {
          setData(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [auth?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <ArrowPathIcon className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat riwayat latihan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg">
        <div className="flex items-center px-5 py-5">
          <Link href="/cbt">
            <button className="p-3 rounded-full hover:bg-white/10 transition mr-4">
              ←
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Riwayat Latihan
            </h1>
            <p className="text-sm opacity-80 mt-1">
              Lihat semua hasil latihanmu
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 px-5">
        {data.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="text-7xl mb-6 opacity-70">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Belum ada riwayat latihan
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai latihan soal sekarang dan lihat hasilnya di sini nanti!
            </p>
            <Link href="/student/cbt">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 py-3 rounded-2xl transition shadow-md">
                Mulai Latihan
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              const isLulus = item.skor >= item.kkm;
              const tanggal = new Date(item.waktu_mulai).toLocaleDateString(
                "id-ID",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              );

              return (
                <Link key={item.id} href={`/cbt/result/${item.id}`}>
                  <div className="bg-white rounded-2xl mb-5 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4 border-b border-teal-200">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-teal-800">
                          {item.paket}
                        </h3>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-gray-800">
                            {Math.round(item.skor)}
                            <span className="text-base font-normal text-gray-500">
                              /100
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {isLulus ? (
                            <div className="bg-green-100 text-green-700 p-2 rounded-full">
                              <CheckCircleIcon className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="bg-red-100 text-red-700 p-2 rounded-full">
                              <XCircleIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {isLulus ? "Lulus" : "Tidak Lulus"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.benar} benar • {item.total} soal
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1 justify-end">
                            <CalendarIcon className="w-4 h-4" />
                            {tanggal}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar Mini */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isLulus ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (item.skor / 100) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Card */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                      {/* <span>ID: {item.id}</span> */}
                      <span className="font-medium text-teal-600 flex items-center gap-1">
                        Lihat detail →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
