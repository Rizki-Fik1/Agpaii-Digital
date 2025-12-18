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
        `https://mitra.agpaiidigital.org/api/ppob-transactions/history/${auth.id}`
      );
      if (res.status === 200) {
        let data = res.data.data;
        if (statusFilter !== "all") {
          data = data.filter(
            (t: any) => t.status_pembayaran === statusFilter
          );
        }
        return data;
      }
      return [];
    },
    enabled: !!auth?.id,
  });

  return (
    <div className="max-w-[480px] mx-auto px-6 sm:px-8 py-6">
      {/* Tombol Back */}
      <div className="mb-4">
        <Link
          href="/ecommerce"
          className="inline-block px-4 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
        >
          ← Kembali ke Ecommerce
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">Riwayat Transaksi</h2>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "paid", "unpaid", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={clsx(
              "px-3 py-1 rounded-md text-sm border",
              statusFilter === status
                ? "bg-[#009788] text-white border-[#009788]"
                : "bg-white text-slate-600 border-slate-300"
            )}
          >
            {status === "all"
              ? "Semua"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* List Transaksi */}
      {isLoading ? (
        <div className="flex justify-center">
          <Loader className="size-8" />
        </div>
      ) : transactions?.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction: any) => (
          
            <Link href={`/history-transaction/${transaction.trxid}`}>
            <div
              key={transaction.trxid}
              className="p-4 bg-white shadow-md rounded-lg border border-slate-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {transaction.product?.name ?? 
                     (transaction.raw_response?.success && transaction.raw_response?.data?.produk 
                      ? transaction.raw_response.data.produk 
                      : 'Produk Tidak Diketahui')}
                  </p>
                  <p className="text-xs text-slate-500">{transaction.trxid}</p>
                  <p className="text-xs text-slate-500">
                    {moment(transaction.created_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(Number(transaction.harga))}
                  </p>
                  <p
                    className={clsx(
                      "text-xs capitalize",
                      transaction.status_pembayaran === "paid"
                        ? "text-green-600"
                        : transaction.status_pembayaran === "unpaid"
                        ? "text-yellow-600"
                        : "text-red-600"
                    )}
                  >
                    Pembayaran: {transaction.status_pembayaran}
                  </p>
                  <p
                    className={clsx(
                      "text-xs capitalize",
                      transaction.status_pemesanan === "success"
                        ? "text-green-600"
                        : transaction.status_pemesanan === "pending"
                        ? "text-yellow-600"
                        : transaction.status_pemesanan === "failed"
                        ? "text-red-600"
                        : "text-gray-600"
                    )}
                  >
                    Pemesanan: {transaction.status_pemesanan}
                  </p>
                </div>
              </div>
              {transaction.voucher_code && (
                <p className="text-xs text-slate-500 mt-2">
                  Voucher: {transaction.voucher_code}
                </p>
              )}
            </div>
              
			</Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center">
          Belum ada transaksi
        </p>
      )}
    </div>
  );
}