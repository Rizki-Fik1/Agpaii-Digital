"use client";

import clsx from "clsx";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import API from "@/utils/api/config";
import { ChevronRightIcon, WalletIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal/modal";
import moment from "moment";
import "moment/locale/id";
import Loader from "@/components/loader/loader";
import { useAuth } from "@/utils/context/auth_context";
import { useModal } from "@/utils/hooks/use_modal";
import { Status } from "@/constant/constant";
import {
  getImage,
  getUserStatus,
  isInformationProfileCompleted,
  isLocationProfileCompleted,
  isPnsStatusCompleted,
} from "@/utils/function/function";
import TopBar from "@/components/nav/topbar";

// Define TransactionType interface
interface TransactionType {
  trxid: string;
  user_id: number;
  user_name: string;
  product_code: string;
  product_name: string;
  harga: string;
  status_pemesanan: string;
  status_pembayaran: string;
  voucher_code: string | null;
  created_at: string;
  phone: string;
  no_meter_pln: string | null;
  order_id: string | null;
  raw_response?: any;
  product?: {
    name: string;
  };
}

export default function Home() {
  const { auth, authLoading } = useAuth();
  const userStatus = getUserStatus(auth);
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState<string[]>([]);
  const { show: modalShow, toggle: toggleModal } = useModal();
  const { show: paymentModalShow, toggle: togglePaymentModal } = useModal();
  const { show: mobileOnlyShow, toggle: toggleMobileModal } = useModal();
  const { show: comingSoonShow, toggle: toggleComingSoon } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [saldo, setSaldo] = useState<number>(0);

  const formatRupiah = (value?: number | string) => {
    const number = Number(value) || 0;
    return number.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/ramadhan_feature`)
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!auth?.id) return;
    const fetchSaldo = async () => {
      try {
        const res = await API.get(
          `https://admin.agpaiidigital.org/api/agpay/wallet?user_id=${auth.id}`
        );
        setSaldo(res?.data?.balance ?? res?.data?.data?.balance ?? 0);
      } catch {
        setSaldo(0);
      }
    };
    fetchSaldo();
  }, [auth?.id]);

  const menus = [
    { label: "Pulsa", icon: "/img/pulsa.jpeg", link: "pulsa", comingSoon: false },
    { label: "Paket Data", icon: "/img/paketdata.jpeg", link: "paket-data", comingSoon: false },
    { label: "Listrik Prabayar", icon: "/img/listrik.jpeg", link: "token-listrik", comingSoon: false },
    { label: "Pembayaran Listrik", icon: "/img/pln.svg", link: "#", comingSoon: true },
    { label: "Pembayaran PDAM", icon: "/img/pdam.svg", link: "#", comingSoon: true },
    { label: "Pembayaran Internet", icon: "/img/internet.svg", link: "#", comingSoon: true },
    { label: "Pembayaran BPJS", icon: "/img/bpjs.svg", link: "#", comingSoon: true },
    { label: "E-Tol", icon: "/img/tol.svg", link: "#", comingSoon: true },
    { label: "Pembayaran PBB", icon: "/img/pbb.svg", link: "#", comingSoon: true },
    { label: "Pembayaran Telpon Kabel", icon: "/img/telephone.svg", link: "#", comingSoon: true },
    { label: "Pembayaran Multifinance", icon: "/img/multifinance.svg", link: "#", comingSoon: true },
  ];

  const { data: banners, isLoading: bannerLoading } = useQuery({
    queryKey: ["banner-ppob"],
    queryFn: async () => {
      try {
        const res = await API.get("https://admin.agpaiidigital.org/api/banner-ppob");
        if (res.status !== 200 || !res.data?.success) return [];
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  const { data: latestTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["latest-transactions", auth?.id],
    queryFn: async () => {
      if (!auth?.id) return [];
      const res = await API.get(
        `https://admin.agpaiidigital.org/api/ppob-transactions/history/${auth.id}?limit=3`
      );
      return res.status === 200 ? res.data.data : [];
    },
    enabled: !!auth?.id,
  });

  const handlePayment = async () => {
    const res = await API.post(
      auth.user_activated_at !== null ? "/subscribe-fee" : "/membership-fee"
    );
    if (res.status === 200) return res.data.data.payment_url;
  };

  const handleAcceptModal = (status: Status) => {
    switch (status) {
      case Status.EXPIRED:
        togglePaymentModal();
        modalShow && toggleModal();
        break;
      case Status.INACTIVE:
        togglePaymentModal();
        modalShow && toggleModal();
        break;
      case Status.PENDING:
        router.push("/profile/edit");
        break;
      default:
        break;
    }
  };

  const { mutate: openTransaction, isPending: loadingUrl } = useMutation({
    mutationFn: handlePayment,
    onSuccess: (url) => window.open(url, "_blank"),
  });

  useEffect(() => {
    if (userStatus !== Status.ACTIVE) toggleModal();
  }, [userStatus]);

  useEffect(() => {
    const messages = [];
    if (!isInformationProfileCompleted(auth)) messages.push("Informasi Umum");
    if (!isLocationProfileCompleted(auth)) messages.push("Provinsi / Kota / Kecamatan");
    if (!isPnsStatusCompleted(auth)) messages.push("Status PNS");
    setProfileMessage(Array.from(new Set(messages)));
  }, [auth]);

  if (authLoading) {
    return (
      <div className="h-screen justify-center items-center flex">
        <Loader className="size-16" />
      </div>
    );
  }

  const getTransactionStatus = (transaction: TransactionType) => {
    const isPaid = transaction.status_pembayaran === "paid";
    const isSuccess = transaction.status_pemesanan === "success";
    const isFailed = transaction.status_pemesanan === "failed";
    const isPending = transaction.status_pemesanan === "pending";

    if (isFailed) return { label: "Gagal", color: "bg-red-100 text-red-700" };
    if (isSuccess && isPaid) return { label: "Berhasil", color: "bg-green-100 text-green-700" };
    if (isSuccess && !isPaid) return { label: "Menunggu Bayar", color: "bg-yellow-100 text-yellow-700" };
    if (isPending) return { label: "Diproses", color: "bg-blue-100 text-blue-700" };
    return { label: "Tidak Diketahui", color: "bg-gray-100 text-gray-700" };
  };

  return (
    <>
      {/* Modal Coming Soon */}
      <Modal show={comingSoonShow} onClose={toggleComingSoon}>
        <div className="flex flex-col items-center text-center p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Fitur Segera Hadir!</h3>
          <p className="text-slate-600 mb-6">
            Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.<br />
            Terima kasih atas kesabarannya.
          </p>
          <button
            onClick={toggleComingSoon}
            className="px-8 py-3 bg-[#009788] text-white rounded-lg font-medium hover:bg-[#008577] transition"
          >
            Mengerti
          </button>
        </div>
      </Modal>

      {/* Modal Expired / Inactive */}
      <Modal show={modalShow && userStatus === Status.EXPIRED} onClose={toggleModal}>
        <div className="flex flex-col items-center text-sm text-center">
          <img src="/img/credit_card.svg" className="size-20 mt-6" alt="" />
          <p className="text-slate-600 pt-3 mt-6">
            Saatnya iuran 6 bulan untuk tetap <br /> mendapatkan fasilitas AGPAII Digital.
          </p>
          <div className="flex flex-col mt-3 gap-2 w-full *:cursor-pointer">
            <span
              onClick={(e) => {
                e.preventDefault();
                handleAcceptModal(Status.EXPIRED);
              }}
              className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md"
            >
              Klik Disini
            </span>
            <span
              onClick={toggleModal}
              className="px-4 py-2 w-full bg-gray-200 rounded-md"
            >
              Nanti Saja
            </span>
          </div>
        </div>
      </Modal>

      {/* ===========================
          MOBILE LAYOUT (< md)
      =========================== */}
      <div className="md:hidden">
        {/* Hero Mobile */}
        <div
          style={{ backgroundImage: "url(/img/post.png)" }}
          className="text-center bg-cover bg-bottom px-6 pt-16 pb-6 relative"
        >
          <div className="absolute top-0 left-0 right-0 z-[9999]">
            <TopBar
              withBackButton
              href="/"
              rightContent={
                <Link href="/saldo-saya">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all border border-white/30">
                    <WalletIcon className="h-4 w-4 text-white" />
                    <div className="text-left">
                      <p className="text-[10px] text-white/80 leading-none">Saldo</p>
                      <p className="text-xs font-bold text-white leading-tight">
                        Rp {formatRupiah(saldo)}
                      </p>
                    </div>
                  </button>
                </Link>
              }
            >
              <span className="text-white font-semibold">AGPAY</span>
            </TopBar>
          </div>
          <div className="items-center text-left pt-8">
            <p className="text-sm text-white/90">Halo {auth?.name ?? "Anggota"},</p>
            <h2 className="text-xl font-semibold text-white mt-1">Selamat Datang di AGPAY</h2>
          </div>
        </div>

        {/* Menu Grid Mobile */}
        <div className="px-4 mt-2 relative z-[995]">
          <div className="shadow-md rounded-xl bg-white">
            <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-4 py-6 *:text-slate-700">
              {menus.map((menu, i) => (
                <Link
                  key={i}
                  href={menu.link}
                  onClick={(e) => {
                    if (userStatus !== Status.ACTIVE && !menu.comingSoon && menu.link !== "#") {
                      e.preventDefault(); toggleModal(); return;
                    }
                    if (menu.comingSoon) { e.preventDefault(); toggleComingSoon(); return; }
                    if (menu.link === "#") { e.preventDefault(); toggleMobileModal(); }
                  }}
                  className="flex flex-col items-center text-xs"
                >
                  <img
                    src={menu.icon}
                    className="p-3 shadow-md border border-slate-200 rounded-[1.3rem] size-[3.6rem]"
                    alt={menu.label}
                  />
                  <p className="text-center mt-2">{menu.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Mobile */}
        <div className="mt-6 px-4 pb-4">
          {bannerLoading ? (
            <div className="flex justify-center items-center h-[11rem] bg-slate-100 rounded-lg">
              <div className="inline-block w-8 h-8 border-4 border-[#009788]/30 border-t-[#009788] rounded-full animate-spin"></div>
            </div>
          ) : banners && banners.length > 0 ? (
            <Swiper
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={banners.length > 1}
              modules={[Autoplay, Pagination]}
              className="rounded-lg"
            >
              {banners.slice(0, 5).map((banner: any, i: number) => (
                <SwiperSlide key={banner.id || i} className="flex justify-center pb-5 h-[11rem]">
                  <img
                    src={`https://file.agpaiidigital.org/${banner.url}`}
                    className="w-full object-cover rounded-lg h-full"
                    alt={banner.title || "Banner"}
                    onError={(e) => { e.currentTarget.src = "/icons/default-event-banner.png"; }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex justify-center items-center h-[11rem] bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-500">Tidak ada banner tersedia</p>
            </div>
          )}
        </div>

        {/* Riwayat Transaksi Mobile */}
        <div className="px-4 pb-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h3>
            <Link href="/history" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#009788] bg-[#009788]/10 rounded-lg">
              Lihat Semua <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <TransactionList transactions={latestTransactions} loading={transactionsLoading} getStatus={getTransactionStatus} formatRupiah={formatRupiah} />
        </div>
      </div>

      {/* ===========================
          DESKTOP LAYOUT (>= md)
      =========================== */}
      <div className="hidden md:block min-h-screen bg-slate-50">
        {/* ── Hero Desktop ── */}
        <div className="relative bg-gradient-to-br from-[#004D40] via-[#00695C] to-[#00897B] overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative max-w-7xl mx-auto px-8 py-10">
            <div className="flex items-center justify-between">
              {/* Left: Greeting */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-white" />
                </button>
                <div>
                  <p className="text-white/70 text-sm">Selamat datang kembali,</p>
                  <h1 className="text-2xl font-bold text-white mt-0.5">{auth?.name ?? "Anggota"}</h1>
                  <p className="text-white/60 text-sm mt-1">AGPAY — Layanan Pembayaran Digital</p>
                </div>
              </div>

              {/* Right: Saldo Card */}
              <Link href="/saldo-saya">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <WalletIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Saldo AGPAY</p>
                      <p className="text-2xl font-bold text-white mt-0.5">
                        Rp {formatRupiah(saldo)}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">Klik untuk kelola saldo</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Content Desktop ── */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-3 gap-8">

            {/* ── LEFT/MAIN COLUMN (2/3) ── */}
            <div className="col-span-2 space-y-8">

              {/* Menu Grid Desktop */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-base font-bold text-slate-700 mb-5">Layanan AGPAY</h2>
                <div className="grid grid-cols-5 lg:grid-cols-6 gap-4">
                  {menus.map((menu, i) => (
                    <Link
                      key={i}
                      href={menu.link}
                      onClick={(e) => {
                        if (userStatus !== Status.ACTIVE && !menu.comingSoon && menu.link !== "#") {
                          e.preventDefault(); toggleModal(); return;
                        }
                        if (menu.comingSoon) { e.preventDefault(); toggleComingSoon(); return; }
                        if (menu.link === "#") { e.preventDefault(); }
                      }}
                      className="group flex flex-col items-center text-xs gap-2.5 hover:opacity-90 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={menu.icon}
                          className="p-3 shadow-sm border border-slate-200 rounded-2xl w-14 h-14 object-cover group-hover:shadow-md group-hover:border-[#009788]/30 transition-all"
                          alt={menu.label}
                        />
                        {menu.comingSoon && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-[8px] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">Segera</span>
                        )}
                      </div>
                      <p className="text-center text-slate-600 font-medium leading-tight group-hover:text-[#009788] transition-colors">{menu.label}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Banner Desktop */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {bannerLoading ? (
                  <div className="flex justify-center items-center h-56 bg-slate-100">
                    <div className="inline-block w-8 h-8 border-4 border-[#009788]/30 border-t-[#009788] rounded-full animate-spin"></div>
                  </div>
                ) : banners && banners.length > 0 ? (
                  <Swiper
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={banners.length > 1}
                    modules={[Autoplay, Pagination]}
                  >
                    {banners.slice(0, 5).map((banner: any, i: number) => (
                      <SwiperSlide key={banner.id || i} className="pb-8 h-[15rem]">
                        <img
                          src={`https://file.agpaiidigital.org/${banner.url}`}
                          className="w-full object-cover h-full"
                          alt={banner.title || "Banner"}
                          onError={(e) => { e.currentTarget.src = "/icons/default-event-banner.png"; }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="flex justify-center items-center h-56 bg-slate-50">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Tidak ada banner tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN (1/3) ── */}
            <div className="space-y-6">
              {/* Riwayat Transaksi Desktop */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Riwayat Transaksi</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Transaksi terbaru Anda</p>
                  </div>
                  <Link
                    href="/history"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#009788] bg-[#009788]/10 rounded-lg hover:bg-[#009788]/20 transition-all"
                  >
                    Semua <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <TransactionList transactions={latestTransactions} loading={transactionsLoading} getStatus={getTransactionStatus} formatRupiah={formatRupiah} compact />
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-[#004D40] to-[#009788] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-base mb-2">Butuh Bantuan?</h3>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  Temui kendala dalam transaksi? Hubungi tim support kami melalui WhatsApp.
                </p>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Reusable Transaction List Component ───────────────────────
function TransactionList({
  transactions,
  loading,
  getStatus,
  formatRupiah,
  compact = false,
}: {
  transactions: TransactionType[] | undefined;
  loading: boolean;
  getStatus: (t: TransactionType) => { label: string; color: string };
  formatRupiah: (v?: number | string) => string;
  compact?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="size-8" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Belum ada transaksi</p>
        <p className="text-xs text-slate-400 mt-1">Transaksi Anda akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 3).map((transaction: TransactionType) => {
        const { label, color } = getStatus(transaction);
        const productName =
          transaction.product?.name ??
          (transaction.raw_response?.success && transaction.raw_response?.data?.produk
            ? transaction.raw_response.data.produk
            : "Produk Tidak Diketahui");

        return (
          <Link href={`/history-transaction/${transaction.trxid}`} key={transaction.trxid}>
            <div className="group p-4 bg-slate-50 hover:bg-white rounded-xl border border-transparent hover:border-[#009788]/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 bg-[#009788]/10 rounded-lg flex items-center justify-center group-hover:bg-[#009788]/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {moment(transaction.created_at).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">
                    Rp {formatRupiah(transaction.harga)}
                  </p>
                  <span className={clsx("text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-1", color)}>
                    {label}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}