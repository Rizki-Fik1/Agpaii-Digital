"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/loader/loader";
import {
  HandThumbUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface ModuleItem {
  id: number;
  judul: string;
  created_at: string;
  likes_count: number;
  downloads_count: number;
  fase?: { nama_fase: string };
  jenjang?: { nama_jenjang: string };
}

export default function UserModulesPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["user-modules", id],
    queryFn: async () => {
      const res = await API.get(`/modules-learn/user/${id}`);
      return res.data.data as ModuleItem[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="size-8" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        User ini belum membuat modul ajar.
      </div>
    );
  }

  return (
    <div className=" pt-[5.21rem] px-4 pb-24">
      <TopBar withBackButton>Modul Ajar Dibuat</TopBar>

      <div className="space-y-3">
        {data.map((modul) => (
          <div
            key={modul.id}
            onClick={() => router.push(`/modul-ajar/${modul.id}`)}
            className="p-4 border rounded-xl bg-white hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-semibold text-slate-800 line-clamp-2">
              {modul.judul}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {modul.jenjang?.nama_jenjang ?? "-"} •{" "}
              {modul.fase?.nama_fase ?? "-"}
            </p>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <HandThumbUpIcon className="w-4 h-4" />
                <span>{modul.likes_count ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>{modul.downloads_count ?? 0}</span>
              </div>
              <span className="ml-auto text-slate-400">
                {new Date(modul.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
