"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import {
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import { Fragment } from "react";

export default function PaymentHistory() {
  const { auth: user } = useAuth();

  const getPaymentType = (type: string) => {
    switch (type) {
      case "pembayaran_acara":
        return "Pembayaran Acara";
      case "perpanjangan_anggota":
        return "Pembayaran Membership";
      default:
        return "Transaksi Lainnya";
    }
  };

  const { data: payments, isPending } = useInfiniteQuery({
    queryKey: ["payment-history", user.id],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await API.get(`/user/${user.id}/payment?page=${pageParam}`);
      if (res.status == 200) {
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
    <div className="pt-[4.21rem] min-h-screen bg-white md:bg-[#FAFBFC]">
      <TopBar withBackButton>Histori Pembayaran</TopBar>

      <div className="px-4 sm:px-6 md:px-8 lg:px-12 pt-6 md:pt-8 pb-20">

        {/* Loading */}
        {isPending && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Memuat histori...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isPending && (!payments || payments.pages.every(page => page?.data.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BanknotesIcon className="size-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-600 mb-1">
              Belum ada transaksi
            </h3>
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Semua pembayaran yang berhasil akan muncul di sini.
            </p>
          </div>
        )}

        {/* Payment List */}
        {!isPending && payments?.pages.some(page => page?.data.length > 0) && (
          <div className="space-y-3">
            {payments.pages.map((page, i) => (
              <Fragment key={i}>
                {page?.data.map((payment: any, index: number) => {
                  if (payment.status !== "success") return null;

                  return (
                    <div
                      key={payment.id || index}
                      className="flex items-center gap-4 p-4 md:p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group"
                    >
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <CheckCircleIcon className="size-5 text-emerald-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">
                          {getPaymentType(payment.key)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {payment.midtrans_id}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ClockIcon className="size-3 text-slate-300" />
                          <span className="text-[11px] text-slate-400">
                            {moment(payment.created_at).locale("id").fromNow()}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-base text-slate-800">
                          {payment.value.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Berhasil
                        </span>
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
