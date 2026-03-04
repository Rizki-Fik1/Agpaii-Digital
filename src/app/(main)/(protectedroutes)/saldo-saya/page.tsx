"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

type TopupHistory = {
  id: number;
  amount: number;
  status: "SUCCESS" | "ON_PROGRESS" | "EXPIRED" | "FAILED";
  created_at: string;
  checkout_url?: string;
};

// Updated type to match ACTUAL API response for /history-transaksi
type TransactionHistory = {
  id: number;
  amount: string;           // string karena "-6294.00"
  description: string;      // "PPOB Pulsa", dll
  status: string;           // "ON_PROGRESS", "SUCCESS", dll
  created_at: string;
  // optional fields if needed later
  ref_type?: string;
  ref_id?: number | null;
};

export default function HistoryPage() {
  const { auth } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"saldo" | "transaksi">("saldo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saldo, setSaldo] = useState<number>(0);
  const [topups, setTopups] = useState<TopupHistory[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);

  // Add state for iframe modal
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  const formatRupiah = (value?: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    const absNum = Math.abs(num || 0);
    const formatted = absNum.toLocaleString("id-ID", { maximumFractionDigits: 0 });
    return num < 0 ? `-${formatted}` : formatted;
  };

  useEffect(() => {
    if (!auth || !auth.id) {
      setError("Silakan login terlebih dahulu");
      setLoading(false);
      router.replace("/login");
      return;
    }

    const userId = auth.id;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = `user_id=${userId}`;

        const [walletRes, saldoRes, trxRes] = await Promise.all([
          fetch(`https://admin.agpaiidigital.org/api/agpay/wallet?${query}`),
          fetch(`https://admin.agpaiidigital.org/api/agpay/history-saldo?${query}`),
          fetch(`https://admin.agpaiidigital.org/api/agpay/history-transaksi?${query}`),
        ]);

        const wallet = await walletRes.json();
        const saldoData = await saldoRes.json();
        const trxData = await trxRes.json();

        if (!walletRes.ok) throw new Error(wallet.message || "Gagal memuat saldo");
        if (!saldoRes.ok) throw new Error(saldoData.message || "Gagal memuat history saldo");
        if (!trxRes.ok) throw new Error(trxData.message || "Gagal memuat history transaksi");

        setSaldo(wallet?.balance ?? wallet?.data?.balance ?? 0);
        setTopups(saldoData?.data ?? saldoData?.data?.data ?? []);
        setTransactions(trxData?.data ?? []);

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [auth, router]);

  const statusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    return clsx(
      "text-xs font-semibold px-2.5 py-1 rounded-full",
      s.includes("SUCCESS") ? "bg-green-100 text-green-700" :
      s.includes("ON_PROGRESS") || s.includes("PENDING") ? "bg-yellow-100 text-yellow-700" :
      "bg-red-100 text-red-700"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[480px] mx-auto px-6 sm:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/ecommerce">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#009788]/30 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </Link>
          <Link href="/agpay/topup">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#009788] text-white hover:bg-[#008577] transition-all shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Top Up
            </button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Saldo & Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola saldo dan lihat riwayat transaksi</p>
        </div>

        {/* Saldo Card */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#009788] via-[#00796b] to-[#00695c] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <p className="text-sm opacity-90">Saldo AGPAY Anda</p>
            <p className="text-4xl font-bold mt-2">Rp {formatRupiah(saldo)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <button
            onClick={() => setActiveTab("saldo")}
            className={clsx(
              "flex-1 py-3 text-sm font-semibold transition-all",
              activeTab === "saldo" 
                ? "bg-[#009788] text-white" 
                : "bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            History Top Up
          </button>
          <button
            onClick={() => setActiveTab("transaksi")}
            className={clsx(
              "flex-1 py-3 text-sm font-semibold transition-all",
              activeTab === "transaksi" 
                ? "bg-[#009788] text-white" 
                : "bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            History Transaksi
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#009788]/30 border-t-[#009788] rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 mt-3">Memuat riwayat...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8 bg-red-50 rounded-xl border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && activeTab === "saldo" && (
          <div className="space-y-3">
            {topups.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-500 font-medium">Belum ada riwayat top up</p>
                <p className="text-sm text-slate-400 mt-1">Top up pertama kamu akan muncul di sini</p>
              </div>
            ) : (
              topups.map((item) => (
                <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-xl font-bold text-slate-800">Rp {formatRupiah(item.amount)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className={statusBadge(item.status)}>{item.status}</span>
                  </div>

                  {item.status === "ON_PROGRESS" && item.checkout_url && (
                    <div className="flex justify-end mt-0">
                      <button
                        onClick={() => {
                          setCheckoutUrl(item.checkout_url!);
                          setShowIframe(true);
                        }}
                        className="px-4 py-2 bg-[#009788] hover:bg-[#008577] text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                      >
                        Bayar Sekarang
                      </button>
                    </div>
                  )}

                  {item.status === "EXPIRED" && (
                    <p className="text-xs text-red-500 mt-3 bg-red-50 px-3 py-2 rounded-lg">
                      Transaksi expired, silakan buat top up baru
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && activeTab === "transaksi" && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-500 font-medium">Belum ada riwayat transaksi</p>
                <p className="text-sm text-slate-400 mt-1">Transaksi PPOB kamu akan muncul di sini</p>
              </div>
            ) : (
              transactions.map((trx) => (
                <div key={trx.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xl font-bold text-slate-800">Rp {formatRupiah(trx.amount)}</p>
                      <p className="text-sm text-slate-600 mt-1 font-medium">
                        {(trx.description || "Transaksi PPOB")?.toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(trx.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className={statusBadge(trx.status)}>
                      {(trx.status || "UNKNOWN")?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* IFRAME PAYMENT MODAL */}
      {showIframe && checkoutUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Pembayaran</h3>
              <button
                onClick={() => setShowIframe(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <iframe
              src={checkoutUrl}
              className="w-full h-[80vh]"
              title="Payment Gateway"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}