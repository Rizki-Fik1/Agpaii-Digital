"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AcademicCapIcon, BookOpenIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export default function SearchCpAtpPage() {
  const router = useRouter();
  const [jenjangId, setJenjangId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [jenjangList, setJenjangList] = useState<any[]>([]);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jenjangRes, mapelRes] = await Promise.all([
          axios.get("https://mitra.agpaiidigital.org/api/master/jenjang"),
          axios.get("https://mitra.agpaiidigital.org/api/master/mata-pelajaran")
        ]);
        setJenjangList(jenjangRes.data.data || []);
        setMapelList(mapelRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!jenjangId || !mapelId) return;
    setLoading(true);
    // Simulate a small delay for better UX feeling or just push immediately
    router.push(`/select-phase?jenjang_id=${jenjangId}&id_mapel=${mapelId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[3.2rem]">
      <TopBar withBackButton>Ruang Guru</TopBar>
      
      {/* Hero / Header Section */}
      <div className="bg-[#009788] text-white px-6 py-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Cari CP & ATP</h1>
            <p className="text-teal-100 text-sm leading-relaxed max-w-md">
              Temukan referensi Capaian Pembelajaran dan Alur Tujuan Pembelajaran yang sesuai dengan kebutuhan mengajar Anda.
            </p>
         </div>
         {/* Decorative circles */}
         <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-white/10 blur-xl"></div>
         <div className="absolute bottom-0 left-0 -ml-4 -mb-4 size-24 rounded-full bg-white/10 blur-lg"></div>
      </div>

      <div className="px-4 -mt-6 relative z-20 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-6">
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AcademicCapIcon className="size-4 text-[#009788]" />
                Jenjang Pendidikan
              </label>
              <div className="relative">
                <select
                  value={jenjangId}
                  onChange={(e) => setJenjangId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788] transition-all"
                >
                  <option value="">Pilih Jenjang</option>
                  {jenjangList.map((j) => (
                    <option key={j.id_jenjang} value={j.id_jenjang}>
                      {j.nama_jenjang}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronRightIcon className="size-5 rotate-90" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BookOpenIcon className="size-4 text-[#009788]" />
                Mata Pelajaran
              </label>
              <div className="relative">
                <select
                  value={mapelId}
                  onChange={(e) => setMapelId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009788]/20 focus:border-[#009788] transition-all"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {mapelList.map((m) => (
                    <option key={m.id_mapel} value={m.id_mapel}>
                      {m.nama_mapel}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronRightIcon className="size-5 rotate-90" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!jenjangId || !mapelId || loading}
            className={clsx(
              "w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-all duration-200 shadow-md",
              !jenjangId || !mapelId
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#009788] text-white hover:bg-[#007a6e] active:scale-[0.98]"
            )}
          >
            {loading ? (
               <span className="flex items-center gap-2">
                 <svg className="animate-spin size-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Memproses...
               </span>
            ) : (
               <>
                 <MagnifyingGlassIcon className="size-5 stroke-2" />
                 Cari Referensi
               </>
            )}
          </button>
        </div>

        {/* Info / Tips Section */}
        <div className="mt-6 flex flex-col gap-3">
           <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2">Info</h3>
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
              <div className="bg-blue-100 p-2 rounded-full h-fit shrink-0">
                <BookOpenIcon className="size-5 text-blue-600" />
              </div>
              <div className="text-sm">
                 <p className="font-semibold mb-1">Database Lengkap</p>
                 <p className="opacity-80 leading-relaxed">Kami menyediakan referensi CP & ATP terlengkap untuk membantu penyusunan perangkat ajar Anda.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}