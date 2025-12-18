"use client";

import React from "react";
import clsx from "clsx";
import { Status } from "@/constant/constant";

type Props = {
  status: Status;
  onAccept?: () => void;
  className?: string;
};

export default function HomeMessage({ status, onAccept, className }: Props) {
  const baseTextClass = "text-slate-700 text-[0.835rem] sm:text-sm leading-tight m-0";
  const clickableClass =
    "inline text-blue-500 select-none cursor-pointer ml-1 underline hover:no-underline focus:outline-none";

  const expiredMessage = (
    <>
      <span className="inline">
        Saatnya iuran 6 bulan untuk tetap mendapatkan fasilitas AGPAII Digital.
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onAccept?.();
        }}
        aria-label="Klik untuk melakukan iuran"
        className={clickableClass}
      >
        Klik Disini
      </button>
    </>
  );

  const inactiveMessage = (
    <>
      <span className="inline">Lakukan Iuran Pendaftaran untuk mengaktifkan akun.</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onAccept?.();
        }}
        aria-label="Klik untuk iuran pendaftaran"
        className={clickableClass}
      >
        Klik Disini
      </button>
    </>
  );

  const pendingMessage = (
    <>
      <span className="inline">Lengkapi Profil Anda untuk mendapatkan Nomor KTA.</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onAccept?.();
        }}
        aria-label="Klik untuk melengkapi profil"
        className={clickableClass}
      >
        Klik Disini
      </button>
    </>
  );

  const messages: Record<Status, JSX.Element> = {
    [Status.EXPIRED]: expiredMessage,
    [Status.INACTIVE]: inactiveMessage,
    [Status.PENDING]: pendingMessage,
    [Status.ACTIVE]: <span className="inline">AGPAII Jaya, Guru Sejahtera</span>,
  };

  return (
    <h4 className={clsx(baseTextClass, className)} aria-live="polite">
      {messages[status]}
    </h4>
  );
}
