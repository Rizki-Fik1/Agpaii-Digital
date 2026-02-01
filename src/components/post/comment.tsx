"use client";

import { getImage } from "@/utils/function/function";
import moment from "moment";
import "moment/locale/id";
import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/utils/api/config";
import { toast } from "sonner";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";

interface CommentProps {
  comment: any;
  postId: number | string;
  isReply?: boolean;
}

export default function Comment({ comment, postId, isReply = false }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  // Mutation untuk kirim balasan
  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: async () => {
      const res = await API.post(`/post/${postId}/comment`, {
        comment: replyText,
        parent_id: comment.id,
      });
      if (res.status === 200) return res.data;
      throw new Error("Gagal mengirim balasan");
    },
    onSuccess: () => {
      toast.success("Balasan terkirim");
      setReplyText("");
      setIsReplying(false);
      // Refresh data post untuk melihat komentar baru
      queryClient.invalidateQueries({ queryKey: ["post", String(postId)] });
    },
    onError: () => {
      toast.error("Gagal mengirim balasan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      sendReply();
    }
  };

  return (
    <div className={`flex flex-col w-full ${!isReply ? "py-2 mb-2 pl-3 ml-2 border-l-2 border-slate-200 bg-slate-50 rounded-r-lg p-3" : "mt-2"}`}>
      <div className="flex gap-3 items-start">
        <Image
          src={comment.author.avatar ? getImage(comment.author.avatar) : "/img/profileplacholder.png"}
          width={32}
          height={32}
          className="size-8 rounded-full object-cover flex-shrink-0"
          alt={comment.author.name || "User"}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-semibold text-sm text-slate-800">
              {comment.author.name || "unknown"}
            </h1>
            <span className="text-[10px] text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {moment(comment.created_at).locale("id").fromNow()}
            </span>
          </div>
          
          <div className="text-xs text-slate-500 mb-1">
            {comment.author.profile.school_place}
          </div>

          <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">
            {comment.value}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-semibold text-[#009788] hover:text-[#007d6f] transition-colors cursor-pointer"
            >
              {isReplying ? "Batal" : "Balas"}
            </button>
          </div>

          {/* Form Balasan */}
          {isReplying && (
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2 items-center">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Balas ${comment.author.name}...`}
                className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                disabled={isPending}
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isPending}
                className={clsx(
                  "p-2 rounded-full transition-all active:scale-90 flex-shrink-0",
                  !replyText.trim() || isPending ? "bg-slate-300" : "bg-[#009788]"
                )}
              >
                <PaperAirplaneIcon className={clsx(
                  "size-4",
                  !replyText.trim() || isPending ? "text-slate-500" : "text-white"
                )} />
              </button>
            </form>
          )}

          {/* Render Nested Replies - Pindah ke sini agar satu kolom */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply: any) => (
                <Comment 
                  key={reply.id} 
                  comment={reply} 
                  postId={postId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
