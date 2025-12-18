"use client";

import TopBar from "@/components/nav/topbar";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import Navigate from "@/components/navigator/navigate";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { getImage } from "@/utils/function/function";

const fetchRpp = async (id: number | string) => {
  const res = await API.get("/lesson-plan/" + id);
  if (res.status == 200) {
    return res.data;
  }
};

export default function EditRPP() {
  const { id } = useParams();
  const { auth } = useAuth();

  const { data: rpp, isLoading } = useQuery({
    queryKey: ["rpp-detail", id],
    queryFn: async () => fetchRpp(id as string),
  });

  if (!isLoading && rpp.user_id !== auth.id) return <Navigate to="/rpp" />;

  return (
    !isLoading &&
    rpp.user_id === auth.id && (
      <div className="pt-[4.21rem] pb-20">
        <TopBar withBackButton>Edit rpp</TopBar>
        <div className="flex flex-col gap-3 px-6 pt-8">
          <div
            style={{
              background: `url('${getImage(rpp.image)}')`,
            }}
            className="rounded-md overflow-hidden h-40 border flex !bg-center justify-center items-center border-slate-100"
          >
            <input type="file" hidden id="image" />
            <label
              htmlFor="image"
              className="text-white flex justify-center items-center flex-col"
            >
              <PencilSquareIcon className="fill-white size-7" />
              <p>Edit Gambar</p>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-lg font-medium mt-6">Detail Informasi</h1>

            <input
              defaultValue={rpp.topic}
              type="text"
              className="px-4 py-2 rounded-md border border-slate-200"
              placeholder="Materi Pokok"
            />
            <input
              defaultValue={rpp.subject}
              type="text"
              className="px-4 py-2 rounded-md border border-slate-200"
              placeholder="Mata Pelajaran"
            />
            <select
              className="px-4 py-2 rounded-md border border-slate-200 appearance-none"
              name=""
              id=""
              defaultValue={rpp.grade.educational_level_id}
            >
              <option value="1">SD</option>
              <option value="2">SMP</option>
              <option value="3">SMA</option>
              <option value="4">SMK</option>
              <option value="5">TK</option>
              <option value="9">SLB</option>
            </select>

            <input
              type="text"
              className="px-4 py-2 rounded-md border border-slate-200"
              placeholder="Kelas"
              defaultValue={rpp.grade.name}
            />
            <input
              type="text"
              className="px-4 py-2 rounded-md border border-slate-200"
              placeholder="Durasi"
              defaultValue={rpp.duration}
            />
          </div>

          <button className="w-full bg-[#009788] rounded-md px-4 py-2 text-white mt-8">
            Update
          </button>
        </div>
      </div>
    )
  );
}
