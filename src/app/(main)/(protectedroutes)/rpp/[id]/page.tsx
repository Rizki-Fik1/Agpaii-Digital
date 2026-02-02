"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import {
  AcademicCapIcon,
  BookOpenIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import htmlParser from "html-react-parser";
import Link from "next/link";
import { getImage } from "@/utils/function/function";
import Loader from "@/components/loader/loader";

const fetchRpp = async (id: number | string) => {
  const res = await API.get("/lesson-plan/" + id);
  if (res.status == 200) {
    return res.data;
  }
};

export default function DetailRPPPage() {
  const { id } = useParams();
  const { data: rpp, isLoading } = useQuery({
    queryKey: ["rpp-detail", id],
    queryFn: async () => fetchRpp(id as string),
  });

  return (
    <div className="pb-20 pt-[4.21rem] px-[5%] sm:px-6">
      <TopBar withBackButton>Detail RPP</TopBar>
      {isLoading ? null : (
        <>
          <div className="flex py-4 items-center">
            <h1 className="text-xl my-2 font-semibold text-slate-700">
              {rpp.topic}
            </h1>
            <div className="ms-auto">
              <Link target="_blank" href={getImage(rpp.file)}>
                {rpp.file !== null && (
                  <ArrowDownTrayIcon className="size-6  fill-[#007988] cursor-pointer" />
                )}
              </Link>
            </div>
          </div>
          <div className="flex max-sm:flex-col gap-6 sm:gap-4 items-start mt-2">
            <div className="aspect-[10/12] rounded-md border border-slate-200 max-sm:aspect-video sm:w-40 overflow-hidden ">
              <img
                src={
                  rpp.image !== null
                    ? getImage(rpp.image)
                    : "/img/agpaii_splash.svg"
                }
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 h-fit">
                <div className="rounded-md p-1 h-full bg-gray-50 border border-slate-100">
                  <AcademicCapIcon className="size-6 fill-[#009788]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Sekolah</span>
                  <h1 className="font-medium text-sm text-slate-700">
                    {rpp.school}
                  </h1>
                </div>
              </div>
              <div className="flex gap-4 h-fit">
                <div className="rounded-md p-1 h-full bg-gray-50 border border-slate-100">
                  <BookOpenIcon className="size-6 fill-[#009788]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Kelas</span>
                  <h1 className="font-medium text-sm text-slate-700">
                    {rpp.grade.description}
                  </h1>
                </div>
              </div>
              <div className="flex gap-4 h-fit">
                <div className="rounded-md p-1 h-full bg-gray-50 border border-slate-100">
                  <PencilSquareIcon className="size-6 fill-[#009788]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Pembuat</span>
                  <h1 className="font-medium text-sm">
                    {rpp.user?.name || "-"}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col pt-12 gap-5">
            {rpp?.contents?.map((content: any, i: number) => {
              return (
                <div key={i} className="flex flex-col">
                  <h1 className="text-base text-slate-800 font-medium">
                    {htmlParser(content.name)}
                  </h1>
                  <div className="text-slate-500">
                    {htmlParser(content.value || "")}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
