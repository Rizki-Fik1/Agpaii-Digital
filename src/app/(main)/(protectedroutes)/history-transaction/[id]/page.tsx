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
      raw_ppob_callback?: any;  // Tambahan field untuk raw callback PPOB
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

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ["transaction-detail", trxid],
    queryFn: async () => {
      console.log("=== Transaction Query Starting ===");
      console.log("Fetching transaction for trxid:", trxid);
      const res = await API.post("https://mitra.agpaiidigital.org/api/tripay-transaction/check", {
        trxid,
      });
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
          <p className="text-gray-600 font-medium">Data transaksi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const ppob = transaction.data.ppob_transaction;
  const payment = transaction.data.payment_transaction;
  const isFailed = ppob.status_pemesanan == "failed" || (payment && payment.status == "FAILED");

  // Parse raw_ppob_callback jika ada
  const rawCallback = ppob.raw_ppob_callback ? JSON.parse(ppob.raw_ppob_callback) : null;
  const callbackProduk = rawCallback?.produk || ppob.product?.name || "Produk Tidak Diketahui";
  const callbackHarga = rawCallback?.harga ? Number(rawCallback.harga) : Number(ppob.harga);
  const callbackTarget = rawCallback?.target || ppob.phone;
  const callbackNote = rawCallback?.note || null;
  const callbackToken = rawCallback?.token || rawCallback?.sn || null;  // SN/Token untuk pulsa
  const callbackSaldoBefore = rawCallback?.saldo_before_trx || null;
  const callbackSaldoAfter = rawCallback?.saldo_after_trx || null;
  const callbackCreatedAt = rawCallback?.created_at ? moment(rawCallback.created_at).format("DD MMM YYYY HH:mm") : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/history">
          <button className="mb-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 shadow-sm">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Kembali ke Riwayat
          </button>
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Detail Transaksi
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">TRX ID</span>
              <span className="text-gray-900">{ppob.trxid}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Merchant Ref</span>
              <span className="text-gray-900">{ppob.merchant_ref}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Produk</span>
              <span className="text-gray-900">
                {callbackProduk}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Kode Produk</span>
              <span className="text-gray-900">{ppob.code}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Harga</span>
              <span className="text-gray-900 font-medium">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(callbackHarga)}
              </span>
            </div>
            {ppob.phone && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-semibold text-gray-700">Nomor Tujuan</span>
                <span className="text-gray-900">{ppob.phone}</span>
              </div>
            )}
            {ppob.no_meter_pln && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-semibold text-gray-700">No. Meter PLN</span>
                <span className="text-gray-900">{ppob.no_meter_pln}</span>
              </div>
            )}
            {callbackToken && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-semibold text-gray-700">Serial Number / Token</span>
                <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{callbackToken}</span>
              </div>
            )}
            {callbackNote && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-semibold text-gray-700">Catatan Respons</span>
                <span className="text-gray-900">{callbackNote}</span>
              </div>
            )}
            {ppob.voucher_code && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-semibold text-gray-700">Voucher</span>
                <span className="text-gray-900">{ppob.voucher_code}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Tanggal Buat</span>
              <span className="text-gray-900">{moment(ppob.created_at).format("DD MMM YYYY HH:mm")}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Status Pembayaran</span>
              <span
                className={clsx(
                  "font-medium capitalize px-3 py-1 rounded-full",
                  ppob.status_pembayaran === "paid" ? "bg-green-100 text-green-700" :
                  ppob.status_pembayaran === "unpaid" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}
              >
                {ppob.status_pembayaran}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-semibold text-gray-700">Status Pemesanan</span>
              <span
                className={clsx(
                  "font-medium capitalize px-3 py-1 rounded-full",
                  ppob.status_pemesanan === "success" ? "bg-green-100 text-green-700" :
                  ppob.status_pemesanan === "pending" ? "bg-yellow-100 text-yellow-700" :
                  ppob.status_pemesanan === "failed" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                )}
              >
                {ppob.status_pemesanan}
              </span>
            </div>
            {payment && (
              <>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">TriPay Reference</span>
                  <span className="text-gray-900">{payment.reference}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Merchant Reference</span>
                  <span className="text-gray-900">{payment.merchant_ref}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Metode Pembayaran</span>
                  <span className="text-gray-900">{payment.payment_method}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Total Biaya</span>
                  <span className="text-gray-900 font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Status Pembayaran</span>
                  <span
                    className={clsx(
                      "font-medium capitalize px-3 py-1 rounded-full",
                      payment.status === "PAID" ? "bg-green-100 text-green-700" :
                      payment.status === "UNPAID" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Tanggal Pembayaran</span>
                  <span className="text-gray-900">{moment(payment.created_at).format("DD MMM YYYY HH:mm")}</span>
                </div>
              </>
            )}
            {isFailed && (
              <div className="mt-6">
                <a
                  href={`https://wa.me/+628567854448?text=Permenintaan%20Refund%20untuk%20Transaksi%20ID:%20${encodeURIComponent(ppob.trxid)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.669-1.136-.986-.468-.316-.495-.669-.347-.988.148-.319.396-.591.693-.69.297-.099.593-.058.892.058.297.116.892.517 1.364.774.471.257 1.484.698 1.682.998.198.3.296.647.099.945-.198.297-.396.545-.693.645zm4.406-2.379c0 5.523-4.477 10-10 10S2 17.526 2 12.003 6.477 2 12 2s10 4.477 10 10zm-2 0c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8 8-3.589 8-8z"/>
                  </svg>
                  Ajukan Refund via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}