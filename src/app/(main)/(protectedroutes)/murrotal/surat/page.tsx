"use client";

import TopBar from "@/components/nav/topbar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";

export default function MurrotalPages() {
  const fetchSurahs = async () => {
    const res = await axios.get("https://equran.id/api/v2/surat");
    if (res.status == 200) return res.data.data;
  };

  const { data: surahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
  });

  return (
    <div className="pt-[4.21rem]">
      <TopBar withBackButton href="/">
        Murrotal AGPAII
      </TopBar>
      <div className="flex flex-col">
        {surahs?.length > 0 &&
          surahs.map((surah: any, i: number) => (
            <Link
              key={i}
              href={"/murrotal/surat/" + surah.nomor}
              className="flex px-4 sm:px-6 py-5 border-b border-b-slate-300 items-center"
            >
              <div className="p-5 bg-gray-200 text-sm shadow-md rounded-full size-10 flex justify-center items-center text-white relative before:absolute after:absolute before:p-2.5 before:z-[1] after:p-2.5 after:z-[1] before:bg-[#009788] after:bg-[#009788] after:rotate-45">
                <p
                  className={clsx(
                    "static z-[2]",
                    surah.nomor < 100 && surah.nomor > 10
                      ? "text-sm"
                      : surah.nomor > 100
                      ? "text-xs"
                      : ""
                  )}
                >
                  {surah.nomor}
                </p>
              </div>
              <div className="pl-4 flex flex-col">
                <h1 className="text-sm text-[0.9rem]">{surah.namaLatin}</h1>
                <div className="flex gap-1.5 pt-0.5 text-[0.8rem] items-center">
                  <span className=" text-gray-600 ">
                    {surah.jumlahAyat} Ayat
                  </span>
                  <span>•</span>
                  <span className="text-gray-600">{surah.arti}</span>
                </div>
              </div>
              <span className="ms-auto font-surah text-2xl">
                {surah.nomor < 10
                  ? "00" + surah.nomor
                  : surah.nomor < 100
                  ? "0" + surah.nomor
                  : surah.nomor}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
