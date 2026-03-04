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
    <div className="min-h-screen bg-white md:bg-[#FAFBFC]">
      <TopBar withBackButton>Data Iuran</TopBar>

      <div className="pt-[4.21rem] px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">

        {/* FILTER CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 mt-2">
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

        {/* RANKING BUTTON */}
        {view !== "ranking" && (
          <button
            onClick={fetchRankingThisMonth}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-2xl transition disabled:opacity-50 shadow-sm"
          >
            <TrophyIcon className="size-5" />
            Top Provinsi Bulan {getCurrentMonthName()}
          </button>
        )}

        {/* CONTENT AREA */}
        <div className="mt-6">
          {loading && view !== "users" ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* RANKING VIEW */}
              {view === "ranking" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 md:px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-amber-800 flex items-center gap-2">
                      <TrophyIcon className="size-5 text-amber-600" />
                      Ranking Bulan {getCurrentMonthName()}
                    </h2>
                    <button
                      onClick={() => setView("province")}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#009788] font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="size-4" />
                      Kembali
                    </button>
                  </div>

                  {ranking.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">Belum ada data ranking</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provinsi</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Daftar</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Perpanjang</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ranking.map((r) => (
                            <tr key={r.province_id} className={`${r.rank <= 3 ? "bg-amber-50/50" : ""} hover:bg-slate-50 transition`}>
                              <td className="px-5 py-4 font-bold text-center">
                                {r.rank <= 3 ? (
                                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center text-sm">{r.rank}</span>
                                ) : (
                                  <span className="text-slate-400">#{r.rank}</span>
                                )}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-800 text-sm">{r.province_name}</td>
                              <td className="px-5 py-4 text-right font-bold text-[#009788] text-sm">{r.total_transaksi.toLocaleString("id-ID")}</td>
                              <td className="px-5 py-4 text-right text-sm text-slate-500 hidden sm:table-cell">{r.total_pendaftaran.toLocaleString("id-ID")}</td>
                              <td className="px-5 py-4 text-right text-sm text-slate-500 hidden sm:table-cell">{r.total_perpanjangan.toLocaleString("id-ID")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PROVINCE VIEW */}
              {view === "province" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <MapPinIcon className="size-5 text-[#009788]" />
                    <h2 className="text-sm font-semibold text-slate-800">{getProvinceTitle()}</h2>
                  </div>

                  {provinces.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">Tidak ada data provinsi</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {provinces.map((p) => (
                        <div
                          key={p.province_id}
                          onClick={() => fetchUsers(p)}
                          className="px-5 md:px-6 py-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
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
                  )}
                </div>
              )}

              {/* USERS VIEW */}
              {view === "users" && selectedProvince && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setView("province")}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#009788] font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="size-4" />
                      Kembali
                    </button>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="size-4 text-[#009788]" />
                      <h2 className="text-sm font-semibold text-slate-800">{selectedProvince.province_name}</h2>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">Tidak ada data pengguna</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map((u) => (
                            <tr key={u.user_id} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-4">
                                <div className="text-sm font-medium text-slate-800">{u.user_name}</div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-semibold text-emerald-600">Rp {u.nominal.toLocaleString("id-ID")}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm text-slate-500">
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