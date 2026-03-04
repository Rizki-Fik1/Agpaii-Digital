"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SearchIcon, ChevronRightIcon } from "lucide-react";
import { cbtService, type CBTPaket } from "@/utils/api/cbt-service";
import { useAuth } from "@/utils/context/auth_context";

interface CBTListProps {
  title: string;
}

export default function CBTList({ title }: CBTListProps) {
  const { auth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<CBTPaket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        if (!auth?.token) {
          setError("Token tidak ditemukan");
          return;
        }

        const response = await cbtService.getPaketList(auth.token);
        if (response.success && response.data) {
          setItems(response.data);
        } else {
          setError(response.message || "Gagal memuat data");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
        console.error("Error fetching CBT paket:", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchPaket();
    }
  }, [auth?.token]);

  const handleStartTest = async (paketId: string) => {
    if (!auth?.token) {
      setError("Token tidak ditemukan");
      return;
    }

    try {
      const response = await cbtService.mulaiLatihan(auth.token, paketId);
      if (response.success) {
        const latihanId = response.data?.id || response.data?.latihan_id;
        window.location.href = `/member/cbt/exam/${latihanId}`;
      } else {
        setError(response.message || "Gagal memulai latihan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 z-10 flex items-center gap-3">
        <Link href="/member">
          <button className="text-white hover:bg-teal-500 rounded-lg p-2">
            ←
          </button>
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari Latihan Soal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-3 px-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const showButton = !item.status || item.status === "belum";
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Left Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                      CBTs
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-teal-700 text-sm mb-1">
                      {item.title}
                    </h3>

                    {/* Subtitle row with icons */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-teal-600"></span>
                        <span>{item.subtitle}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                        <span>{item.totalSoal} Soal</span>
                      </div>
                    </div>

                    {/* Description and Duration */}
                    <p className="text-xs text-gray-500 mb-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {item.duration}
                    </p>

                    {/* Status Badge and Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        {item.status === "belum" && (
                          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                            Belum Dikerjakan
                          </span>
                        )}
                        {item.status === "sedang" && (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Sedang Dikerjakan
                          </span>
                        )}
                        {item.status === "selesai" && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Selesai
                          </span>
                        )}
                      </div>

                      {showButton && (
                        <button
                          onClick={() => handleStartTest(item.id)}
                          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-800 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                        >
                          Mulai Ujian
                          <ChevronRightIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada latihan soal ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
