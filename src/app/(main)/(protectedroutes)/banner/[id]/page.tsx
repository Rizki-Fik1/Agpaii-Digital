"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import parser from "html-react-parser";
import { useParams } from "next/navigation";
import "./style.css";
import { getImage } from "@/utils/function/function";

export default function BannerPage() {
  const { id } = useParams();

  const { data: banner, isLoading } = useQuery({
    queryKey: ["banner", id],
    queryFn: async () => {
      const res = await API.get(`/banners/${id}`);
      if (res.status == 200) return res.data;
    },
  });

  const cleanHtmlContent = (html: string) => {
    return html
      .replace(/<!DOCTYPE html[^>]*>/gi, "")
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head[^>]*>[\s\S]*<\/head>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<body[^>]*>/gi, "")
      .replace(/<\/body>/gi, "");
  };

  if (!isLoading)
    return (
      <div className="pt-[4.21rem]">
        <TopBar withBackButton>Detail Banner</TopBar>
        <div className="px-6 py-8 ">
          <img className="rounded-md" src={getImage(banner.url)} alt="" />
          <h1 className="font-semibold text-xl text-slate-700 mt-8">
            {banner.title}
          </h1>
          <div className="mt-4 text-slate-600">
            {parser(cleanHtmlContent(banner.detailBanner))}
          </div>
        </div>
      </div>
    );
}
