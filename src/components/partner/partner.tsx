import clsx from "clsx";

import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Partner({
  partner,
  className,
  onDelete,
  onEdit,
  i,
}: {
  partner: any;
  onEdit?: () => any;
  onDelete?: () => any;
  className?: string;
  i: number;
}) {
  return (
    <>
      <tr
        className={clsx(
          "*:px-2 *:sm:px-4  *:py-3 border-b border-b-slate-300",
          !!className && className,
          i % 2 == 0 && "bg-slate-100"
        )}
        key={i}
      >
        <td className="text-center">{i + 1}</td>
        <td>
          <Link
            href={`/dashboard/partner/${partner.id}/user`}
            className="sm:hidden text-sm"
          >
            {trimText(partner.name, 10)}
          </Link>
          <Link
            href={`/dashboard/partner/${partner.id}/user`}
            className="max-sm:hidden "
          >
            {partner.name}
          </Link>
        </td>
        <td className="text-center">
          <div className="flex gap-4 justify-end mr-12">
            {!!partner.has_subpartners && (
              <Link href={`/dashboard/partner/${partner.id}`}>
                <UserGroupIcon className="size-[1.10rem] text-blue-500" />
              </Link>
            )}

            <PencilIcon
              onClick={onEdit}
              className="size-[1.10rem] text-green-600"
            />
            <TrashIcon
              onClick={onDelete}
              className="size-[1.10rem] text-red-600 cursor-pointer"
            />
          </div>
        </td>
      </tr>
    </>
  );
}
