"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-white flex px-6">
      <div className="m-auto text-center">
        <h1 className="font-bold text-[#009788] text-8xl">404</h1>
        <p className="font-medium text-neutral-700 text-xl">
          Oops, page tidak ditemukan!
        </p>
        <span
          onClick={() => router.back()}
          className="text-blue-600 mt-1 cursor-pointer"
        >
          Kembali Ke Halaman
        </span>
      </div>
    </div>
  );
}
