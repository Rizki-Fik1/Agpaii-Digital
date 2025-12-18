"use client";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import Link from "next/link";
import { useState } from "react";

export default function KTAPage() {
  const { auth: user } = useAuth();
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showIframe, setShowIframe] = useState(false);

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
    setPaymentUrl(null); // Optional: reset URL jika diperlukan
  };

  return (
    <>
      <TopBar withBackButton>KTA Digital</TopBar>
      <div className="py-16 px-[5%] sm:px-6">
        <div className="mt-8 bg-[#009788] flex gap-6 p-5 rounded-lg text-white shadow-md">
          <div className="flex flex-col gap-2.5">
            <div>
              <h1 className="text-sm text-slate-200">
                Nomor Kartu Tanda Anggota
              </h1>
              <p className="font-semibold text-base">{user.kta_id}</p>
            </div>
            <div>
              <h1 className="text-sm text-slate-200">Status</h1>
              <p className="font-semibold text-base">
                {user.expired_at && new Date() > new Date(user.expired_at)
                  ? "Expired"
                  : "Aktif"}
              </p>
            </div>
            <div>
              <h1 className="text-sm text-slate-200">
                Iuran Berikutnya Tanggal
              </h1>
              <p className="font-semibold text-base">
                {moment(user.expired_at).locale("id").format("LL") ==
                "Invalid date"
                  ? "-"
                  : moment(user.expired_at).locale("id").format("LL")}
              </p>
            </div>
          </div>
          {/* <CreditCardIcon className="size-28 ms-auto" /> */}
        </div>
        <div className="mt-10 flex flex-wrap *:w-[48%] *:flex-grow *:text-white *:text-center *:shadow-md *:px-4 *:py-2.5 *:rounded-md font-medium gap-3">
          <button
            disabled={user.expired_at && new Date() > new Date(user.expired_at)}
            className="flex *:w-full bg-transparent shadow-md border border-slate-300 *:text-[#009788]"
          >
            <Link className="text-sm" href={"/kta/card"}>
              Lihat Kartu
            </Link>
          </button>
          <button
            onClick={() => openTransaction()}
            disabled={loadingUrl}
            className="bg-[#009788] text-slate-200 text-sm"
          >
            Iuran Sekarang
          </button>
          <Link
            className="bg-[#009788] text-sm text-slate-200"
            href={"/kta/payment-history"}
          >
            Riwayat Iuran
          </Link>
        </div>
      </div>

      {/* Overlay untuk Iframe */}
      {showIframe && paymentUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={closeIframe} // Klik di luar iframe → tutup
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Agar klik di dalam modal tidak menutup
          >
            {/* Tombol Close - diperbesar */}
            <button
              onClick={closeIframe}
              className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold text-gray-800 hover:bg-gray-100 transition z-10"
              aria-label="Tutup"
            >
              ×
            </button>

            {/* Iframe - lebar diperkecil */}
            <iframe
              src={paymentUrl}
              className="w-full h-[60vh] border-0"
              title="Pembayaran"
              allow="payment"
            />
          </div>
        </div>
      )}
    </>
  );
}