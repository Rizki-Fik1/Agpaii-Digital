'use client';

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import {
  FunnelIcon,
  TrophyIcon,
  ArrowLeftIcon,
  MapPinIcon,
  ChevronRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

/* ===============================
   INTERFACE
================================ */
interface IuranProvince {
  province_id: number;
  province_name: string;
  total_transaksi: number;
}

interface IuranUser {
  user_id: number;
  user_name: string;
  email: string;
  city_name: string | null;
  nominal: number;
  payment_date: string;
}

interface RankingProvince {
  rank: number;
  province_id: number;
  province_name: string;
  total_transaksi: number;
  total_pendaftaran: number;
  total_perpanjangan: number;
}

type ViewMode = "province" | "users" | "ranking";

export default function IuranPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [iuranType, setIuranType] = useState<"all" | "pendaftaran" | "perpanjangan">("all");

  const [view, setView] = useState<ViewMode>("province");
  const [selectedProvince, setSelectedProvince] = useState<IuranProvince | null>(null);

  const [provinces, setProvinces] = useState<IuranProvince[]>([]);
  const [users, setUsers] = useState<IuranUser[]>([]);
  const [ranking, setRanking] = useState<RankingProvince[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentMonthName = () => {
    const now = new Date();
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return monthNames[now.getMonth()];
  };

  const getProvinceTitle = () => {
    if (!startDate || !endDate) return "Data Iuran per Provinsi (Keseluruhan)";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatDate = (date: Date) =>
      date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    return `Data Iuran per Provinsi (${formatDate(start)} - ${formatDate(end)})`;
  };

  async function fetchProvinces() {
    setLoading(true);
    setView("province");
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append("start_date", startDate);
      params.append("end_date", endDate);
    }
    if (iuranType !== "all") params.append("type", iuranType);
    try {
      const res = await fetch(`https://admin.agpaiidigital.org/api/iuran/summary/province?${params}`, { cache: "no-store" });
      const json = await res.json();
      setProvinces(json.data || []);
    } catch (err) {
      console.error("Error fetch provinces:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers(province: IuranProvince) {
    setSelectedProvince(province);
    setView("users");
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append("start_date", startDate);
      params.append("end_date", endDate);
    }
    if (iuranType !== "all") params.append("type", iuranType);
    try {
      const res = await fetch(`https://admin.agpaiidigital.org/api/iuran/province/${province.province_id}/users?${params}`, { cache: "no-store" });
      const json = await res.json();
      setUsers(json.data || []);
    } catch (err) {
      console.error("Error fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRankingThisMonth() {
    setView("ranking");
    setLoading(true);
    try {
      const res = await fetch(`https://admin.agpaiidigital.org/api/iuran/ranking/province/monthly`, { cache: "no-store" });
      const json = await res.json();
      setRanking(json.data || []);
    } catch (err) {
      console.error("Error fetch ranking:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProvinces();
  }, []);

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFBFC] pb-24 md:pb-12">
      <div className="md:hidden">
        <TopBar withBackButton>Data Iuran</TopBar>
      </div>

      {/* =========================================
          DESKTOP HERO BANNER
      ========================================= */}
      <div className="hidden md:block relative bg-gradient-to-r from-[#006557] to-[#004D40] pt-12 pb-24 px-8 xl:px-12 shadow-md overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\\"60\\\" height=\\\"60\\\" viewBox=\\\"0 0 60 60\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"%3E%3Cg fill=\\\"none\\\" fill-rule=\\\"evenodd\\\"%3E%3Cg fill=\\\"%23ffffff\\\" fill-opacity=\\\"1\\\"%3E%3Cpath d=\\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
        ></div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Data Iuran Anggota</h1>
            <p className="text-teal-100 opacity-90 max-w-xl text-sm leading-relaxed">
              Monitoring pembayaran iuran pendaftaran dan perpanjangan secara real-time dari seluruh provinsi.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {view !== "ranking" && (
              <button
                onClick={fetchRankingThisMonth}
                disabled={loading}
                className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 border border-amber-400/30"
              >
                <TrophyIcon className="size-5" />
                <span className="tracking-wide">Top Provinsi Bulan {getCurrentMonthName()}</span>
              </button>
            )}
            {view === "ranking" && (
              <button
                onClick={() => setView("province")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3.5 rounded-xl font-bold transition-all backdrop-blur-md border border-white/20 hover:-translate-x-1"
              >
                <ArrowLeftIcon className="size-5" />
                Kembali ke Data
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-[4.21rem] md:pt-0 px-4 sm:px-6 md:px-8 xl:px-12 py-6 md:py-8 md:-mt-14 relative z-20 max-w-6xl mx-auto">

        {/* =========================================
            MOBILE FILTER CARD
        ========================================= */}
        <div className="md:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="size-5 text-[#009788]" />
            <h3 className="text-base font-semibold text-slate-800">Filter Data</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] text-sm transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] text-sm transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis Iuran</label>
              <select
                value={iuranType}
                onChange={(e) => setIuranType(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] bg-white text-sm transition"
              >
                <option value="all">Semua</option>
                <option value="pendaftaran">Pendaftaran</option>
                <option value="perpanjangan">Perpanjangan</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchProvinces}
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#009788] hover:bg-[#00867a] text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
          >
            {loading ? "Memuat..." : "Terapkan Filter"}
          </button>
        </div>

        {/* =========================================
            DESKTOP FILTER CARD
        ========================================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Dari Tanggal</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] text-sm transition bg-slate-50 hover:bg-white text-slate-700 font-medium" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Sampai Tanggal</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] text-sm transition bg-slate-50 hover:bg-white text-slate-700 font-medium" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Jenis Iuran</label>
              <select 
                value={iuranType} 
                onChange={(e) => setIuranType(e.target.value as any)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009788]/30 focus:border-[#009788] text-sm transition bg-slate-50 hover:bg-white font-medium text-slate-700"
              >
                <option value="all">Semua Jenis</option>
                <option value="pendaftaran">Pendaftaran</option>
                <option value="perpanjangan">Perpanjangan</option>
              </select>
            </div>
            <div className="flex items-end flex-none pt-6">
              <button 
                onClick={fetchProvinces} 
                disabled={loading} 
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                <FunnelIcon className="size-5" />
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            MOBILE RANKING BUTTON (Hidden on Desktop)
        ========================================= */}
        {view !== "ranking" && (
          <button
            onClick={fetchRankingThisMonth}
            disabled={loading}
            className="md:hidden w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-2xl transition disabled:opacity-50 shadow-sm"
          >
            <TrophyIcon className="size-5" />
            Top Provinsi Bulan {getCurrentMonthName()}
          </button>
        )}

        {/* CONTENT AREA */}
        <div className="mt-6 md:mt-0">
          {loading && view !== "users" ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-[#009788] rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* =========================================
                  RANKING VIEW
              ========================================= */}
              {view === "ranking" && (
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 md:px-8 py-4 md:py-6 border-b border-amber-100 flex items-center justify-between">
                    <h2 className="text-base md:text-xl font-bold text-amber-800 flex items-center gap-2 md:gap-3">
                      <div className="bg-amber-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl">
                        <TrophyIcon className="size-5 md:size-6 text-amber-600" />
                      </div>
                      Ranking Bulan {getCurrentMonthName()}
                    </h2>
                    <button
                      onClick={() => setView("province")}
                      className="md:hidden flex items-center gap-1 text-sm text-slate-500 hover:text-[#009788] font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="size-4" />
                      Kembali
                    </button>
                  </div>

                  {ranking.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 md:text-base font-medium text-sm">Belum ada data ranking</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-5 md:px-8 py-4 text-left text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider w-16 md:w-24 border-r border-slate-100">Rank</th>
                            <th className="px-5 md:px-8 py-4 text-left text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100">Provinsi</th>
                            <th className="px-5 md:px-8 py-4 text-right text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider bg-teal-50/50 text-teal-700">Total Transaksi</th>
                            <th className="px-5 md:px-8 py-4 text-right text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Daftar</th>
                            <th className="px-5 md:px-8 py-4 text-right text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Perpanjang</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ranking.map((r) => (
                            <tr key={r.province_id} className={`${r.rank <= 3 ? "bg-amber-50/30" : ""} hover:bg-slate-50/80 transition-colors`}>
                              <td className="px-5 md:px-8 py-4 md:py-5 font-bold text-center border-r border-slate-50">
                                {r.rank <= 3 ? (
                                  <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white inline-flex items-center justify-center text-base md:text-lg shadow-md border-2 border-amber-200">
                                    {r.rank}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 md:text-lg font-semibold">#{r.rank}</span>
                                )}
                              </td>
                              <td className="px-5 md:px-8 py-4 md:py-5 font-bold text-slate-800 text-sm md:text-base border-r border-slate-50">
                                {r.province_name}
                              </td>
                              <td className="px-5 md:px-8 py-4 md:py-5 text-right font-black text-teal-600 text-sm md:text-lg bg-teal-50/20">
                                {r.total_transaksi.toLocaleString("id-ID")}
                              </td>
                              <td className="px-5 md:px-8 py-4 md:py-5 text-right text-sm md:text-base font-semibold text-slate-600 hidden sm:table-cell">{r.total_pendaftaran.toLocaleString("id-ID")}</td>
                              <td className="px-5 md:px-8 py-4 md:py-5 text-right text-sm md:text-base font-semibold text-slate-600 hidden sm:table-cell">{r.total_perpanjangan.toLocaleString("id-ID")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================
                  PROVINCE VIEW
              ========================================= */}
              {view === "province" && (
                <div className="bg-white md:bg-transparent rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none overflow-hidden">
                  
                  {/* MOBILE HEADER */}
                  <div className="md:hidden px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <MapPinIcon className="size-5 text-[#009788]" />
                    <h2 className="text-sm font-semibold text-slate-800">{getProvinceTitle()}</h2>
                  </div>

                  {/* DESKTOP HEADER */}
                  <div className="hidden md:flex mb-6 items-center gap-4">
                    <div className="bg-teal-100 p-2.5 rounded-xl border border-teal-200 shadow-sm">
                      <MapPinIcon className="size-6 text-teal-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{getProvinceTitle()}</h2>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">Pilih provinsi untuk melihat detail anggota yang mendaftar dan perpanjang.</p>
                    </div>
                  </div>

                  {provinces.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 font-medium">Tidak ada data provinsi untuk rentang tanggal tersebut.</div>
                  ) : (
                    <>
                      {/* MOBILE LIST */}
                      <div className="divide-y divide-slate-50 md:hidden">
                        {provinces.map((p) => (
                          <div
                            key={p.province_id}
                            onClick={() => fetchUsers(p)}
                            className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                <MapPinIcon className="size-4 text-[#009788]" />
                              </div>
                              <h3 className="text-sm font-medium text-slate-800 group-hover:text-[#009788] transition-colors">
                                {p.province_name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-base font-bold text-[#009788]">{p.total_transaksi.toLocaleString("id-ID")}</span>
                                <p className="text-[11px] text-slate-400">Transaksi</p>
                              </div>
                              <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-[#009788] transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* DESKTOP GRID */}
                      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {provinces.map((p) => (
                          <div 
                            key={p.province_id} 
                            onClick={() => fetchUsers(p)} 
                            className="bg-white border text-left border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-teal-300 hover:shadow-xl p-5 xl:p-6 rounded-2xl md:rounded-3xl transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                              <div className="bg-teal-50 text-teal-600 p-1.5 rounded-full">
                                <ChevronRightIcon className="size-5" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-5 relative z-10">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-teal-600 transition-colors shadow-sm">
                                <MapPinIcon className="size-6 text-teal-600 group-hover:text-white transition-colors" />
                              </div>
                              <h3 className="text-base font-bold text-slate-700 group-hover:text-teal-700 transition-colors flex-1 pr-6">
                                {p.province_name}
                              </h3>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-end justify-between relative z-10">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
                                <span className="text-2xl font-black text-teal-600">{p.total_transaksi.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* =========================================
                  USERS VIEW
              ========================================= */}
              {view === "users" && selectedProvince && (
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                  <div className="bg-slate-50/50 px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setView("province")}
                      className="md:hidden flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#009788] font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="size-4" />
                      Kembali
                    </button>
                    <button
                      onClick={() => setView("province")}
                      className="hidden md:flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-600 text-slate-600 hover:text-teal-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-x-1"
                    >
                      <ArrowLeftIcon className="size-4" />
                      Kembali ke Provinsi
                    </button>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-teal-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl hidden sm:block">
                        <UserGroupIcon className="size-4 md:size-6 text-teal-700" />
                      </div>
                      <h2 className="text-sm md:text-xl font-bold text-slate-800">{selectedProvince.province_name}</h2>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#009788] rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-400">Memuat data transaksi pengguna...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 md:text-base font-medium text-sm">Tidak ada data pengguna</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-5 md:px-8 py-4 text-left text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Nama & Kontak</th>
                            <th className="px-5 md:px-8 py-4 text-right text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                            <th className="px-5 md:px-8 py-4 text-right text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map((u) => (
                            <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 md:px-8 py-4 md:py-5">
                                <div className="text-sm md:text-base font-bold text-slate-800">{u.user_name}</div>
                                <div className="text-[11px] md:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                  <span>{u.email}</span>
                                  {u.city_name && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="font-medium text-slate-600">{u.city_name}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 md:px-8 py-4 md:py-5 text-right align-middle">
                                <span className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm md:text-base font-bold rounded-lg border border-emerald-100">
                                  Rp {u.nominal.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-5 md:px-8 py-4 md:py-5 text-right align-middle">
                                <span className="text-sm md:text-base font-medium text-slate-600">
                                  {new Date(u.payment_date).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}