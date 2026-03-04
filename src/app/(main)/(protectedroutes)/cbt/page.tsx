"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ClockIcon,
  BookOpenIcon,
  ClockIcon as HistoryIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/utils/context/auth_context";

type PaketItem = {
  id: number;
  judul: string;
  kategori: string;
  jumlah_soal: number;
  durasi_menit: number;
  kkm: number;
};

const API_BASE = "https://admin.agpaiidigital.org";

export default function CBTListPage() {
  const { auth } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<PaketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===========================
     FETCH PAKET
  =========================== */
  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cbt/paket`);
        if (!res.ok) throw new Error("Gagal memuat paket");

        const json = await res.json();
        if (json.success) {
          setItems(json.data || []);
        } else {
          setError(json.message || "Gagal memuat data");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchPaket();
  }, []);

  /* ===========================
     MULAI LATIHAN
  =========================== */
  const handleStartTest = async (paketId: number) => {
    try {
      if (!auth?.id) {
        setError("User belum login");
        return;
      }

      // Check for Resume Support
      const resumeId = localStorage.getItem(`cbt_mapper_${paketId}`);
      if (resumeId) {
        // If we have a stored ID, try to resume it
        console.log("Resuming previous session:", resumeId);
        window.location.href = `/cbt/exam/${resumeId}`;
        return;
      }

      const res = await fetch(`${API_BASE}/api/cbt/latihan/mulai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paket_id: paketId,
          user_id: auth.id,
        }),
      });

      if (!res.ok) throw new Error("Gagal memulai latihan");

      const json = await res.json();

      if (json.success) {
        const latihanId = json.latihan_id;
        if (latihanId) {
          // Store mapping for resume
          localStorage.setItem(`cbt_mapper_${paketId}`, String(latihanId));
          window.location.href = `/cbt/exam/${latihanId}`;
        }
      } else {
        setError(json.message || "Gagal memulai latihan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const filteredItems = items.filter((item) =>
    item.judul.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/other">
              <button className="p-2.5 rounded-full hover:bg-white/10 transition">
                ←
              </button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Latihan Soal</h1>
          </div>

          {/* BUTTON HISTORY */}
          <Link href="/cbt/history">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              History
            </button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-5 pb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari paket latihan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 space-y-5">
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">
              Sedang memuat paket latihan...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 shadow-xl text-white"
            >
              <div className="mb-4 text-xs bg-white/20 px-3 py-1 rounded-full w-fit">
                {item.kategori}
              </div>

              <h3 className="text-xl font-bold mb-4">{item.judul}</h3>

              <div className="flex gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  {item.durasi_menit} menit
                </div>

                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5" />
                  {item.jumlah_soal} soal
                </div>
              </div>

              <button
                onClick={() => handleStartTest(item.id)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                Kerjakan Latihan
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Belum ada paket latihan
            </h3>
            <p className="text-gray-600">Coba kata kunci lain</p>
          </div>
        )}
      </div>
    </div>
  );
}
