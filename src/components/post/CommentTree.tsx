
import Comment from "@/components/post/comment";
import { useMemo } from "react";

export function CommentTree({ comments, postId }: { comments: any[], postId: any }) {
    // Helper untuk build tree tapi FLATTEN replies (1 level nesting saja)
    const commentTree = useMemo(() => {
       if (!comments || comments.length === 0) return [];
       
        const buildCommentTree = (rawComments: any[]) => {
            const commentMap: { [key: string]: any } = {};
            const roots: any[] = [];

            // 1. Copy ke map
            rawComments.forEach((c) => {
            commentMap[c.id] = { ...c, replies: [] }; 
            });

            // 2. Helper cari Root ID
            const findRootId = (currId: string): string | null => {
            let curr = commentMap[currId];
            let safety = 0;
            while(curr && curr.parent_id && safety < 50) {
                if(commentMap[curr.parent_id]) {
                curr = commentMap[curr.parent_id];
                } else {
                return null; // Orphan
                }
                safety++;
            }
            return curr ? curr.id : null;
            };

            // 3. Distribusi comments
            rawComments.forEach((c) => {
            if (c.parent_id) {
                const rootId = findRootId(c.id);
                if (rootId && commentMap[rootId]) {
                // Masukkan semua descendants ke array replies milik ROOT
                commentMap[rootId].replies.push(commentMap[c.id]);
                } else {
                // Jika chain putus, anggap root
                roots.push(commentMap[c.id]);
                }
            } else {
                roots.push(commentMap[c.id]);
            }
            });

            // 4. Sort
            const sortComments = (a: any, b: any) => 
            new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf();

            roots.sort(sortComments);
            
            // Sort replies di dalam root
            roots.forEach((root) => {
            if (root.replies.length > 0) {
                root.replies.sort(sortComments);
            }
            });

            return roots;
        };
        
        return buildCommentTree(comments);
    }, [comments]);


    return commentTree.length > 0 ? (
        <div className="flex flex-col gap-4">
            {commentTree.map((comment: any, i: number) => (
            <Comment comment={comment} postId={postId} key={comment.id || i} />
            ))}
        </div>
    ) : (
        <div className="text-sm text-slate-500">Tidak ada Komentar</div>
    );
}
