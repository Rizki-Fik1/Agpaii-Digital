"use client";

import { useParams } from "next/navigation";
import API from "@/utils/api/config";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/nav/topbar";
import { useState } from "react";
import { toast } from "sonner";

export default function EventTokenPage() {
  const { id } = useParams();
  const [active, setActive] = useState<number | null>(null);

  const fetchEvent = async () => {
    const res = await API.get(`/event/${id}`);
    return res.data;
  };

  const { data: event } = useQuery({
    queryKey: ["event-token", id],
    queryFn: fetchEvent,
  });

  return (
    <div className="pt-[4.21rem] px-6 pb-20">
      <TopBar withBackButton>Token Acara</TopBar>

      <h1 className="font-semibold text-lg mt-4">{event?.name}</h1>

      <div className="mt-6 flex flex-col gap-4">
        {event?.session_detail?.map((session: any, idx: number) => {
          const token = `${session.event_id}${session.id}`;

          return (
            <div
              key={session.id}
              className="border border-slate-300 rounded-md"
            >
              {/* HEADER */}
              <div
                onClick={() => setActive(active === idx ? null : idx)}
                className="p-4 bg-[#009788] text-white rounded-md cursor-pointer"
              >
                <span className="font-medium">{session.session_name}</span>
              </div>

              {/* CONTENT */}
              {active === idx && (
                <div className="p-4 bg-slate-100 text-center rounded-md">
                  <div className="bg-white px-6 py-3 rounded-md font-semibold tracking-widest">
                    {token}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(token);
                      toast.success("Token berhasil disalin");
                    }}
                    className="mt-3 px-4 py-2 bg-[#009788] text-white rounded-md"
                  >
                    Copy Token
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
