"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRightIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export default function SelectPhasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jenjangId = searchParams.get("jenjang_id") || "";
  const mapelId = searchParams.get("id_mapel") || "";
  const [faseList, setFaseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jenjangId) {
      setLoading(true);
      axios
        .get(`https://mitra.agpaiidigital.org/api/master/fase?jenjang_id=${jenjangId}`)
        .then((res) => {
          setFaseList(res.data.data || []);
        })
        .catch(() => {
          setFaseList([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [jenjangId]);

  const handleSelectPhase = (faseId: string) => {
    router.push(`/cp-atp-result?fase_id=${faseId}&id_mapel=${mapelId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[3.2rem]">
      <TopBar withBackButton>Pilih Fase</TopBar>

      {/* Hero / Header Section */}
      <div className="bg-[#009788] text-white px-6 py-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Fase Pembelajaran</h1>
          <p className="text-teal-100 text-sm leading-relaxed max-w-md">
            Pilih fase pembelajaran yang sesuai untuk melihat detail Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP).
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 size-24 rounded-full bg-white/10 blur-lg"></div>
      </div>

      <div className="px-4 -mt-6 relative z-20 pb-10">
        <div className="space-y-4">
          {loading ? (
             // Loading Skeletons
             [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 animate-pulse">
                   <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                   <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
             ))
          ) : faseList.length > 0 ? (
            faseList.map((f) => (
              <div
                key={f.id_fase}
                onClick={() => handleSelectPhase(f.id_fase)}
                className="group bg-white rounded-xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md hover:border-[#009788]/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#009788]/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="bg-teal-50 p-1.5 rounded-lg text-[#009788]">
                          <SwatchIcon className="size-5" />
                       </div>
                       <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#009788] transition-colors">
                         {f.nama_fase}
                       </h3>
                    </div>
                    {f.deskripsi ? (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 group-hover:text-slate-600">
                        {f.deskripsi}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm italic">
                        Tidak ada deskripsi
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center self-center bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-[#009788] group-hover:text-white transition-all duration-300">
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
                
                {/* Bottom Highlight Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#009788] transition-all duration-300 group-hover:w-full"></div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">Tidak ada fase ditemukan untuk jenjang ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
