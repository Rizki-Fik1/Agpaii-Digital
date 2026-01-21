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
      label: "Arah Kiblat",
      link: "/arah-kiblat",
      icon: "/svg/ikon kabah.svg",
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
  if (authLoading || isLoading) {
    return (
      <div className="h-screen justify-center items-center flex">
        <Loader className="size-16" />
      </div>
    );
  }
  return (
    <>
      {/* Modal components */}
      <Modal show={modalShow && userStatus === Status.EXPIRED} onClose={toggleModal}>
        <div className="flex flex-col items-center text-sm text-center">
          <img src="/img/credit_card.svg" className="size-20 mt-6" alt="" />
          <p className="text-slate-600 pt-3 mt-6">
            Saatnya iuran 6 bulan untuk tetap <br /> mendapatkan fasilitas AGPAII Digital.
          </p>
          <div className="flex flex-col mt-3 gap-2 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAcceptModal(Status.EXPIRED);
              }}
              className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md cursor-pointer"
            >
              Klik Disini
            </button>
            <button
              onClick={toggleModal}
              className="px-4 py-2 w-full bg-gray-200 rounded-md cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </Modal>
      <Modal show={modalShow && userStatus === Status.PENDING} onClose={toggleModal}>
        <div className="flex flex-col items-center text-sm text-center ">
          <img src="/img/profile.svg" className="size-32 mt-8" alt="" />
          <p className="text-slate-600 text-left pt-3">
            Lengkapi Profil Anda untuk mendapatkan
            <span className="sm:hidden"> Nomor KTA</span>
            <span className="max-sm:hidden">
              <br />
              Nomor KTA
            </span>
          </p>
          <ul className="list-disc flex flex-col w-full text-slate-500 text-left px-3 mt-1">
            {profileMessage.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
          <div className="flex flex-col mt-6 gap-2 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAcceptModal(Status.PENDING);
              }}
              className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md cursor-pointer"
            >
              Klik Disini
            </button>
            <button
              onClick={toggleModal}
              className="px-4 py-2 w-full bg-gray-200 rounded-md cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        className="w-[23rem] sm:w-5/6 "
        show={modalShow && userStatus === Status.INACTIVE}
        onClose={() => toggleModal()}
      >
        <div className="flex flex-col items-center text-sm text-center">
          <img src="/img/credit_card.svg" className="size-20 mt-8" alt="" />
          <p className="text-slate-600 pt-3 mt-6 pb-3">
            Lakukan Iuran Pendaftaran untuk <br /> mengaktifkan akun
          </p>
          <div className="flex flex-col mt-3 gap-2 w-full">
            <button
              onClick={() => handleAcceptModal(Status.INACTIVE)}
              className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md cursor-pointer"
            >
              Klik Disini
            </button>
            <button
              onClick={toggleModal}
              className="px-4 py-2 w-full bg-gray-200 rounded-md cursor-pointer"
            >
              Nanti Saja
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
      
      {/* Header */}
      <div className="w-full max-w-[480px] mx-auto bg-white px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/img/wave.png" alt="sapa" className="size-8 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-[#575757]">Assalamualaikum</p>
              <p className="text-sm sm:text-base font-bold text-[#006557] truncate">{auth.name}</p>
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
            {latestPosts.slice(0, 3).map((post: PostType, index: number) => (
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
      <div className="w-full max-w-[480px] mx-auto px-4 py-4 bg-slate-50 mt-4">
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
    </>
  );
}