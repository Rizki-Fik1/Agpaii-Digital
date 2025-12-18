"use client";
import Loader from "@/components/loader/loader";
import useDebounceValue from "@/utils/hooks/useDebounce";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function SearchUser() {
  const [query, setQuery] = useState("");
  const debouncedValue = useDebounceValue(query, 500);

  const { data: users, isLoading } = useQuery({
    enabled: debouncedValue.length > 0 && query.length > 0,
    queryKey: ["user", debouncedValue],
    queryFn: async () => {
      const res = await API.get("/otp-client/search-name/" + debouncedValue);
      if (res.status == 200) return res.data;
    },
  });

  return (
    <div>
      <p className="text-sm px-[5%] sm:px-8 -mt-3 text-slate-500 text-center">
        Masukkan nama Akun yang anda gunakan untuk mendaftar
      </p>

      <div className="w-full px-3 sm:px-8 flex flex-col">
        <input
          onKeyUp={(e: any) => setQuery(e.target.value)}
          type="text"
          className="mt-6 px-5 py-2.5 bg-slate-200 rounded-full w-full"
          placeholder="Cari Nama anda"
        />
        {query.length > 0 && debouncedValue.length > 0 && (
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center mt-6">
                <Loader className="size-8" />
              </div>
            ) : users.length > 0 ? (
              <div className="flex flex-col  text-white bg-[#009788] h-48 overflow-scroll rounded-md">
                {users.map((user: any, i: number) => (
                  <Link
                    href={`/auth/password-reset?email=${user.email}`}
                    key={i}
                    className="px-4 py-2 border-b border-b-[#84d0c8] text-white"
                  >
                    <h1 className="font-medium capitalize">
                      {user.name.toLowerCase()}
                    </h1>
                    <p className="text-sm text-slate-200">{user.email}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-600">
                User tidak ditemukan
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
