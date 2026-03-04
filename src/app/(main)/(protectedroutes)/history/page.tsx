"use client";

import { useQuery } from "@tanstack/react-query";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import moment from "moment";
import "moment/locale/id";
import { useState } from "react";
import clsx from "clsx";
import Loader from "@/components/loader/loader";
import Link from "next/link";

export default function HistoryPage() {
  const { auth } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["all-transactions", auth?.id, statusFilter],
    queryFn: async () => {
      if (!auth?.id) return [];
      const res = await API.get(
        `https://admin.agpaiidigital.org/api/ppob-transactions/history/${auth.id}`,
      );
      if (res.status === 200) {
        let data = res.data.data;

        // Filter berdasarkan status pemesanan
        if (statusFilter === "berhasil") {
          data = data.filter((t: any) => t.status_pemesanan === "success");
        } else if (statusFilter === "pending") {
          data = data.filter((t: any) => t.status_pemesanan === "pending");
        } else if (statusFilter === "gagal") {
          data = data.filter((t: any) => t.status_pemesanan === "failed");
        }

        return data;
      }
      return [];
    },
    enabled: !!auth?.id,
  });

  return (
    <div className="max-w-[480px] mx-auto px-6 sm:px-8 py-6">
      {/* Tombol Back - Modern Design */}
      <div className="mb-6">
        <Link
          href="/ecommerce"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#009788]/30 transition-all shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <p className="text-sm text-slate-500 mt-1">Semua transaksi PPOB Anda</p>
      </div>

      {/* Filter - Modern Design */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "Semua" },
          { key: "berhasil", label: "Berhasil" },
          { key: "pending", label: "Pending" },
          { key: "gagal", label: "Gagal" },
        ].map((status) => (
          <button
            key={status.key}
            onClick={() => setStatusFilter(status.key)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              statusFilter === status.key
                ? "bg-[#009788] text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-[#009788]/30",
            )}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* List Transaksi - Modern Design */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="size-8" />
        </div>
      ) : transactions?.length > 0 ? (
        <div className="space-y-5">
          {transactions.map((transaction: any) => {
            // Logika status yang sama dengan ecommerce page
            const isPaid = transaction.status_pembayaran === "paid";
            const isSuccess = transaction.status_pemesanan === "success";
            const isFailed = transaction.status_pemesanan === "failed";
            const isPending = transaction.status_pemesanan === "pending";

            let finalStatus = "";
            let statusColor = "";

            if (isFailed) {
              finalStatus = "Pesanan Gagal";
              statusColor = "bg-red-100 text-red-700";
            } else if (isSuccess && isPaid) {
              finalStatus = "Pesanan Berhasil";
              statusColor = "bg-green-100 text-green-700";
            } else if (isSuccess && !isPaid) {
              finalStatus = "Menunggu Pembayaran";
              statusColor = "bg-yellow-100 text-yellow-700";
            } else if (isPending) {
              finalStatus = "Sedang Diproses";
              statusColor = "bg-blue-100 text-blue-700";
            } else {
              finalStatus = "Status Tidak Diketahui";
              statusColor = "bg-gray-100 text-gray-700";
            }

            return (
              <Link
                href={`/history-transaction/${transaction.trxid}`}
                key={transaction.trxid}
              >
                <div className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#009788]/40 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#009788]/20 to-[#009788]/10 rounded-lg flex items-center justify-center group-hover:from-[#009788]/30 group-hover:to-[#009788]/20 transition-all">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-[#009788]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {transaction.product?.name ??
                              (transaction.raw_response?.success &&
                              transaction.raw_response?.data?.produk
                                ? transaction.raw_response.data.produk
                                : "Produk Tidak Diketahui")}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {transaction.trxid}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {moment(transaction.created_at).format(
                              "DD MMM YYYY, HH:mm",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-800">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(Number(transaction.harga))}
                      </p>
                      <div className="mt-2">
                        <span
                          className={clsx(
                            "text-[10px] font-medium px-2.5 py-1 rounded-full inline-block",
                            statusColor,
                          )}
                        >
                          {finalStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {transaction.voucher_code && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-[#009788]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <p className="text-xs text-slate-600 font-medium">
                          Voucher:{" "}
                          <span className="text-[#009788]">
                            {transaction.voucher_code}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Belum ada transaksi
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Transaksi Anda akan muncul di sini
          </p>
        </div>
      )}
    </div>
  );
}
