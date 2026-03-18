"use client";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import Link from "next/link";
import { useState } from "react";
import {
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function KTAPage() {
  const { auth: user } = useAuth();
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showIframe, setShowIframe] = useState(false);

  const isExpired = user.expired_at && new Date() > new Date(user.expired_at);
  const expiryDate = moment(user.expired_at).locale("id").format("LL");

  const handlePayment = async () => {
    const res = await API.post(
      user.user_activated_at !== null ? "/subscribe-fee" : "/membership-fee"
    );
    if (res.status == 200) return res.data.data.payment_url;
  };

  const { mutate: openTransaction, isPending: loadingUrl } = useMutation({
    mutationFn: handlePayment,
    onSuccess: (url) => {
      setPaymentUrl(url);
      setShowIframe(true);
    },
  });

  const closeIframe = () => {
    setShowIframe(false);
    setPaymentUrl(null);
  };

  return (
    <>
      <TopBar withBackButton href="/">KTA Digital</TopBar>
      <div className="pt-[4.21rem] min-h-screen bg-white md:bg-[#FAFBFC]">
        <div className="px-[5%] sm:px-6 md:px-8 lg:px-12 py-6 md:py-10">

          {/* KTA Info Card */}
          <div className="bg-gradient-to-br from-[#004D40] via-[#00695C] to-[#00897B] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <CreditCardIcon className="size-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Kartu Tanda Anggota</p>
                  <p className="text-white font-bold text-lg">AGPAII Digital</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IdentificationIcon className="size-4 text-white/60" />
                    <span className="text-white/60 text-xs">Nomor KTA</span>
                  </div>
                  <p className="font-bold text-lg tracking-wide">{user.kta_id || "-"}</p>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckBadgeIcon className="size-4 text-white/60" />
                    <span className="text-white/60 text-xs">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isExpired ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
                    <p className="font-bold text-lg">{isExpired ? "Expired" : "Aktif"}</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDaysIcon className="size-4 text-white/60" />
                    <span className="text-white/60 text-xs">Iuran Berikutnya</span>
                  </div>
                  <p className="font-bold text-lg">{expiryDate === "Invalid date" ? "-" : expiryDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          {isExpired && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-semibold text-sm">KTA Anda telah expired</p>
                <p className="text-red-500 text-xs mt-0.5">Silakan lakukan iuran untuk memperpajang keanggotaan Anda.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 md:mt-8 space-y-3">
            <Link
              href="/kta/card"
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:shadow-md group ${
                isExpired
                  ? "border-slate-200 bg-slate-50 opacity-50 pointer-events-none"
                  : "border-slate-100 bg-white hover:border-[#009788]/30"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                <CreditCardIcon className="size-5 text-[#009788]" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-semibold text-sm">Lihat Kartu</p>
                <p className="text-xs text-slate-400 mt-0.5">Tampilkan kartu tanda anggota digital</p>
              </div>
              <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-[#009788] transition-colors" />
            </Link>

            <button
              onClick={() => openTransaction()}
              disabled={loadingUrl}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-white hover:border-[#009788]/30 hover:shadow-md transition-all group text-left disabled:opacity-50"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                <BanknotesIcon className="size-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-semibold text-sm">
                  {loadingUrl ? "Memproses..." : "Iuran Sekarang"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Bayar iuran keanggotaan AGPAII</p>
              </div>
              <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            <Link
              href="/kta/payment-history"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-white hover:border-[#009788]/30 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                <ClockIcon className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-semibold text-sm">Riwayat Iuran</p>
                <p className="text-xs text-slate-400 mt-0.5">Lihat riwayat pembayaran iuran</p>
              </div>
              <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Iframe Modal */}
      {showIframe && paymentUrl && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeIframe}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Pembayaran Iuran</h3>
              <button
                onClick={closeIframe}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ×
              </button>
            </div>
            <iframe
              src={paymentUrl}
              className="w-full h-[70vh] border-0"
              title="Pembayaran"
              allow="payment"
            />
          </div>
        </div>
      )}
    </>
  );
}