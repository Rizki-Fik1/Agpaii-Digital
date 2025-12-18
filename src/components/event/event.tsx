import { LinkIcon, TvIcon } from "@heroicons/react/24/outline";
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
    <div className="shadow relative bg-white border border-slate-300 rounded-md">
      {/* Delete Button */}
      {shouldShowButtons && (
        <div
        onClick={() => onDelete && onDelete(event.id)}
        className="p-2 px-3 bg-red-600 text-white absolute right-0 top-0 text-sm rounded-bl-md cursor-pointer z-50"
      >
        <TrashIcon className="size-5" />
      </div>
      )}
      {/* End Delete Button */}

      {/* Optional: Tombol Edit (update) */}
      {shouldShowButtons && (
        <Link
          href={`/event/edit/${event.id}`}
          className="p-2 px-3 bg-blue-600 text-white absolute right-12 top-0 text-sm rounded-bl-md cursor-pointer z-50"
        >
          <PencilIcon className="size-5" />
        </Link>
      )}

      <div className="absolute pl-4 pr-5 py-2.5 rounded-tl-md w-full top-0 left-0 bg-white flex items-center gap-3 border border-slate-200">
        <img
          src={process.env.NEXT_PUBLIC_STORAGE_URL + "/" + event?.author.avatar}
          className="size-6 rounded-full object-cover object-center"
          alt={"-"}
        />
        <h1 className="text-sm font-medium text-slate-600">
          {event?.author.name || "User"}
        </h1>
      </div>
      <div className="aspect-video overflow-hidden">
        <img
          src={
            event?.image !== null
              ? process.env.NEXT_PUBLIC_STORAGE_URL + "/" + event.image
              : "/img/agpaii_splash.svg"
          }
          className={clsx(
            "size-full object-cover rounded-t-md ",
            event?.image == null ? "object-center mt-5" : "object-top"
          )}
          alt=""
        />
      </div>
      <div className="px-4 py-4">
        <Link href={`/event/${event.id}`}>
          <h1 className="font-semibold">{event?.name}</h1>
          <p className="text-slate-600 text-sm">
            {moment(event?.start_at).locale("id").format("LLL")}
          </p>
        </Link>
        <div className="flex flex-col pt-4 gap-y-3 *:!text-sm *:break-all *:items-start">
          {event?.address !== "null" &&
            event.address !== null &&
            event?.address !== "Daring" && (
              <div className="flex gap-3 pr-5 ">
                <MapPinIcon className="text-[#009788] size-5 min-w-5" />
                <h1 className="mt-0.5">{event?.address}</h1>
              </div>
            )}
          {event?.link !== null && (
            <div className="flex gap-3">
              <LinkIcon className="text-[#009788] size-5 min-w-5" />
              <Link href={event?.link} className="text-blue-500">
                {event?.link}
              </Link>
            </div>
          )}
          <div className="flex gap-3 text-slate-600">
            <TvIcon className="size-5 text-[#009788] min-w-5" />
            {event?.type == "Daring" || event?.type == "online_event"
              ? "Daring"
              : "Luring"}
          </div>
        </div>
      </div>
    </div>
  );
}