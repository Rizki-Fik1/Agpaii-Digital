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
  user_id?: number;
  type: string;
  grade?: { id: number; description: string };
  fase?: { id: number; nama_fase: string; deskripsi: string };
  topic: string;
  created_at: string;
  image: string;
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

  // Reposted modules from localStorage
  const [repostedModules, setRepostedModules] = useState<any[]>([]);
  
  // Edit reposted module state
  const [showEditRepostModal, setShowEditRepostModal] = useState(false);
  const [editingRepostModule, setEditingRepostModule] = useState<any>(null);
  const [editRepostData, setEditRepostData] = useState({
    judul: "",
    deskripsi_singkat: "",
    tentang_modul: "",
    tujuan_pembelajaran: "",
    materi: [] as any[],
    assessments: [] as any[],
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Load reposted modules from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("repostedModules");
      if (saved) {
        const modules = JSON.parse(saved);
        // Filter only current user's reposted modules
        if (user?.id) {
          setRepostedModules(modules.filter((m: any) => m.user_id === user.id));
        }
      }
    }
  }, [user?.id, activeTab]);

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
            user_id: module.user_id,
            type: "Materi ajar & RPP",
            topic: module.judul,
            jenjangId: module.jenjang?.id_jenjang || module.jenjang_id,
            faseId: module.fase?.id_fase || module.fase_id,
            grade: {
              id: module.fase?.id_fase || 0,
              description:
                module.fase?.deskripsi || module.fase?.nama_fase || "Kelas",
            },
            fase: {
              id: module.fase?.id_fase || 0,
              nama_fase: module.fase?.nama_fase || "",
              deskripsi: module.fase?.deskripsi || "",
            },
            image: module.thumbnail,
            created_at: module.created_at || new Date().toISOString(),
            downloads: module.downloads_count || 0,
            likes_count: module.likes_count || 0,
          })
        );

        const newCards = append ? [...cards, ...mappedData] : mappedData;

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

    if (selectedJenjang) {
      const jenjangId = parseInt(selectedJenjang);
      filtered = filtered.filter((card) => card.jenjangId === jenjangId);
    }

    if (selectedFase) {
      const faseId = parseInt(selectedFase);
      filtered = filtered.filter((card) => card.faseId === faseId);
    }

    if (sortBy === "likes") {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortBy === "downloads") {
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }

    setFilteredCards(filtered);
  }, [cards, selectedJenjang, selectedFase, sortBy]);

  const handleDelete = async (moduleId: string) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus modul ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/modules-learn/${moduleId}`
      );

      alert("Modul berhasil dihapus!");

      // Refresh data
      setCards([]);
      setPage(1);
      setHasMore(true);
      fetchCards(1, false);
    } catch (error) {
      console.error("Gagal menghapus modul:", error);
      alert("Gagal menghapus modul. Silakan coba lagi.");
    }
  };

  const resolveThumbnail = (thumbnail?: string) => {
    if (!thumbnail) return "/img/thumbnailmodul.png";

    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      return thumbnail;
    }

    if (thumbnail.startsWith("/")) {
      return thumbnail;
    }

    return `http://file.agpaiidigital.org/${thumbnail}`;
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
          <div className="w-1/2">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#006557]"
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
          </div>

          <div className="w-1/2">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#006557]"
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
            onClick={() => setSearchQuery("")}
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
        {activeTab === "mine" && !isLoading && cards.length === 0 && repostedModules.length === 0 && (
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

        {/* Reposted Modules Section - only in Modul Saya tab */}
        {activeTab === "mine" && repostedModules.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Modul Repost ({repostedModules.length})
            </h3>
            <div className="space-y-3">
              {repostedModules.map((item) => (
                <div
                  key={item.id}
                  className="relative flex gap-4 p-4 border-2 border-purple-200 rounded-2xl bg-purple-50/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/modul-ajar/${item.originalId}`)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.thumbnail ? (item.thumbnail.startsWith("http") ? item.thumbnail : `http://file.agpaiidigital.org/${item.thumbnail}`) : "/img/thumbnailmodul.png"}
                        alt={item.judul}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/img/thumbnailmodul.png";
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Repost
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2">{item.judul}</h3>
                    <p className="text-xs text-purple-600 mt-1">
                      Direpost dari {item.repostedFrom}
                    </p>
                    {item.repostedFromSchool && (
                      <p className="text-xs text-gray-400">{item.repostedFromSchool}</p>
                    )}
                  </div>
                  {/* Edit & Delete buttons for reposted module */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRepostModule(item);
                        setEditRepostData({
                          judul: item.judul,
                          deskripsi_singkat: item.deskripsi_singkat || "",
                          tentang_modul: item.tentang_modul || "",
                          tujuan_pembelajaran: item.tujuan_pembelajaran || "",
                          materi: item.materi || [],
                          assessments: item.assessments || [],
                        });
                        setShowEditRepostModal(true);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                      title="Edit Modul"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Hapus modul repost ini dari koleksi Anda?")) {
                          const saved = JSON.parse(localStorage.getItem("repostedModules") || "[]");
                          const updated = saved.filter((m: any) => m.id !== item.id);
                          localStorage.setItem("repostedModules", JSON.stringify(updated));
                          setRepostedModules(updated.filter((m: any) => m.user_id === user?.id));
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                      title="Hapus Modul"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                key={item.id}
                className="relative flex gap-4 p-4 border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                {/* Tombol Edit & Delete - Hanya untuk modul milik sendiri */}
                {user?.id && item.user_id === user.id && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/modul-ajar/edit/${item.id}`);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm text-amber-600 rounded-xl shadow-md hover:bg-amber-50 hover:text-amber-700 transition-all"
                      title="Edit Modul"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl shadow-md hover:bg-red-50 hover:text-red-700 transition-all"
                      title="Hapus Modul"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Area klik untuk detail */}
                <div
                  onClick={() => router.push(`/modul-ajar/${item.id}`)}
                  className="flex gap-4 flex-1"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={resolveThumbnail(item.image)}
                        alt={item.topic}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/img/thumbnailmodul.png";
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[#006557] font-semibold">
                      • {item.fase?.nama_fase || ""} (
                      {item.grade?.description || "Kelas"})
                    </span>
                    <h3 className="font-bold text-gray-800 mt-1 line-clamp-2 text-lg">
                      {item.topic}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Diunggah pada:{" "}
                      {moment(item.created_at).format("DD MMMM YYYY")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                      <span className="font-medium">
                        {item.likes_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                      <span className="font-medium">{item.downloads || 0}</span>
                    </div>
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

      {/* Edit Reposted Module Modal */}
      {showEditRepostModal && editingRepostModule && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowEditRepostModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden my-4">
            {/* Header - Fixed at top */}
            <div className="bg-gradient-to-r from-[#006557] to-[#00806B] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Edit Modul</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-[11px] text-white/70">Direpost dari {editingRepostModule.repostedFrom}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditRepostModal(false)} 
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Judul */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Judul Modul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editRepostData.judul}
                    onChange={(e) => setEditRepostData({ ...editRepostData, judul: e.target.value })}
                    placeholder="Masukkan judul modul..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006557]/30 focus:border-[#006557] focus:bg-white transition"
                  />
                </div>
                
                {/* Deskripsi */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Deskripsi Singkat
                  </label>
                  <textarea
                    value={editRepostData.deskripsi_singkat}
                    onChange={(e) => setEditRepostData({ ...editRepostData, deskripsi_singkat: e.target.value })}
                    placeholder="Jelaskan secara singkat tentang modul ini..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006557]/30 focus:border-[#006557] focus:bg-white transition resize-none"
                  />
                </div>
                
                {/* Tentang Modul */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Tentang Modul
                  </label>
                  <textarea
                    value={editRepostData.tentang_modul}
                    onChange={(e) => setEditRepostData({ ...editRepostData, tentang_modul: e.target.value })}
                    placeholder="Deskripsikan isi dan cakupan modul ini..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006557]/30 focus:border-[#006557] focus:bg-white transition resize-none"
                  />
                </div>
                
                {/* Tujuan Pembelajaran */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Tujuan Pembelajaran
                  </label>
                  <textarea
                    value={editRepostData.tujuan_pembelajaran}
                    onChange={(e) => setEditRepostData({ ...editRepostData, tujuan_pembelajaran: e.target.value })}
                    placeholder="Apa yang akan dipelajari siswa dari modul ini..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006557]/30 focus:border-[#006557] focus:bg-white transition resize-none"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#006557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Dokumen Modul
                  </h4>
                </div>

                {/* Materi Section */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Materi ({editRepostData.materi?.length || 0})
                  </label>
                  {editRepostData.materi && editRepostData.materi.length > 0 ? (
                    <div className="space-y-2">
                      {editRepostData.materi.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.youtube_url ? (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v10l6-5-6-5z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.name || item.judul || `Materi ${index + 1}`}
                            onChange={(e) => {
                              const updated = [...editRepostData.materi];
                              updated[index] = { ...updated[index], name: e.target.value, judul: e.target.value };
                              setEditRepostData({ ...editRepostData, materi: updated });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <button
                            onClick={() => {
                              const updated = editRepostData.materi.filter((_: any, i: number) => i !== index);
                              setEditRepostData({ ...editRepostData, materi: updated });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">Tidak ada materi</p>
                  )}
                  {/* Add Materi Button */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
                        fileInput.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Create a local reference for the file
                            const newMateri = {
                              id: Date.now(),
                              name: file.name,
                              judul: file.name,
                              file_path: URL.createObjectURL(file),
                              file_type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                              localFile: file, // Store file reference for potential upload
                            };
                            setEditRepostData({ 
                              ...editRepostData, 
                              materi: [...editRepostData.materi, newMateri] 
                            });
                          }
                        };
                        fileInput.click();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 border border-dashed border-blue-300 rounded-xl text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload File
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt("Masukkan link YouTube:");
                        if (url && url.includes("youtube") || url?.includes("youtu.be")) {
                          const newMateri = {
                            id: Date.now(),
                            name: "Video YouTube",
                            judul: "Video YouTube",
                            youtube_url: url,
                          };
                          setEditRepostData({ 
                            ...editRepostData, 
                            materi: [...editRepostData.materi, newMateri] 
                          });
                        } else if (url) {
                          alert("Harap masukkan link YouTube yang valid");
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-dashed border-red-300 rounded-xl text-red-600 text-sm font-medium hover:bg-red-100 transition"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v10l6-5-6-5z" />
                      </svg>
                      Link YouTube
                    </button>
                  </div>
                </div>

                {/* Asesmen Section */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Asesmen ({editRepostData.assessments?.length || 0})
                  </label>
                  {editRepostData.assessments && editRepostData.assessments.length > 0 ? (
                    <div className="space-y-2">
                      {editRepostData.assessments.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.youtube_url ? (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v10l6-5-6-5z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.name || item.judul || `Asesmen ${index + 1}`}
                            onChange={(e) => {
                              const updated = [...editRepostData.assessments];
                              updated[index] = { ...updated[index], name: e.target.value, judul: e.target.value };
                              setEditRepostData({ ...editRepostData, assessments: updated });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                          <button
                            onClick={() => {
                              const updated = editRepostData.assessments.filter((_: any, i: number) => i !== index);
                              setEditRepostData({ ...editRepostData, assessments: updated });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">Tidak ada asesmen</p>
                  )}
                  {/* Add Asesmen Button */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
                        fileInput.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newAsesmen = {
                              id: Date.now(),
                              name: file.name,
                              judul: file.name,
                              file_path: URL.createObjectURL(file),
                              file_type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                              localFile: file,
                            };
                            setEditRepostData({ 
                              ...editRepostData, 
                              assessments: [...editRepostData.assessments, newAsesmen] 
                            });
                          }
                        };
                        fileInput.click();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 border border-dashed border-amber-300 rounded-xl text-amber-600 text-sm font-medium hover:bg-amber-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload File
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt("Masukkan link YouTube:");
                        if (url && url.includes("youtube") || url?.includes("youtu.be")) {
                          const newAsesmen = {
                            id: Date.now(),
                            name: "Video YouTube",
                            judul: "Video YouTube",
                            youtube_url: url,
                          };
                          setEditRepostData({ 
                            ...editRepostData, 
                            assessments: [...editRepostData.assessments, newAsesmen] 
                          });
                        } else if (url) {
                          alert("Harap masukkan link YouTube yang valid");
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-dashed border-red-300 rounded-xl text-red-600 text-sm font-medium hover:bg-red-100 transition"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v10l6-5-6-5z" />
                      </svg>
                      Link YouTube
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-100 px-5 py-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditRepostModal(false)}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (!editRepostData.judul.trim()) return;
                    
                    const saved = JSON.parse(localStorage.getItem("repostedModules") || "[]");
                    const updated = saved.map((m: any) => 
                      m.id === editingRepostModule.id 
                        ? { ...m, ...editRepostData }
                        : m
                    );
                    localStorage.setItem("repostedModules", JSON.stringify(updated));
                    
                    setRepostedModules(updated.filter((m: any) => m.user_id === user?.id));
                    setShowEditRepostModal(false);
                    setEditingRepostModule(null);
                  }}
                  disabled={!editRepostData.judul.trim()}
                  className="flex-1 py-3 px-4 bg-[#006557] text-white font-semibold rounded-xl hover:bg-[#005547] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulAjarPage;
