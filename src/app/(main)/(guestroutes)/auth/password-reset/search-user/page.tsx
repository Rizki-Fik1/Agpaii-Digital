"use client";
import Loader from "@/components/loader/loader";
import useDebounceValue from "@/utils/hooks/useDebounce";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <div className="flex flex-col px-6 md:px-12 lg:px-16 xl:px-20 pb-10">
      <motion.div 
        className="md:max-w-xl md:mx-auto md:w-full space-y-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Cari Akun Anda 🔍
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            Masukkan nama lengkap yang Anda gunakan saat mendaftar untuk menemukan email Anda.
          </p>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-slate-700 font-medium mb-2 text-sm">
            Nama Lengkap
          </label>
          <div className="relative group">
            <input
              onKeyUp={(e: any) => setQuery(e.target.value)}
              type="text"
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#009788] transition-all outline-none bg-white placeholder-gray-400"
              placeholder="Ketik nama Anda di sini..."
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
               {isLoading && <Loader className="size-5" />}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {query.length > 0 && (
          <div className="mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="size-10 text-[#009788]" />
                <p className="mt-4 text-slate-400 text-sm">Mencari hasil terbaik...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="grid gap-3">
                {users.map((user: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/auth/password-reset?email=${user.email}`}
                      className="block p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#009788] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 capitalize group-hover:text-[#009788] transition-colors">
                            {user.name.toLowerCase()}
                          </h3>
                          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#009788]/10 transition-colors">
                           <svg className="w-4 h-4 text-slate-300 group-hover:text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : debouncedValue.length > 0 ? (
              <motion.div 
                className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="font-bold text-slate-700">Akun tidak ditemukan</p>
                <p className="text-sm text-slate-400 mt-1">Pastikan nama sudah sesuai dengan KTA</p>
              </motion.div>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
}
