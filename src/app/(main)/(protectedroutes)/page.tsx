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
  isAllProfileCompleted,
  isInformationProfileCompleted,
  isLocationProfileCompleted,
  isPnsStatusCompleted,
} from "@/utils/function/function";
import HomeMessage from "@/components/message/home_message";
// Define PostType interface based on the provided data structure
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
export default function Home() {
  const { auth, authLoading } = useAuth();
  const userStatus = getUserStatus(auth);
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState<string[]>([]);
  const { show: modalShow, toggle: toggleModal } = useModal();
  const { show: paymentModalShow, toggle: togglePaymentModal } = useModal();
  const { show: iframeModalShow, toggle: toggleIframeModal } = useModal();
  const { show: mobileOnlyShow, toggle: toggleMobileModal } = useModal();
  const [isRamadhanFeatureEnabled, setIsRamadhanFeatureEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/ramadhan_feature`
    )
      .then((response) => {
        if (!response.ok) {
          // If API returns 404 or error, just disable the feature
          setIsRamadhanFeatureEnabled(false);
          setIsLoading(false);
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
        setIsRamadhanFeatureEnabled(false);
        setIsLoading(false);
      });
  }, []);
  const menus: { label: string; link: string; icon: string }[] = [
    {
      label: "Sosial Media",
      link: "/social-media",
      icon: "/svg/ikon-sosmed.svg",
    },
    {
      label: "KTA Digital",
      link: "/kta",
      icon: "/svg/ikon-kta.svg",
    },
    {
      label: "Live",
      link: "/live",
      icon: "/svg/ikon-live.svg",
    },
    {
      label: "Al-Qur'an",
      link: "/murrotal/surat",
      icon: "/svg/ikon alquran.svg",
    },
    {
      label: "Ramadhan",
      link: "/ramadhan",
      icon: "/svg/ikon ramadhan.svg",
    },
    {
      label: "Modul Digital",
      link: "/modul-ajar",
      icon: "/svg/modul_digital.svg",
    },
    {
      label: "Acara",
      link: "/event",
      icon: "/svg/ikon event.svg",
    },
    {
      label: "Marketplace",
      link: "/marketplace",
      icon: "/svg/ikon-marketplace.svg",
    },
    {
      label: "Lainnya",
      link: "/other",
      icon: "/svg/lainnya.svg",
    },
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
        return res.data.data; // Expecting array of PostType
      }
      return [];
    },
  });
  const { data: banners } = useQuery({
    queryFn: async () => {
      const res = await API.get("banners");
      return res.data;
    },
    queryKey: ["banners"],
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
    onSuccess: (url) => {
      setPaymentUrl(url);
      toggleIframeModal();
      togglePaymentModal();
    },
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

  return (
    <>
      {/* Modal components */}
      {/* Modal Profile Pending */}
      <Modal show={modalShow && userStatus === Status.PENDING} onClose={toggleModal}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
             <svg className="size-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Profil Belum Lengkap!</h2>
          <p className="text-sm text-slate-500 mb-4 text-left">
            Mohon lengkapi bagian berikut untuk mendapatkan Nomor KTA dan akses penuh ke aplikasi:
          </p>
          <ul className="list-disc w-full text-slate-600 text-sm text-left pl-5 space-y-1 mb-6">
            {profileMessage.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAcceptModal(Status.PENDING);
              }}
              className="px-5 py-3 bg-[#009788] hover:bg-[#00867a] text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
            >
              Klik Disini Untuk Melengkapi
            </button>
            <button
              onClick={toggleModal}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Iuran Expired */}
      <Modal show={modalShow && userStatus === Status.EXPIRED} onClose={toggleModal}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
             <svg className="size-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Masa Aktif Habis</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Saatnya iuran 6 bulan untuk tetap mendapatkan fasilitas dan akses penuh AGPAII Digital.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAcceptModal(Status.EXPIRED);
              }}
              className="px-5 py-3 bg-[#009788] hover:bg-[#00867a] text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
            >
              Klik Disini Untuk Perpanjang
            </button>
            <button
              onClick={toggleModal}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Akun Belum Aktif (Inactive) */}
      <Modal show={modalShow && userStatus === Status.INACTIVE} onClose={toggleModal}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
             <svg className="size-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
             </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Akses Terbatas</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Lakukan iuran pendaftaran untuk mengaktifkan akun dan mendapatkan KTA Digital Anda.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => handleAcceptModal(Status.INACTIVE)}
              className="px-5 py-3 bg-[#009788] hover:bg-[#00867a] text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
            >
              Klik Disini Untuk Aktivasi
            </button>
            <button
              onClick={toggleModal}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
      <Modal show={paymentModalShow} onClose={togglePaymentModal}>
        <div className="flex flex-col items-center text-sm text-center">
          <div className="w-full text-left text-lg text-slate-700">
            <h1 className="font-semibold">Jadilah anggota AGPAII</h1>
          </div>
          <img src="/img/payment.svg" alt="" className="size-40" />
          <div className="flex flex-col gap-2 w-full items-start">
            <ul className="flex flex-col text-slate-600 list-disc text-left px-6">
              <li>Mendapatkan KTA Digital</li>
              <li>
                <span>Dapat mengakses fitur AGPAII Digital</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col mt-3 gap-2 w-full">
            {loadingUrl ? (
              <div className="w-full flex justify-center py-2">
                <Loader className="size-8" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => openTransaction()}
                  className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md cursor-pointer"
                >
                  Bayar Sekarang
                </button>
                <button
                  onClick={togglePaymentModal}
                  className="px-4 py-2 w-full bg-gray-200 rounded-md cursor-pointer"
                >
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    <Modal
  show={iframeModalShow}
  onClose={toggleIframeModal}
  className="w-full max-w-4xl"
>
  <div className="h-[80vh] w-full">
    {paymentUrl && (
      <iframe
        src={paymentUrl}
        className="w-full h-full border-0"
        title="Payment Gateway"
      />
    )}
  </div>
</Modal>

      <Modal show={mobileOnlyShow} onClose={toggleMobileModal}>
        <div className="flex flex-col items-center max-w-[16rem] mt-4">
          <img src="/svg/mobile.svg" className="size-36" alt="" />
          <p className="mt-6 pb-3">
            Oops, Fitur ini hanya tersedia di aplikasi mobile
          </p>
        </div>
      </Modal>
      {/* End Modal */}
      
      
      {/* MOBILE ONLY LAYOUT (RESTORED TO ORIGINAL) */}
      <div className="md:hidden flex flex-col w-full h-full pb-20 bg-white">
        {/* Header */}
        <div className="w-full max-w-[480px] mx-auto bg-white px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src="/img/wave.png" alt="sapa" className="size-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#575757]">Assalamualaikum</p>
                <p className="text-sm font-bold text-[#006557] truncate">{auth.name}</p>
              </div>
            </div>
            <Link href={"/profile/edit"} className="rounded-full border-2 border-white flex-shrink-0 ml-2">
              <img
                src={
                  (auth?.avatar !== null && getImage(auth.avatar)) ||
                  "/img/profileplacholder.png"
                }
                className="object-cover rounded-full size-10"
                alt=""
              />
            </Link>
          </div>
        </div>

        {/* Status Card */}
        <div className="w-full max-w-[480px] mx-auto px-4 mt-2 mb-4">
          {userStatus === Status.ACTIVE && (
            <div className="bg-[#01B671] rounded-2xl p-2.5 shadow-md">
              <div className="flex items-center gap-4">
                <div className="bg-[#01925B] rounded-2xl p-3 flex-shrink-0">
                  <img src="/svg/iuran-aktif.svg" alt="Iuran Aktif" className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base mb-1">AGPAII Jaya, Guru Sejahtera</p>
                </div>
              </div>
            </div>
          )}

          {userStatus === Status.INACTIVE && (
            <div className="bg-[#E5553A] rounded-2xl p-2.5 shadow-md">
              <div className="flex items-center gap-4">
                <div className="bg-[#B8432E] rounded-2xl p-3 flex-shrink-0">
                  <img src="/svg/stop.svg" alt="Tidak Aktif" className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base mb-1">Akses Anda Ditolak</p>
                  <p className="text-white font-medium text-sm">Bayar iuran untuk mengaktifkan akun</p>
                </div>
                <button
                  onClick={togglePaymentModal}
                  className="bg-white text-red-600 px-4 py-2 rounded-md text-xs font-medium hover:bg-red-50 transition"
                >
                  Bayar
                </button>
              </div>
            </div>
          )}

          {userStatus === Status.EXPIRED && (
            <div className="bg-[#FF8E0C] rounded-2xl p-2.5 shadow-md">
              <div className="flex items-center gap-4">
                <div className="bg-[#CC760C] rounded-2xl p-3 flex-shrink-0">
                  <img src="/svg/warning.svg" alt="Expired" className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base mb-1">Iuran Hampir Habis</p>
                  <p className="text-white font-medium text-sm">Perpanjang iuran Anda sekarang</p>
                </div>
                <button
                  onClick={togglePaymentModal}
                  className="bg-white text-orange-600 px-4 py-2 rounded-md text-xs font-medium hover:bg-orange-50 transition"
                >
                  Perpanjang
                </button>
              </div>
            </div>
          )}

          {userStatus === Status.PENDING && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Profil Belum Lengkap</p>
                  <p className="text-white/90 text-xs">Lengkapi profil untuk mendapatkan KTA</p>
                </div>
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-50 transition"
                >
                  Lengkapi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Menu Grid 3x3 */}
        <div className="w-full max-w-[480px] mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
            {menus.map((menu, i) => (
              <Link
                onClick={(e) => {
                  if (menu.link == "#") {
                    e.preventDefault();
                    toggleMobileModal();
                  }
                  if (userStatus != Status.ACTIVE && menu.link != "#") {
                    e.preventDefault();
                    toggleModal();
                  }
                }}
                key={i}
                href={menu.link}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="bg-slate-100 rounded-2xl p-2.5 sm:p-3 group-hover:bg-slate-200 transition w-full aspect-square flex items-center justify-center max-w-[80px]">
                  <img src={menu.icon} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" alt="" />
                </div>
                <p className="text-[10px] sm:text-xs text-center text-slate-600 line-clamp-2 w-full px-1">
                  {menu.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Banner Carousel */}
        {banners?.length > 0 && (
          <div className="w-full max-w-[480px] mx-auto px-4 py-4">
            <Swiper
              autoplay={{ delay: 2000, disableOnInteraction: true }}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination]}
              className="pb-8"
            >
              {banners.map((banner: any, i: number) => (
                <SwiperSlide key={i} className="flex justify-center">
                  <Link href={"/banner/" + banner.id} className="w-full">
                    <img
                      src={getImage(banner.url)}
                      className="w-full object-cover rounded-lg h-32 sm:h-40"
                      alt=""
                    />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Social Media Terbaru */}
        <div className="w-full max-w-[480px] mx-auto px-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700">Postingan Terbaru</h2>
            <Link href="/social-media" className="text-xs sm:text-sm text-[#009788] hover:underline">
              Lihat Semua
            </Link>
          </div>
          {latestLoading ? (
            <Loader className="size-8 mx-auto" />
          ) : latestPosts?.length > 0 ? (
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination]}
              className="pb-8"
            >
              {latestPosts.slice(0, 3).map((post, index) => (
                <SwiperSlide
                  key={index}
                  onClick={() => router.push("/social-media")}
                  className="cursor-pointer"
                >
                  <div className="p-3 sm:p-4 bg-white shadow-sm rounded-lg min-h-[280px] sm:min-h-[320px] max-h-[280px] sm:max-h-[320px] flex flex-col">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          (post.author?.avatar && getImage(post.author.avatar)) ||
                          "/img/profileplacholder.png"
                        }
                        alt={post.author?.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-700 text-sm truncate">
                          {post.author?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {moment(post.created_at).locale("id").format("DD MMM YYYY")}
                        </p>
                      </div>
                    </div>
                    {/* Body (isi postingan) */}
                    <div className="min-h-[50px] sm:min-h-[60px] mt-2">
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
                        {post.body}
                      </p>
                    </div>
                    {post.images?.length > 0 && (
                      <img
                        src={getImage(post.images[0].src)}
                        alt="post"
                        className="w-full min-h-[130px] max-h-[130px] sm:min-h-[150px] sm:max-h-[150px] rounded-lg object-cover mt-2"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500">Belum ada postingan terbaru.</p>
          )}
        </div>

        {/* Artikel Section */}
        <div className="w-full max-w-[480px] mx-auto px-4 py-4 bg-slate-50 mt-4 rounded-t-3xl border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-700">Artikel</h2>
            <Link href="/article" className="text-xs sm:text-sm text-[#009788] hover:underline">
              Lihat Lainnya
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {articles?.length > 0 ? (
              [...articles]
                .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
                .slice(0, 4)
                .map((article, index) => (
                  <Link
                    key={index}
                    href={`/article/${article.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                  >
                    <div className="relative h-24 sm:h-32 overflow-hidden bg-slate-200">
                      <img
                        src={article.yoast_head_json?.og_image?.[0]?.url || "/img/article.png"}
                        alt={article.title.rendered}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-700 line-clamp-2 min-h-[28px] sm:min-h-[32px]">
                        {article.title.rendered}
                      </p>
                      <p className="text-[9px] sm:text-xs text-slate-400 mt-1">
                        {moment(article.date).locale("id").format("DD MMM YYYY")}
                      </p>
                    </div>
                  </Link>
                ))
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 col-span-2">Tidak ada artikel terbaru saat ini.</p>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP ONLY LAYOUT */}
{/* Header Mobile Only & Layout Base (Kiri+Kanan) */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-col lg:flex-row gap-6 lg:gap-8 pb-24 md:pb-12 h-full">
        
        {/* KOLOM KIRI (70% di layar lebar) */}
        <div className="flex-1 flex flex-col min-w-0 space-y-6 lg:space-y-8">
          


          {/* Welcome Text (Desktop Khusus) */}
          <div className="hidden md:flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-teal-700 tracking-tight">
                Assalamualaikum, {auth.name}! <span className="text-2xl lg:text-3xl">👋</span>
              </h1>
              <p className="text-slate-500 text-sm lg:text-base mt-1 font-medium">
                Senang melihat Anda kembali di Dashboard AGPAII Digital.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border",
                userStatus === Status.ACTIVE && "bg-emerald-50 text-emerald-700 border-emerald-200",
                userStatus === Status.INACTIVE && "bg-red-50 text-red-600 border-red-200",
                userStatus === Status.EXPIRED && "bg-amber-50 text-amber-700 border-amber-200",
                userStatus === Status.PENDING && "bg-blue-50 text-blue-600 border-blue-200",
              )}>
                <span className={clsx(
                  "w-2 h-2 rounded-full",
                  userStatus === Status.ACTIVE && "bg-emerald-500",
                  userStatus === Status.INACTIVE && "bg-red-500",
                  userStatus === Status.EXPIRED && "bg-amber-500",
                  userStatus === Status.PENDING && "bg-blue-500",
                )}></span>
                {userStatus === Status.ACTIVE ? "Anggota Aktif" : (userStatus === Status.INACTIVE ? "Belum Aktif" : (userStatus === Status.EXPIRED ? "Iuran Expired" : "Profil Pending"))}
              </div>
            </div>
          </div>

          {/* Banner Carousel */}
          {banners?.length > 0 && (
            <div className="w-full">
              <Swiper
                autoplay={{ delay: 3500, disableOnInteraction: true }}
                pagination={{ clickable: true, dynamicBullets: true }}
                modules={[Autoplay, Pagination]}
                className="pb-8 drop-shadow-sm rounded-xl"
              >
                {banners.map((banner: any, i: number) => (
                  <SwiperSlide key={i} className="flex justify-center">
                    <Link href={"/banner/" + banner.id} className="w-full block">
                      <img
                        src={getImage(banner.url)}
                        className="w-full object-cover rounded-xl lg:rounded-2xl h-36 md:h-48 lg:h-64 object-center border border-slate-100"
                        alt=""
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Menu Cepat Akses */}
          <div className="md:hidden bg-white border-transparent md:border-slate-200 md:rounded-2xl md:p-6 md:shadow-sm">
            <h2 className="hidden md:flex text-xl font-bold text-slate-800 mb-6 items-center gap-2">
              <svg className="w-6 h-6 text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Menu Cepat Akses
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5 px-0 md:px-2">
              {menus.map((menu, i) => (
                <Link
                  onClick={(e) => {
                    if (menu.link == "#") { e.preventDefault(); toggleMobileModal(); }
                    if (userStatus != Status.ACTIVE && menu.link != "#") { e.preventDefault(); toggleModal(); }
                  }}
                  key={i}
                  href={menu.link}
                  className="flex flex-col items-center gap-2 md:gap-3 group p-2 md:p-3 hover:bg-slate-50 md:border border-transparent hover:border-slate-100 rounded-xl transition cursor-pointer"
                >
                  <div className="bg-slate-50 md:bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 group-hover:bg-teal-50 group-hover:border-teal-100 group-hover:shadow-md transition-all w-16 h-16 sm:w-20 sm:h-20 lg:w-[84px] lg:h-[84px] flex items-center justify-center">
                    <img src={menu.icon} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain group-hover:scale-110 transition-transform duration-300" alt="" />
                  </div>
                  <p className="text-[10px] md:text-sm font-semibold text-center text-slate-600 group-hover:text-teal-700 line-clamp-2 w-full px-1">
                    {menu.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Social Media Terbaru */}
          <div className="bg-white md:border border-transparent md:border-slate-200 md:rounded-2xl md:p-6 md:shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#009788] hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Postingan Terbaru
              </h2>
              <Link href="/social-media" className="text-xs md:text-sm font-semibold text-[#009788] hover:text-teal-800 hover:bg-teal-50 px-3 py-1.5 rounded-full transition">
                Lihat Semua &rarr;
              </Link>
            </div>
            
            {latestLoading ? (
              <div className="w-full flex justify-center py-8">
                <Loader className="size-8 text-teal-600 mx-auto" />
              </div>
            ) : latestPosts?.length > 0 ? (
              <Swiper
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                modules={[Autoplay, Pagination]}
                className="pb-10 md:px-1"
              >
                {latestPosts.slice(0, 5).map((post: PostType, index: number) => (
                  <SwiperSlide
                    key={index}
                    onClick={() => router.push("/social-media/post/" + post.id)}
                    className="cursor-pointer h-auto py-1"
                  >
                    <div className="p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 rounded-xl lg:rounded-2xl h-full flex flex-col group">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={(post.author?.avatar && getImage(post.author.avatar)) || "/img/profileplacholder.png"}
                          alt={post.author?.name}
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-[#009788] transition-colors">
                            {post.author?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {moment(post.created_at).locale("id").format("DD MMM YYYY")}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 min-h-[45px] mb-3">
                        <p className="text-sm text-slate-600 line-clamp-2 md:line-clamp-3 leading-relaxed">
                          {post.body}
                        </p>
                      </div>
                      {post.images?.length > 0 && (
                        <div className="mt-auto pt-3 border-t border-slate-100">
                          <img
                            src={getImage(post.images[0].src)}
                            alt="preview"
                            className="w-full h-[140px] md:h-[160px] rounded-lg lg:rounded-xl object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500 font-medium my-4">
                Belum ada postingan terbaru di feed.
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (ASIDE/WIDGETS, 30% di layar lebar) */}
        <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col gap-6 md:gap-8 pt-6 md:pt-0 pb-12">
          
          {/* Status Iuran Box */}
          <div className="hidden md:flex bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Status Iuran</h2>
            
            {userStatus === Status.ACTIVE && (
              <div className="bg-green-50/70 border border-green-200/80 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#009788] rounded-full p-1.5 flex-shrink-0 shadow-sm text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#008073] font-bold text-base mb-1">Keanggotaan Aktif</p>
                    <p className="text-[#006557] text-xs font-medium leading-[1.6]">Terima kasih telah membayar iuran. Status Anda aktif.</p>
                  </div>
                </div>
              </div>
            )}

            {userStatus === Status.INACTIVE && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 rounded-full p-1.5 flex-shrink-0 text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-base mb-1">Akses Ditolak</p>
                    <p className="text-red-700 text-xs font-medium mb-3">Lakukan pembayaran iuran untuk mengaktifkan akun dan KTA Anda.</p>
                    <button
                      onClick={togglePaymentModal}
                      className="bg-red-600 text-white px-4 py-2 w-full rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userStatus === Status.EXPIRED && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-500 rounded-full p-1.5 flex-shrink-0 text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-orange-800 font-bold text-base mb-1">Masa Aktif Habis</p>
                    <p className="text-orange-700 text-xs font-medium mb-3">Iuran keanggotaan Anda telah berakhir. Perpanjang kembali.</p>
                    <button
                      onClick={togglePaymentModal}
                      className="bg-orange-500 text-white px-4 py-2 w-full rounded-lg text-sm font-semibold hover:bg-orange-600 transition shadow-sm"
                    >
                      Perpanjang
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userStatus === Status.PENDING && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-full p-1.5 flex-shrink-0 text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 font-bold text-base mb-1">Profil Belum Lengkap</p>
                    <p className="text-blue-700 text-xs font-medium mb-3">Lengkapi profil secara penuh sebelum bisa mencetak KTA.</p>
                    <button
                      onClick={() => router.push("/profile/edit")}
                      className="bg-blue-600 text-white px-4 py-2 w-full rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                      Lengkapi Profil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Iuran Mobile Only (Backup) */}
          <div className="w-full md:hidden">
            {userStatus === Status.ACTIVE && (
              <div className="bg-[#01B671] rounded-2xl p-2.5 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-[#01925B] rounded-2xl p-3 flex-shrink-0">
                    <img src="/svg/iuran-aktif.svg" alt="Iuran Aktif" className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base mb-1">AGPAII Jaya, Guru Sejahtera</p>
                  </div>
                </div>
              </div>
            )}
            {/* ... other status logic same conceptually for mobile */}
          </div>

          {/* Artikel Terbaru List */}
          <div className="md:bg-white md:border border-slate-200 md:rounded-2xl md:p-5 lg:p-6 md:shadow-sm">
            <div className="flex items-center justify-between mb-5 md:border-b md:border-slate-100 md:pb-3">
              <h2 className="text-base md:text-lg font-bold text-slate-800">Artikel Terbaru</h2>
              <Link href="/article" className="text-xs md:text-sm font-semibold text-[#009788] hover:underline">
                Lihat Semua
              </Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {articles?.length > 0 ? (
                [...articles]
                  .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
                  .slice(0, 4)
                  .map((article, index) => (
                    <Link
                      key={index}
                      href={`/article/${article.id}`}
                      className="flex gap-3 md:gap-4 group items-center"
                    >
                      <div className="w-[85px] h-[65px] md:w-[100px] md:h-[75px] rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 relative shadow-sm border border-slate-100">
                        <img
                          src={article.yoast_head_json?.og_image?.[0]?.url || "/img/article.png"}
                          alt={article.title.rendered}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-[#009788] transition line-clamp-2 leading-[1.4] mb-1.5">
                          {article.title.rendered}
                        </h3>
                        <div className="flex items-center text-[10px] md:text-[11px] text-slate-500 font-medium">
                          <svg className="w-3 h-3 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {moment(article.date).locale("id").format("DD MMM YYYY")}
                        </div>
                      </div>
                    </Link>
                  ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">Belum ada artikel.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}