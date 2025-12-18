"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function SelectPhasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jenjangId = searchParams.get("jenjang_id") || "";
  const mapelId = searchParams.get("id_mapel") || "";
  const [faseList, setFaseList] = useState<any[]>([]);

  useEffect(() => {
    if (jenjangId) {
      axios
        .get(`https://mitra.agpaiidigital.org/api/master/fase?jenjang_id=${jenjangId}`)
        .then((res) => setFaseList(res.data.data || []))
        .catch(() => setFaseList([]));
    }
  }, [jenjangId]);

const handleSelectPhase = (faseId: string) => {
  router.push(`/cp-atp-result?fase_id=${faseId}&id_mapel=${mapelId}`);
};

  return (
    <div className="pt-[4.2rem]">
      <TopBar withBackButton>CP & ATP</TopBar>

      {/* Daftar fase */}
      <div className="flex flex-col bg-white divide-y">
        {faseList.map((f) => (
          <button
            key={f.id_fase}
            onClick={() => handleSelectPhase(f.id_fase)}
            className="flex justify-between items-center px-4 py-4 text-left hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{f.nama_fase}</p>
              {f.deskripsi && (
                <p className="text-sm text-gray-500">{f.deskripsi}</p>
              )}
            </div>
            <span className="text-blue-500">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
