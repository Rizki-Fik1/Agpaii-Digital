"use client";

import TopBar from "@/components/nav/topbar";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";

interface JenjangOption {
  id: number;
  description: string;
  name: string;
}

interface FaseOption {
  id: number;
  name: string;
  description: string;
  kelas: string;
  jenjang: { id_jenjang: number };
  id_jenjang?: number;
}

interface CardData {
  id: string;
  type: string;
  grade?: { id: number; description: string };
  topic: string;
  created_at: string;
  image: string;
  user_id?: number;
  downloads?: number;
  likes_count?: number;
  jenjangId?: number;
  faseId?: number;
}

const ModulAjarPage: React.FC = () => {
  const router = useRouter();
  const { auth: user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [cards, setCards] = useState<CardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "downloads">(
    "likes"
  );

  // Filter states
  const [jenjangOptions, setJenjangOptions] = useState<JenjangOption[]>([]);
  const [allFaseOptions, setAllFaseOptions] = useState<FaseOption[]>([]);
  const [faseOptions, setFaseOptions] = useState<FaseOption[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string>("");
  const [selectedFase, setSelectedFase] = useState<string>("");

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Fetch Jenjang & Fase
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const jenjangRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/jenjang`
        );
        setJenjangOptions(
          jenjangRes.data.data.map((j: any) => ({
            id: j.id_jenjang,
            name: j.nama_jenjang || j.jenjang || "",
            description: j.nama_jenjang || j.jenjang || "",
          }))
        );

        const faseRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/fase`
        );
        setAllFaseOptions(
          faseRes.data.data.map((f: any) => ({
            id: f.id_fase,
            name: f.nama_fase || "",
            description: f.deskripsi || f.nama_fase || "",
            kelas: f.deskripsi || "Tidak diketahui",
            jenjang: f.jenjang || { id_jenjang: f.id_jenjang },
            id_jenjang: f.id_jenjang || f.jenjang?.id_jenjang,
          }))
        );
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  // Update fase options berdasarkan jenjang
  useEffect(() => {
    if (selectedJenjang) {
      const jenjangId = parseInt(selectedJenjang);
      setFaseOptions(
        allFaseOptions.filter(
          (f) =>
            f.jenjang?.id_jenjang === jenjangId || f.id_jenjang === jenjangId
        )
      );
    } else {
      setFaseOptions([]);
    }
    setSelectedFase("");
  }, [selectedJenjang, allFaseOptions]);

  // Fungsi fetch data
  const fetchCards = async (currentPage: number, append: boolean = false) => {
    try {
      setIsLoading(true);

      let endpoint = "";

      if (activeTab === "all") {
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn?page=${currentPage}&limit=10`;
      } else {
        if (!user?.id) {
          setIsLoading(false);
          setHasMore(false);
          return;
        }
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/user/${user.id}`;
      }

      if (searchQuery) {
        endpoint += `${
          endpoint.includes("?") ? "&" : "?"
        }search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await axios.get(endpoint);

      if (response.data.data && response.data.data.length > 0) {
        const mappedData: CardData[] = response.data.data.map(
          (module: any) => ({
            id: module.id.toString(),
            type: "Materi ajar & RPP",
            topic: module.judul,
            jenjangId: module.jenjang?.id_jenjang || module.jenjang_id,
            faseId: module.fase?.id_fase || module.fase_id,
            grade: {
              id: module.fase?.id_fase || 0,
              description:
                module.fase?.deskripsi || module.fase?.nama_fase || "Kelas",
            },
            image: module.image || "/img/thumbnailmodul.png",
            created_at: module.created_at || new Date().toISOString(),
            downloads: module.downloads_count || 0,
            likes_count: module.likes_count || 0,
            user_id: module.user_id,
          })
        );

        const newCards = append ? [...cards, ...mappedData] : mappedData;

        // Hapus duplikat berdasarkan id
        const uniqueCards = Array.from(
          new Map(newCards.map((item) => [item.id, item])).values()
        );

        setCards(uniqueCards);
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset dan fetch saat tab/search berubah
  useEffect(() => {
    setCards([]);
    setFilteredCards([]);
    setPage(1);
    setHasMore(true);
    fetchCards(1, false);
  }, [activeTab, user?.id, searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchCards(page, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [page, hasMore, isLoading]);

  // Filter + Sorting lokal
  useEffect(() => {
    let filtered = [...cards];

    // Filter jenjang
    if (selectedJenjang) {
      const jenjangId = parseInt(selectedJenjang);
      filtered = filtered.filter((card) => card.jenjangId === jenjangId);
    }

    // Filter fase
    if (selectedFase) {
      const faseId = parseInt(selectedFase);
      filtered = filtered.filter((card) => card.faseId === faseId);
    }

    // Sorting
    if (sortBy === "likes") {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortBy === "downloads") {
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }
    // latest: urutan dari server sudah latest

    setFilteredCards(filtered);
  }, [cards, selectedJenjang, selectedFase, sortBy]);

  const handleSearch = () => {
    setSearchQuery(""); // opsional: reset query setelah pencarian
    // trigger useEffect via dependency searchQuery
  };

  return (
    <div className="pt-[5.21rem] bg-white min-h-screen">
      <TopBar withBackButton tambahButton="/perangkat-ajar/tambah">
        Materi Ajar
      </TopBar>

      {/* Hero Banner */}
      <div className="mx-4 mt-4 bg-[#006557] rounded-2xl p-4 flex items-center gap-4">
        <div className="bg-[#00806B] rounded-xl p-3">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">
            Belajar, Berkembang, dan Menginspirasi
          </h2>
          <p className="text-white/80 text-sm">
            Dirancang oleh guru, untuk guru.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 px-4 mt-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-[#006557] text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("all")}
        >
          Semua Modul
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "bg-[#006557] text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("mine")}
        >
          Modul Saya
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          Mau cari materi apa?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cari materi berdasarkan filter pencarian
        </p>

        <div className="flex gap-2 mb-3">
          <select
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
            value={selectedJenjang}
            onChange={(e) => setSelectedJenjang(e.target.value)}
          >
            <option value="">Pilih Jenjang</option>
            {jenjangOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <select
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
            value={selectedFase}
            onChange={(e) => setSelectedFase(e.target.value)}
            disabled={!selectedJenjang}
          >
            <option value="">Pilih Fase</option>
            {faseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.kelas})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
          >
            <option value="likes">Paling Disukai</option>
            <option value="downloads">Paling Banyak Diunduh</option>
            <option value="latest">Terbaru</option>
          </select>

          <button
            onClick={handleSearch}
            className="flex-1 py-3 bg-white border border-gray-300 rounded-full text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Cari materi ajar
          </button>
        </div>
      </div>

      {/* Card List */}
      <div className="px-4 pb-6">
        {activeTab === "mine" && !isLoading && cards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Anda belum memiliki modul ajar.
            </p>
            <button
              className="px-6 py-2 bg-[#006557] text-white rounded-lg font-medium"
              onClick={() => router.push("/perangkat-ajar/tambah")}
            >
              Buat Modul Ajar
            </button>
          </div>
        )}

        {filteredCards.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700">Menampilkan hasil pencarian</p>
            <p className="text-[#006557] font-medium">
              {filteredCards.length} hasil
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isLoading && cards.length === 0 ? (
            <p className="text-center py-8">Loading...</p>
          ) : filteredCards.length === 0 && !isLoading ? (
            <p className="text-center text-gray-500 py-8">
              Tidak ada modul ajar ditemukan
            </p>
          ) : (
            filteredCards.map((item) => (
              <div
                onClick={() => router.push(`/modul-ajar/${item.id}`)}
                key={item.id}
                className="flex gap-3 p-3 border rounded-xl bg-white hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <img
                    src={
                      item.image?.startsWith("/")
                        ? item.image
                        : `${process.env.NEXT_PUBLIC_MITRA_URL}/public/${item.image}`
                    }
                    alt={item.topic}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/img/modul-placeholder.png";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[#006557] font-medium">
                    • {item.grade?.description || "Kelas"}
                  </span>
                  <h3 className="font-semibold text-gray-800 mt-1 line-clamp-1">
                    {item.topic}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Diunggah pada:{" "}
                    {moment(item.created_at).format("MMM DD YYYY")}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-center gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span>{item.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>{item.downloads || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && !isLoading && filteredCards.length > 0 && (
          <div ref={observerRef} className="h-10" />
        )}

        {isLoading && filteredCards.length > 0 && (
          <div className="text-center py-4">
            <p>Loading more...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulAjarPage;
