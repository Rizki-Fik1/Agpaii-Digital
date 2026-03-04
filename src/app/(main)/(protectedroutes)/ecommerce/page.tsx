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
import { ChevronRightIcon } from "@heroicons/react/16/solid";
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

// Define PostType interface
interface PostType {
  id: number;
  author: {
    id: number;
    name: string;
    avatar: string | null;
  };
  body: string;
  images: Array<{
    id: number;
    src: string;
    type: string;
  }>;
  created_at: string;
  likes_count: number;
  comments_count: number;
  thumbnail: string | null;
}

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
  const [isRamadhanFeatureEnabled, setIsRamadhanFeatureEnabled] = useState(false);
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
        if (data) setIsRamadhanFeatureEnabled(data.is_enabled);
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

  const { data: articles, isLoading: articleLoading } = useQuery({
    queryKey: ["latest-article"],
    queryFn: async () => {
      const res = await API.get("https://agpaii.or.id/wp-json/wp/v2/posts");
      return res.status === 200 ? res.data : [];
    },
  });

  const { data: latestPosts, isLoading: latestLoading } = useQuery({
    queryKey: ["latest-social-media"],
    queryFn: async () => {
      const res = await API.get("post?page=1&limit=3");
      if (res.status === 200) return res.data.data;
      return [];
    },
  });

  const { data: banners, isLoading: bannerLoading } = useQuery({
    queryKey: ["banner-ppob"],
    queryFn: async () => {
      console.log("=== FETCHING BANNER PPOB ===");
      try {
        const res = await API.get("https://admin.agpaiidigital.org/api/banner-ppob");
        console.log("Banner Response Status:", res.status);
        console.log("Banner Response Data:", res.data);
        console.log("Banner Success:", res.data?.success);
        console.log("Banner Data Array:", res.data?.data);
        console.log("Banner Count:", res.data?.data?.length);
        
        if (res.status !== 200 || !res.data?.success) {
          console.log("❌ Banner fetch failed or no success flag");
          return [];
        }
        
        console.log("✅ Banner loaded successfully:", res.data.data.length, "banners");
        return res.data.data;
      } catch (error) {
        console.error("❌ Banner fetch error:", error);
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

      {/* Hero Section - Modern Minimalist dengan Greeting Terlihat */}
      <div
        style={{ backgroundImage: "url(/img/post.png)" }}
        className="text-center max-w-[480px] z-[996] bg-cover bg-bottom mx-auto top-0 left-0 right-0 px-6 pt-16 pb-6 relative"
      >
        <div className="absolute top-0 left-0 right-0 z-[9999]">
          <TopBar
            withBackButton
            href="/"
            rightContent={
              <Link href="/saldo-saya">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all border border-white/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
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

      {/* Menu Grid */}
      <div className="px-[5%] sm:px-8 max-w-[480px] w-full mx-auto mt-2 relative z-[995]">
        <div className="shadow-md rounded-xl bg-white">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-4 py-6 *:text-slate-700">
            {menus.map((menu, i) => (
              <Link
                key={i}
                href={menu.link}
                onClick={(e) => {
                  if (userStatus !== Status.ACTIVE && !menu.comingSoon && menu.link !== "#") {
                    e.preventDefault();
                    toggleModal();
                    return;
                  }
                  if (menu.comingSoon) {
                    e.preventDefault();
                    toggleComingSoon();
                    return;
                  }
                  if (menu.link === "#") {
                    e.preventDefault();
                    toggleMobileModal();
                  }
                }}
                className="flex flex-col items-center text-xs"
              >
                <img
                  src={menu.icon}
                  className={clsx(
                    "p-3 shadow-md border border-slate-200 rounded-[1.3rem] sm:size-16 size-[3.6rem]"
                  )}
                  alt={menu.label}
                />
                <p className="text-center mt-2">{menu.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Swiper */}
      <div className="max-w-[480px] mx-auto mt-6 px-6 sm:px-8">
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
              <SwiperSlide
                key={banner.id || i}
                className="flex justify-center pb-5 h-[11rem]"
              >
                <img
                  src={`https://file.agpaiidigital.org/${banner.url}`}
                  className="w-full object-cover rounded-lg h-full aspect-video"
                  alt={banner.title || "Banner"}
                  onError={(e) => {
                    e.currentTarget.src = "/icons/default-event-banner.png";
                  }}
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

      {/* Riwayat Transaksi - Modern Design */}
      <div className="max-w-[480px] mx-auto mt-6 px-6 sm:px-8 pb-8">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h3>
            <p className="text-sm text-slate-500 mt-1">Transaksi terbaru Anda</p>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#009788] bg-[#009788]/10 rounded-lg hover:bg-[#009788]/20 transition-all"
          >
            Lihat Semua
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="size-8" />
          </div>
        ) : latestTransactions?.length > 0 ? (
          <div className="space-y-5">
            {latestTransactions.slice(0, 3).map((transaction: TransactionType) => {
              // Logika status: prioritas pada status pemesanan, tapi tetap cek pembayaran
              const isPaid = transaction.status_pembayaran === "paid";
              const isSuccess = transaction.status_pemesanan === "success";
              const isFailed = transaction.status_pemesanan === "failed";
              const isPending = transaction.status_pemesanan === "pending";
              
              // Tentukan status akhir
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
                <Link href={`/history-transaction/${transaction.trxid}`} key={transaction.trxid}>
                  <div className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#009788]/40 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#009788]/20 to-[#009788]/10 rounded-lg flex items-center justify-center group-hover:from-[#009788]/30 group-hover:to-[#009788]/20 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {transaction.product?.name ??
                                (transaction.raw_response?.success && transaction.raw_response?.data?.produk
                                  ? transaction.raw_response.data.produk
                                  : "Produk Tidak Diketahui")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{transaction.trxid}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {moment(transaction.created_at).format("DD MMM YYYY, HH:mm")}
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
                          <span className={clsx("text-[10px] font-medium px-2.5 py-1 rounded-full inline-block", statusColor)}>
                            {finalStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {transaction.voucher_code && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <p className="text-xs text-slate-600 font-medium">
                            Voucher: <span className="text-[#009788]">{transaction.voucher_code}</span>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-1">Transaksi Anda akan muncul di sini</p>
          </div>
        )}
      </div>
    </>
  );
}