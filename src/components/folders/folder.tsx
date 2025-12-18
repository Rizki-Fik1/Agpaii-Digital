"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import {
  DocumentIcon,
  FolderIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

const downloadFile = async (content: any) => {
  let url = process.env.NEXT_PUBLIC_STORAGE_URL + "/" + content.src;
  let name = content.name;
  await fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  })
    .then(async (res) => await res.blob())
    .then((blob) => {
      console.log(blob);
      let url = URL.createObjectURL(blob);
      forceDownload(url, name);
    })
    .catch((err) => console.log(err));
};

const forceDownload = (blob: any, filename: string) => {
  let a = document.createElement("a");
  a.download = filename;
  a.href = blob;
  a.click();
  a.remove();
};

export const Folder = ({
  content,
  onClick,
  onDoubleClick,
  selected = false,
  onDelete,
  onEdit,
}: {
  content: any;
  onDoubleClick?: () => void;
  onClick: () => void;
  selected?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}) => {
  const router = useRouter();
  return (
    <div
      onClick={onClick}
      onDoubleClick={() => router.push("/dashboard/cloud/" + content.id)}
      className={clsx(
        "text-sm py-3 cursor-default font-medium flex items-center gap-3 border border-slate-200 text-slate-600 px-5",
        selected && "bg-slate-100"
      )}
    >
      <FolderIcon className="size-6" />

      {content.name}
      {selected && (
        <div className="flex gap-5 ms-auto">
          <PencilIcon onClick={onEdit} className="size-[1.10rem]" />
          <TrashIcon onClick={onDelete} className="size-[1.10rem]" />
        </div>
      )}
    </div>
  );
};

export const File = ({
  content,
  onClick,
  selected = false,
  onDelete,
  onDoubleClick,
  onEdit,
}: {
  content: any;
  onDoubleClick?: () => void;
  onClick: () => void;
  selected?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}) => {
  return (
    <div
      onDoubleClick={() => window.open(`/preview?src=${content.src}`, "_blank")}
      onClick={onClick}
      className={clsx(
        "text-sm py-3 cursor-default font-medium flex items-center gap-3 border border-slate-200 text-slate-600 px-5",
        selected && "bg-slate-100"
      )}
    >
      <DocumentIcon className="size-6" />

      {content.name}

      {selected && (
        <div className="flex gap-5 ms-auto">
          <PencilIcon onClick={onEdit} className="size-[1.10rem]" />
          <TrashIcon onClick={onDelete} className="size-[1.10rem]" />
          <ArrowDownTrayIcon
            id={content.name}
            onClick={() => downloadFile(content)}
            className="size-[1.10rem] "
          />
        </div>
      )}
    </div>
  );
};
