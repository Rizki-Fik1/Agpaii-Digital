"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { CheckIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import { Fragment, useEffect } from "react";

export default function PaymentHistory() {
  const { auth: user } = useAuth();

  const getPaymentType = (type: string) => {
    switch (type) {
      case "pembayaran_acara":
        return "Pembayaran Acara";
        break;
      case "perpanjangan_anggota":
        return "Pembayaran Membership";
        break;
      default:
        return "";
    }
  };

  const { data: payments, isPending } = useInfiniteQuery({
    queryKey: ["payment-history", user.id],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await API.get(`/user/${user.id}/payment?page=${pageParam}`);
      if (res.status == 200) {
        console.log(res.data.data);
        return {
          data: res.data.data,
          nextPage:
            res.data.next_page_url !== null
              ? parseInt(res.data.next_page_url.split("=")[1])
              : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  return (
    <div className="pt-[4.21rem]">
      <TopBar withBackButton>Histori Pembayaran</TopBar>

      <div className="px-4 sm:px-6 pt-8 pb-20">
        {/* Loading state */}
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-sm text-slate-500">Memuat histori...</p>
          </div>
        )}

        {/* Tidak ada data sama sekali (belum pernah transaksi) */}
        {!isPending && (!payments || payments.pages.every(page => page?.data.length === 0)) && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <XMarkIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Belum ada transaksi yang sukses
            </h3>
            <p className="text-sm text-slate-500">
              Semua pembayaran yang berhasil akan muncul di sini.
            </p>
          </div>
        )}

        {/* Ada data → tampilkan list */}
        {!isPending && payments?.pages.some(page => page?.data.length > 0) && (
          <div className="flex flex-col gap-3">
            {payments.pages.map((page, i) => (
              <Fragment key={i}>
                {page?.data.map((payment: any, index: number) => {
                  // Hanya tampilkan jika status success (opsional: bisa juga tampilkan semua)
                  if (payment.status !== "success") return null;

                  return (
                    <div
                      key={payment.id || index}
                      className="flex justify-between items-center py-4 px-5 rounded-xl border border-slate-200 shadow-sm bg-white"
                    >
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-[0.95rem] text-slate-800">
                          {getPaymentType(payment.key)}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          {payment.midtrans_id}
                        </p>
                        <span className="text-xs text-slate-500 mt-2">
                          {moment(payment.created_at).locale("id").fromNow()}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <CheckIcon className="w-5 h-5" />
                          <span className="text-sm">Berhasil</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">
                          {payment.value.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
