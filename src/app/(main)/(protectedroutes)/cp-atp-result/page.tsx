"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "@/components/nav/topbar";
import axios from "axios";

export default function CpAtpResultPage() {
  const params = useSearchParams();
  const faseId = params.get("fase_id");
  const mapelId = params.get("id_mapel");

  const [tab, setTab] = useState<"cp" | "atp">("cp");
  const [cpData, setCpData] = useState<any[]>([]);
  const [atpData, setAtpData] = useState<any[]>([]);

  useEffect(() => {
    if (!faseId || !mapelId) return;
    axios
      .get("https://admin.agpaiidigital.org/api/search-cp-atp", {
        params: { fase_id: faseId, id_mapel: mapelId },
      })
      .then((res) => {
        setCpData(res.data.capaian_pembelajaran || []);
        setAtpData(res.data.alur_tujuan_pembelajaran || []);
      });
  }, [faseId, mapelId]);

  return (
    <div className="pt-[4.2rem]">
      <TopBar withBackButton>CP & ATP</TopBar>

      {/* Tab selector */}
      <div className="bg-white border-b flex">
        <button
          onClick={() => setTab("cp")}
          className={`flex-1 py-2 text-center ${
            tab === "cp" ? "border-b-2 border-blue-500 text-blue-500" : ""
          }`}
        >
          Rumusan CP
        </button>
        <button
          onClick={() => setTab("atp")}
          className={`flex-1 py-2 text-center ${
            tab === "atp" ? "border-b-2 border-blue-500 text-blue-500" : ""
          }`}
        >
          Contoh ATP
        </button>
      </div>

      {/* CP List */}
      {tab === "cp" && (
        <div className="p-4">
          {cpData.length > 0 ? (
            cpData.map((item: any) => (
              <div key={item.id_capaian} className="mb-4 border rounded p-3">
                <h3 className="font-bold">
                  {item.nama_mapel} - {item.nama_fase}
                </h3>
                <p className="text-sm text-gray-500">{item.nama_jenjang}</p>
                <p className="mt-2">{item.deskripsi_cp}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada CP ditemukan.</p>
          )}
        </div>
      )}

      {/* ATP List */}
      {tab === "atp" && (
        <div className="p-4">
          {atpData.length > 0 ? (
            atpData.map((item: any) => (
              <div key={item.id_atp} className="mb-4 border rounded p-3">
                <h3 className="font-bold">
                  {item.kode_atp} - {item.judul_pembelajaran}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.nama_fase} - {item.nama_jenjang}
                </p>
                {item.lampiran && (
                  <a
                    href={item.lampiran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Lihat Lampiran
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada ATP ditemukan.</p>
          )}
        </div>
      )}
    </div>
  );
}
