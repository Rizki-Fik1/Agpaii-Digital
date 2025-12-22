import { LinkIcon, CalendarDaysIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { MapPinIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import moment from "moment";
import Link from "next/link";

export default function Event({
  event,
  type,
  auth,
  onDelete,
}: {
  event: any;
  type?: string;
  auth?: any;
  onDelete?: (id: string) => void;
}) {
  const shouldShowButtons = type === "me" && event?.user_id === auth?.id;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 relative">
        <img
          src={process.env.NEXT_PUBLIC_STORAGE_URL + "/" + event?.author.avatar}
          className="size-10 rounded-full object-cover border border-slate-100"
          alt={event?.author.name}
        />
        <div>
          <h1 className="text-sm font-semibold text-slate-800">
            {event?.author.name || "User"}
          </h1>
          <p className="text-xs text-slate-500">
            {event?.author.work_unit || "Guru AGPAII"}
          </p>
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {shouldShowButtons && (
          <div className="absolute right-4 top-4 flex gap-2">
            <Link
              href={`/event/edit/${event.id}`}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <PencilIcon className="size-4" />
            </Link>
            <button
              onClick={() => onDelete && onDelete(event.id)}
              className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-slate-50">
        <img
          src={
            event?.image !== null
              ? process.env.NEXT_PUBLIC_STORAGE_URL + "/" + event.image
              : "/img/agpaii_splash.svg"
          }
          className={clsx(
            "w-full h-full object-cover transition-transform hover:scale-105 duration-500",
            event?.image == null && "p-8 object-contain opacity-50"
          )}
          alt={event?.name}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
            {event?.name}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {moment(event?.start_at).locale("id").format("D MMMM YYYY [pukul] HH:mm")}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          {event?.link && (
            <div className="flex items-start gap-2.5">
               <LinkIcon className="size-4 text-[#009788] mt-0.5 shrink-0" />
               <a href={event.link} target="_blank" rel="noreferrer" className="text-[#009788] hover:underline truncate">
                  {event.link}
               </a>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <CalendarDaysIcon className="size-4 text-[#009788] shrink-0" />
            <span>
              {event?.type === "Daring" || event?.type === "online_event"
                ? "Daring"
                : "Luring"}
            </span>
          </div>

          {(event?.address && event?.address !== "null" && event?.address !== "Daring") && (
             <div className="flex items-center gap-2.5">
                <MapPinIcon className="size-4 text-[#009788] shrink-0" />
                <span className="truncate">{event.address}</span>
             </div>
          )}
        </div>

        {/* Footer/Action */}
        <div className="flex justify-end pt-2">
          <Link
            href={`/event/${event.id}`}
            className="flex items-center gap-1 bg-[#01574e] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#004d44] transition-colors"
          >
            Detail
            <ArrowUpRightIcon className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}