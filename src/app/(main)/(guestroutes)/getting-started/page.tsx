"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export default function GettingStarted() {
  const [slide, setSlide] = useState<number>(1);
  return (
    <>
      <div
        className={clsx(
          "flex flex-col overflow-hidden pb-12",
          slide > 2 && "!hidden"
        )}
      >
        <div
          className={clsx(
            "w-[200%] flex *:w-1/2 *:flex *:flex-col *:px-6 *:items-center duration-300 ease-in-out",
            slide == 2 && "-translate-x-1/2"
          )}
        >
          <div className="text-center pt-44 pb-20">
            <img src="/svg/agpaii.svg" className="size-24" alt="" />
            <p className="font-semibold text-xl pt-8">
              Selamat Datang <br /> di aplikasi AGPAII Digital
            </p>
          </div>
          <div className="text-center pt-44">
            <img src="/svg/bell.svg" alt="" className="size-20" />
            <h1 className="font-semibold text-2xl pt-12">Benefit</h1>
            <p className="px-20 mt-8 text-neutral-700 text-xl">
              Dapatkan Kartu Tanda Anggota Digital serta fitur-fitur lainnya
            </p>
          </div>
        </div>
        <div className="flex gap-2 *:p-1 justify-center mt-12 *:rounded-full">
          <span
            className={clsx(slide === 1 ? "bg-[#009788]" : "bg-slate-300")}
          ></span>
          <span
            className={clsx(slide === 2 ? "bg-[#009788]" : "bg-slate-300")}
          ></span>
        </div>

        <div className="flex flex-col gap-4 *:px-6 *:py-3 *:rounded-lg *:border-slate-200 *:font-medium px-20 mt-16 text-center *:cursor-pointer">
          <div
            onClick={() => slide <= 2 && setSlide((s) => s + 1)}
            className="bg-[#009788] text-white"
          >
            Lanjut
          </div>
          <div onClick={() => setSlide(3)} className="bg-gray-300">
            Lewati
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "flex flex-col px-8 py-8 min-h-screen",
          slide !== 3 && "!hidden"
        )}
      >
        <img src="/svg/agpaii2.svg" className="size-20 mt-16" alt="" />
        <h1 className="mt-2 font-semibold text-2xl uppercase">
          agpaii digital
        </h1>
        <p className="text-neutral-700 mt-1">
          Aplikasi hampir siap digunakan. Mulai login dengan akunmu atau buat
          akun baru
        </p>
        <div className="mt-auto mb-16 text-center px-12 flex flex-col gap-4 *:py-3 *:px-6 *:rounded-xl ">
          <Link className="bg-[#009788] text-white" href={"/auth/login"}>
            Login
          </Link>
          <Link className="bg-gray-300 text-white" href={"/auth/register"}>
            Register
          </Link>
        </div>
      </div>
    </>
  );
}
