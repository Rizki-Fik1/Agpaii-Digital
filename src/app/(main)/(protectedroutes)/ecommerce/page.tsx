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
import Article from "@/components/article/article";
import { Status } from "@/constant/constant";
import {
  getImage,
  getUserStatus,
  isInformationProfileCompleted,
  isLocationProfileCompleted,
  isPnsStatusCompleted,
} from "@/utils/function/function";
import HomeMessage from "@/components/message/home_message";
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
}

export default function Home() {
  const { auth, authLoading } = useAuth();
  const userStatus = getUserStatus(auth);
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState<string[]>([]);
  const { show: modalShow, toggle: toggleModal } = useModal();
  const { show: paymentModalShow, toggle: togglePaymentModal } = useModal();
  const { show: mobileOnlyShow, toggle: toggleMobileModal } = useModal();
  const [isRamadhanFeatureEnabled, setIsRamadhanFeatureEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Non-blocking fetch for feature status
    fetch(
      `${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/ramadhan_feature`
    )
      .then((response) => {
        if (!response.ok) {
           return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setIsRamadhanFeatureEnabled(data.is_enabled);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching feature status:", error);
         setIsLoading(false);
      });
  }, []);

  const menus = [
    { label: "Pulsa", icon: "/img/pulsa.jpeg", link: "pulsa" },
    { label: "Paket Data", icon: "/img/paketdata.jpeg", link: "paket-data" },
    { label: "Listrik Prabayar", icon: "/img/listrik.jpeg", link: "token-listrik" },
    { label: "Pembayaran Listrik", icon: "/img/pln.svg", link: "pln-bayar" },
    { label: "Pembayaran PDAM", icon: "/img/pdam.svg", link: "pdam" },
    { label: "Pembayaran Internet", icon: "/img/internet.svg", link: "pembayaran-internet" },
    { label: "Pembayaran BPJS", icon: "/img/bpjs.svg", link: "bpjs" },
    { label: "E-Tol", icon: "/img/tol.svg", link: "etoll" },
    { label: "Pembayaran PBB", icon: "/img/pbb.svg", link: "pbb" },
    { label: "Pembayaran Telpon Kabel", icon: "/img/telephone.svg", link: "telepon-kabel" },
    { label: "Pembayaran Multifinance", icon: "/img/multifinance.svg", link: "Multifinance" },
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
      if (res.status === 200) {
        return res.data.data;
      }
      return [];
    },
  });

  const { data: banners } = useQuery({
    queryFn: async () => {
      const res = await API.get("banners_promo");
      return res.data;
    },
    queryKey: ["banners"],
  });

  const { data: latestTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["latest-transactions", auth?.id],
    queryFn: async () => {
      if (!auth?.id) return [];
      const res = await API.get(
        `https://mitra.agpaiidigital.org/api/ppob-transactions/history/${auth.id}?limit=3`
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
  }, [auth]);

  useEffect(() => {
    const messages = [];
    if (!isInformationProfileCompleted(auth)) messages.push("Informasi Umum");
    if (!isLocationProfileCompleted(auth))
      messages.push("Provinsi / Kota / Kecamatan");
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
      <div
        style={{ backgroundImage: "url(/img/post.png)" }}
        className="text-center max-w-[480px] z-[996] bg-cover bg-bottom mx-auto top-0 left-0 right-0 px-6 py-7 h-[14.5rem]"
      >
        <div className="absolute top-0 left-0 right-0 z-[9999]">
             <TopBar withBackButton>
                <span className="text-white mr-6">Ecommerce</span>
             </TopBar>
        </div>
        <div className="items-center mt-12 pt-8">
          <h2 className="text-xl font-semibold text-white">
            AGPAY
            <br />
            <span className="text-lg font-semibold text-white">
              Solusi Transaksi Digital Anggota AGPAII
            </span>
          </h2>
        </div>
      </div>

      <div className="px-[5%] sm:px-8 max-w-[480px] w-full mx-auto mt-[-2rem] relative z-[997]">
        <div className="shadow-md rounded-xl bg-white">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-4 py-6 *:text-slate-700">
            {menus.map((menu, i) => (
              <Link
                key={i}
                href={menu.link}
                onClick={(e) => {
                  if (menu.link === "#") {
                    e.preventDefault();
                    toggleMobileModal();
                  }
                  if (userStatus !== Status.ACTIVE && menu.link !== "#" && menu.link !== "https://mitra.agpaiidigital.org/") {
                    e.preventDefault();
                    toggleModal();
                  }
                }}
                className="flex flex-col items-center text-xs"
              >
                <img
                  src={menu.icon}
                  className={clsx(
                    "p-3 shadow-md border border-slate-200 rounded-[1.3rem] sm:size-16 size-[3.6rem]"
                  )}
                  alt=""
                />
                <p className="text-center mt-2">{menu.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto mt-6">
        <Swiper
          autoplay={{ delay: 2000, disableOnInteraction: true }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="px-6 sm:px-8 shadow-lg border border-t-slate-200 py-4 rounded-lg"
        >
          {banners?.length > 0 &&
            banners.map((banner: any, i: number) => (
              <SwiperSlide
                key={i}
                className="flex justify-center px-4 sm:px-6 pt-4 pb-10 h-[11rem]"
              >
                <Link href={"/banner_promo/" + banner.id}>
                  <img
                    src={getImage(banner.url)}
                    className="w-full object-cover rounded-lg h-full aspect-video"
                    alt=""
                  />
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      <div className="max-w-[480px] mx-auto mt-6 px-6 sm:px-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700">Riwayat Transaksi</h3>
          <Link
            href="/history"
            className="flex items-center text-sm text-[#009788] hover:underline"
          >
            Lihat Semua <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {transactionsLoading ? (
          <div className="flex justify-center">
            <Loader className="size-8" />
          </div>
        ) : latestTransactions?.length > 0 ? (
          <div className="space-y-4">
            {latestTransactions.slice(0, 3).map((transaction: TransactionType) => (
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
                    <p className="text-xs text-slate-500">{moment(transaction.created_at).format('DD/MM/YYYY HH:mm')}</p>
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
                        transaction.status_pembayaran === "paid" ? "text-green-600" :
                        transaction.status_pembayaran === "unpaid" ? "text-yellow-600" :
                        "text-red-600"
                      )}
                    >
                      Pembayaran: {transaction.status_pembayaran}
                    </p>
                    <p
                      className={clsx(
                        "text-xs capitalize",
                        transaction.status_pemesanan === "success" ? "text-green-600" :
                        transaction.status_pemesanan === "pending" ? "text-yellow-600" :
                        transaction.status_pemesanan === "failed" ? "text-red-600" :
                        "text-gray-600"
                      )}
                    >
                      Pemesanan: {transaction.status_pemesanan}
                    </p>
                  </div>
                </div>
                {transaction.voucher_code && (
                  <p className="text-xs text-slate-500 mt-2">Voucher: {transaction.voucher_code}</p>
                )}
              </div>
			</Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center">Belum ada transaksi</p>
        )}
      </div>
    </>
  );
}