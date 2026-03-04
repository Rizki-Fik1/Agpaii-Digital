"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import API from "@/utils/api/config";
import Loader from "@/components/loader/loader";
import clsx from "clsx";
import moment from "moment";
import "moment/locale/id";
import { useAuth } from "@/utils/context/auth_context";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";

interface TransactionResponse {
  success: boolean;
  data: {
    ppob_transaction: {
      trxid: string;
      merchant_ref: string;
      user_id: number;
      user?: { name: string };
      product?: { name: string };
      code: string;
      harga: string;
      status_pemesanan: string;
      status_pembayaran: string;
      voucher_code?: string | null;
      created_at: string;
      phone: string;
      no_meter_pln?: string | null;
      order_id?: string | null;
      api_trxid?: string;
      tripay_transaction_id?: number;
      raw_response?: any;
      raw_ppob_callback?: any; // Tambahan field untuk raw callback PPOB
      raw_request?: any;
      jenis_transaksi?: string;
    } | null;
    payment_transaction: {
      reference: string;
      merchant_ref: string;
      payment_method: string;
      amount: number;
      status: string;
      payload: any;
      created_at: string;
    } | null;
  };
}

export default function TransactionDetail() {
  console.log("=== TransactionDetail Debug Start ===");
  const { auth } = useAuth();
  const params = useParams();
  const router = useRouter();

  const trxid = params?.id as string | undefined;

  console.log("Raw useParams output:", params);
  console.log("trxid extracted:", trxid);
  console.log("typeof trxid:", typeof trxid);
  console.log("Auth object:", auth);
  console.log("auth.token exists:", !!auth?.token);

  if (!trxid) {
    console.log("No trxid, redirecting to /history");
    router.push("/history");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-red-600 animate-pulse">
          Invalid transaction ID. Redirecting to history...
        </p>
      </div>
    );
  }

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction-detail", trxid],
    queryFn: async () => {
      console.log("=== Transaction Query Starting ===");
      console.log("Fetching transaction for trxid:", trxid);
      const res = await API.post(
        "https://admin.agpaiidigital.org/api/tripay-transaction/check",
        {
          trxid,
        },
      );
      console.log("Transaction API response status:", res.status);
      console.log("Transaction API response data:", res.data);
      console.log("=== Transaction Query Ended ===");
      return res.status === 200 ? (res.data as TransactionResponse) : null;
    },
    enabled: !!trxid,
  });

  console.log("Transaction useQuery enabled:", !!trxid);
  console.log("Transaction isLoading:", isLoading);
  console.log("Transaction error:", error);
  console.log("Transaction data:", transaction);
  console.log("=== TransactionDetail Debug End ===");

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#009788]/30 border-t-[#009788] rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-600 font-medium">
            Memuat detail transaksi...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Query error:", error);
    return (
      <div className="max-w-lg mx-auto mt-8 px-4 sm:px-6">
        <Link href="/history">
          <button className="mb-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 shadow-sm">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Kembali ke Riwayat
          </button>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 font-medium">
            Error: {error.message || "Gagal memuat data transaksi"}
          </p>
        </div>
      </div>
    );
  }

  if (!transaction || !transaction.data.ppob_transaction) {
    console.log("No transaction data found for trxid:", trxid);
    return (
      <div className="max-w-lg mx-auto mt-8 px-4 sm:px-6">
        <Link href="/history">
          <button className="mb-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 shadow-sm">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Kembali ke Riwayat
          </button>
        </Link>
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">
            Data transaksi tidak ditemukan
          </p>
        </div>
      </div>
    );
  }

  const ppob = transaction.data.ppob_transaction;
  const payment = transaction.data.payment_transaction;
  const isFailed =
    ppob.status_pemesanan == "failed" ||
    (payment && payment.status == "FAILED");

  // Parse raw_ppob_callback jika ada
  const rawCallback = ppob.raw_ppob_callback
    ? JSON.parse(ppob.raw_ppob_callback)
    : null;
  const callbackProduk =
    rawCallback?.produk || ppob.product?.name || "Produk Tidak Diketahui";
  const callbackHarga = rawCallback?.harga
    ? Number(rawCallback.harga)
    : Number(ppob.harga);
  const callbackTarget = rawCallback?.target || ppob.phone;
  const callbackNote = rawCallback?.note || null;
  const callbackToken = rawCallback?.token || rawCallback?.sn || null; // SN/Token untuk pulsa
  const callbackSaldoBefore = rawCallback?.saldo_before_trx || null;
  const callbackSaldoAfter = rawCallback?.saldo_after_trx || null;
  const callbackCreatedAt = rawCallback?.created_at
    ? moment(rawCallback.created_at).format("DD MMM YYYY HH:mm")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <Link href="/history">
          <button className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#009788]/30 transition-all shadow-sm">
            <ChevronLeftIcon className="w-5 h-5" />
            Kembali ke Riwayat
          </button>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#009788] via-[#00796b] to-[#00695c] p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Detail Transaksi</h2>
            <p className="text-sm opacity-90">
              Informasi lengkap transaksi Anda
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Transaction ID */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                TRX ID
              </span>
              <span className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded">
                {ppob.trxid}
              </span>
            </div>

            {/* Merchant Ref */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Merchant Ref
              </span>
              <span className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded">
                {ppob.merchant_ref}
              </span>
            </div>

            {/* Product */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Produk
              </span>
              <span className="text-sm text-slate-900 text-right max-w-[60%]">
                {callbackProduk}
              </span>
            </div>

            {/* Product Code */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Kode Produk
              </span>
              <span className="text-sm text-slate-900 font-mono">
                {ppob.code}
              </span>
            </div>

            {/* Price */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Harga
              </span>
              <span className="text-lg font-bold text-[#009788]">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(callbackHarga)}
              </span>
            </div>

            {/* Phone Number */}
            {ppob.phone && (
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">
                  Nomor Tujuan
                </span>
                <span className="text-sm text-slate-900 font-mono">
                  {ppob.phone}
                </span>
              </div>
            )}

            {/* PLN Meter */}
            {ppob.no_meter_pln && (
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">
                  No. Meter PLN
                </span>
                <span className="text-sm text-slate-900 font-mono">
                  {ppob.no_meter_pln}
                </span>
              </div>
            )}

            {/* Token/SN */}
            {callbackToken && (
              <div className="pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600 block mb-2">
                  Serial Number / Token
                </span>
                <div className="bg-[#009788]/5 border border-[#009788]/20 rounded-lg p-3">
                  <span className="text-sm text-slate-900 font-mono font-bold break-all">
                    {callbackToken}
                  </span>
                </div>
              </div>
            )}

            {/* Response Note */}
            {callbackNote && (
              <div className="pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600 block mb-2">
                  Catatan Respons
                </span>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  {callbackNote}
                </p>
              </div>
            )}

            {/* Voucher */}
            {ppob.voucher_code && (
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">
                  Voucher
                </span>
                <span className="text-sm text-[#009788] font-semibold bg-[#009788]/10 px-3 py-1 rounded-full">
                  {ppob.voucher_code}
                </span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Tanggal Buat
              </span>
              <span className="text-sm text-slate-900">
                {moment(ppob.created_at).format("DD MMM YYYY HH:mm")}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Status Pembayaran
              </span>
              <span
                className={clsx(
                  "text-xs font-semibold px-3 py-1.5 rounded-full",
                  ppob.status_pembayaran === "paid"
                    ? "bg-green-100 text-green-700"
                    : ppob.status_pembayaran === "unpaid"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700",
                )}
              >
                {ppob.status_pembayaran?.toUpperCase()}
              </span>
            </div>

            {/* Order Status */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Status Pemesanan
              </span>
              <span
                className={clsx(
                  "text-xs font-semibold px-3 py-1.5 rounded-full",
                  ppob.status_pemesanan === "success"
                    ? "bg-green-100 text-green-700"
                    : ppob.status_pemesanan === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : ppob.status_pemesanan === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700",
                )}
              >
                {ppob.status_pemesanan?.toUpperCase()}
              </span>
            </div>

            {/* Payment Transaction Details */}
            {payment && (
              <>
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Informasi Pembayaran
                  </h3>
                </div>

                <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">
                    TriPay Reference
                  </span>
                  <span className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded">
                    {payment.reference}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">
                    Metode Pembayaran
                  </span>
                  <span className="text-sm text-slate-900 font-medium">
                    {payment.payment_method}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">
                    Total Biaya
                  </span>
                  <span className="text-lg font-bold text-[#009788]">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(payment.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">
                    Status Pembayaran
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-semibold px-3 py-1.5 rounded-full",
                      payment.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "UNPAID"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-4">
                  <span className="text-sm font-semibold text-slate-600">
                    Tanggal Pembayaran
                  </span>
                  <span className="text-sm text-slate-900">
                    {moment(payment.created_at).format("DD MMM YYYY HH:mm")}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Refund Button for Failed Transactions */}
          {isFailed && (
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <a
                href={`https://wa.me/+628567854448?text=Permintaan%20Refund%20untuk%20Transaksi%20ID:%20${encodeURIComponent(ppob.trxid)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#009788] text-white rounded-xl hover:bg-[#008577] transition-all shadow-md font-semibold"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.669-1.136-.986-.468-.316-.495-.669-.347-.988.148-.319.396-.591.693-.69.297-.099.593-.058.892.058.297.116.892.517 1.364.774.471.257 1.484.698 1.682.998.198.3.296.647.099.945-.198.297-.396.545-.693.645zm4.406-2.379c0 5.523-4.477 10-10 10S2 17.526 2 12.003 6.477 2 12 2s10 4.477 10 10zm-2 0c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8 8-3.589 8-8z" />
                </svg>
                Ajukan Refund via WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
