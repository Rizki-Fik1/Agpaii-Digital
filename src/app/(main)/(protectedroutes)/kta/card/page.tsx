"use client";
import { useEffect, useRef, useState } from "react";
import "./card.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import API from "@/utils/api/config";
import TopBar from "@/components/nav/topbar";
import { ArrowDownTrayIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import html2canvas from "html2canvas";
import Loader from "@/components/loader/loader";
import QRCode from "qrcode.react";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";

export default function Card() {
  const { auth: user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const backCardRef = useRef<HTMLDivElement | null>(null);

  // Fetch user profile
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const res = await API.get("user/" + user.id);
      return res.status === 200 && res.data;
    },
  });

  // Fetch kartu template
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["kartuTemplate"],
    queryFn: async () => {
      const res = await fetch("https://mitra.agpaiidigital.org/api/get-kartu-template");
      if (res.status === 200) {
        const data = await res.json();
        return data;
      }
      return null;
    },
  });

  const addNoCacheParam = (url: string) => `${url}?date=${new Date().getTime()}`;

  const frontCardImage = template?.depan
    ? `https://s3.us-west-1.wasabisys.com/file.agpaiidigital.org/${template.depan}`
    : "/img/kta_card.png";

  const backCardImage = template?.belakang
    ? `https://s3.us-west-1.wasabisys.com/file.agpaiidigital.org/${template.belakang}`
    : "/img/kta_card.png";

  const handleDownloadImage = async () => {
    // Download Front
    await html2canvas(frontCardRef.current as HTMLElement, {
      useCORS: true,
      imageTimeout: 15000,
      logging: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "kta_depan.jpg";
      link.href = canvas.toDataURL();
      link.target = "_blank";
      link.click();
    });

    // Download Back
    await html2canvas(backCardRef.current as HTMLElement, {
      onclone: (doc: any) => {
        doc.querySelector(".back").style.transform = "rotateY(0deg)";
        doc.querySelector(".back div").style.paddingTop = "9.0rem";
      },
      useCORS: true,
      imageTimeout: 15000,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "kta_belakang.jpg";
      link.href = canvas.toDataURL();
      link.target = "_blank";
      link.click();
    });
  };

  const { mutate: downloadImage, isPending } = useMutation({
    mutationFn: handleDownloadImage,
  });

  const getRoleName = () => {
    if (!!profile?.role_id) {
      switch (profile.role_id) {
        case 1:
          return "Administrator";
        case 2:
          return "Guru PAI";
        case 3:
          return "Dewan Pengurus Pusat";
        case 4:
          return "Dewan Pengurus Wilayah";
        case 5:
          return "Dewan Pengurus Daerah";
        case 6:
          return "Dewan Pengurus Cabang";
        case 7:
          return "Pengawas PAI";
        case 8:
          return "Siswa PAI";
        case 9:
          return "Anggota Luar Biasa";
        case 10:
          return "Anggota Kehormatan";
        case 11:
          return "Kepala Sekolah dan Guru PAI";
        case 12:
          return "Pembuat Survey";
        case 13:
          return "Guru Pensiun";
        default:
          return "";
      }
    }
    return "";
  };

  if (isLoading || templateLoading) return null;

  if (isError) return <div>{error?.message}</div>;

  return (
    <div className="overflow-y-hidden h-[110vh]">
      <TopBar withBackButton>
        <div className="flex justify-between items-center">
          Kartu Tanda Anggota
          {isPending ? (
            <img src="/img/loading_white.gif" className="size-6" alt="" />
          ) : (
            <ArrowDownTrayIcon onClick={() => downloadImage()} className="size-6" />
          )}
        </div>
      </TopBar>
      <div className="flex items-center justify-center h-full relative px-4">
        {/* Flip Icons */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg cursor-pointer hover:bg-white transition-colors"
          onClick={() => setFlipped(!flipped)}
        >
          <ArrowLeftIcon className="size-6 text-gray-700" />
        </div>
        <div className="card relative mx-16">
          <div className={`content ${flipped ? "flipped" : ""}`}>
            {/* Front Card */}
            <div ref={frontCardRef} className="front overflow-visible">
              <img src={frontCardImage} className="w-full" alt="KTA Depan" />
              <div className="absolute top-12 left-1/2 w-full -translate-x-1/2 p-5 flex flex-col items-center">
                <img
                  crossOrigin="anonymous"
                  className="size-20 mt-20 rounded-full"
                  src={addNoCacheParam(getImage(profile.avatar))}
                  alt=""
                />
                <div className="flex flex-col items-center pt-4 text-base">
                  <h1>{profile.name}</h1>
                  <h1 className="font-medium text-sm">({getRoleName()})</h1>
                  <h2 className="text-sm text-neutral-600">{profile.kta_id}</h2>
                  <h3 className="text-sm text-neutral-700">{profile.profile.school_place}</h3>
                  <h3 className="text-sm text-neutral-600">{profile.email}</h3>
                  <QRCode value={profile.kta_id.toString()} className="!size-20 mt-8" />
                </div>
              </div>
            </div>
            {/* Back Card */}
            <div ref={backCardRef} className="back">
              <img src={backCardImage} className="w-full" alt="KTA Belakang" />
              <div className="absolute top-0 pt-[9.4rem] h-full left-1/2 -translate-x-1/2 p-5 flex flex-col w-full items-center text-base">
                <h1 className="text-white text-center text-sm font-semibold">Visi</h1>
                <p className="text-neutral-800 text-sm mt-7 text-center px-4">
                  “Mewujudkan Organisasi Profesi Mandiri, Profesional Dan Menguatkan Nilai Islam Rahmatan Lil Alamin Dalam Praktik Pendidikan Islam”
                </p>
                <div className="pt-8 text-neutral-800 text-center">
                  <h1 className="font-medium">Ketua Umum DPP AGPAII</h1>
                  <p className="flex justify-center mt-4">
                    <img src="/svg/signature.svg" alt="tanda-tangan" className="size-[85%]" />
                  </p>
                  <h1 className="font-medium">Drs. H Endang Zenal M.Ag</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg cursor-pointer hover:bg-white transition-colors"
          onClick={() => setFlipped(!flipped)}
        >
          <ArrowRightIcon className="size-6 text-gray-700" />
        </div>
      </div>
    </div>
  );
}