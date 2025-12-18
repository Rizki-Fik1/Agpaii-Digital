import { getImage } from "@/utils/function/function";
import moment from "moment";
import "moment/locale/id";

export default function Comment({ comment }: { comment: any }) {
  return (
    <div className="flex flex-col py-3">
      <div className="flex gap-3">
        <img
          src={getImage(comment.author.avatar)}
          className="size-10 rounded-full"
          alt=""
        />
        <div>
          <h1 className="font-medium text-sm">
            {comment.author.name || "unknown"}
          </h1>
          <h2 className="text-neutral-600 text-xs mt-0.5">
            {comment.author.profile.school_place}
          </h2>
        </div>
      </div>
      <div className="pl-[3.2rem] text-sm">
        <h1 className="">{comment.value}</h1>
        <h2 className="text-xs mt-1 text-neutral-600">
          {moment(comment.created_at).locale("id").fromNow()}
        </h2>
        <div className="pt-4 text-neutral-700 cursor-pointer">Balas</div>
      </div>
    </div>
  );
}
