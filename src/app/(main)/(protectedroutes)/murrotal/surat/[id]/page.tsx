"use client";

import Ayat, { iAyat } from "@/components/ayat/ayat";
import TopBar from "@/components/nav/topbar";
import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

export default function DetailMurrotal() {
  const { id } = useParams();
  const fetchSurah = async () => {
    const res = await axios.get("https://equran.id/api/v2/surat/" + id);
    return res.status == 200 && res.data.data;
  };

  const [playing, setPlaying] = useState<boolean>(false);
  const [inView, setInView] = useState(false);

  const { data } = useQuery({
    queryKey: ["surah", id],
    queryFn: fetchSurah,
  });

  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audio.current = new Audio(data?.audioFull["01"]);
    return () => {
      audio.current?.pause();
    };
  }, [data]);

  return (
    <div className="pt-[3.9rem] relative">
      {/* Scroll TO TOP */}
      {inView && (
        <ArrowUpCircleIcon
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="size-12 cursor-pointer fill-[#009788] fixed bottom-6 right-6"
        />
      )}
      {/* End Scroll to Top */}
      <div
        style={{ backgroundImage: 'url("/svg/quran_title.svg")' }}
        className="flex justify-center  py-3 bg-cover bg-center bg-[#F2EBD1]"
      >
        <div className="rounded-full bg-[#F2EBD1] px-5 py-2 text-neutral-700 border border-[#D2CBAD]">
          <h1 className="text-sm text-center">{data?.arti}</h1>
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-600 ">
              {data?.jumlahAyat} Ayat
            </span>
            <span className="py-[0.30rem] px-[0.05rem] bg-gray-700"></span>
            <span className="text-xs text-gray-600">{data?.tempatTurun}</span>
          </div>
        </div>
      </div>
      <TopBar withBackButton>
        {data?.namaLatin}
        <span
          onClick={() => {
            playing ? audio?.current?.pause() : audio?.current?.play();
            setPlaying((p) => !p);
          }}
          className="absolute top-1/2 -translate-y-1/2 right-4 p-2 cursor-pointer rounded-full flex"
        >
          {playing ? (
            <PauseIcon className="size-6 fill-white m-auto" />
          ) : (
            <PlayIcon className="size-6 fill-white m-auto" />
          )}
        </span>
      </TopBar>
      {data?.ayat.map((ayat: iAyat, i: number) => {
        return <Ayat ayat={ayat} key={i} />;
      })}
    </div>
  );
}
