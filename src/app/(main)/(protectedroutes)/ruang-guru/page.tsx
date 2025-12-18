"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SearchCpAtpPage() {
  const router = useRouter();
  const [jenjangId, setJenjangId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [jenjangList, setJenjangList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  useEffect(() => {
    axios.get("https://mitra.agpaiidigital.org/api/master/jenjang")
      .then(res => setJenjangList(res.data.data || []));
    axios.get("https://mitra.agpaiidigital.org/api/master/mata-pelajaran")
      .then(res => setMapelList(res.data.data || []));
  }, []);

  const handleSearch = () => {
    if (!jenjangId || !mapelId) return;
    router.push(`/select-phase?jenjang_id=${jenjangId}&id_mapel=${mapelId}`);
  };

  return (
    <div className="pt-[4.2rem]">
      <TopBar withBackButton>Cari CP & ATP</TopBar>
      <div className="flex flex-col gap-4 px-4 py-3 bg-gray-50 border-b">
        <select
          value={jenjangId}
          onChange={(e) => setJenjangId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Pilih Jenjang</option>
          {jenjangList.map((j) => (
            <option key={j.id_jenjang} value={j.id_jenjang}>{j.nama_jenjang}</option>
          ))}
        </select>

        <select
          value={mapelId}
          onChange={(e) => setMapelId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Pilih Mata Pelajaran</option>
          {mapelList.map((m) => (
            <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!jenjangId || !mapelId}
        >
          Cari
        </button>
      </div>
    </div>
  );
}