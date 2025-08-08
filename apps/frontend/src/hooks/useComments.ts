import { useCallback, useMemo } from "react";
import type { ISonexComment } from "../types/comments";
import { useAuth } from "./useAuth";
import useClientAuth from "./useClientAuth";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteComment, fetchComments, postComment, postReply, updateComment } from "./query-functions/comments";


export interface NewCommentData {
    content: string;
    isRevision: boolean;
    audioTimestamp?: number | null;
    userId?: string | null;
    clientId?: string | null;
}

export const useComments = () => {
    const { user } = useAuth();
    const { client } = useClientAuth();
    const { fileId } = useParams();

    const queryClient = useQueryClient();

    // helper to add user/client info to comment data
    const withUserClientInfo = useCallback((data: NewCommentData) => ({
        ...data,
        userId: user?.id || null,
        clientId: client?.id || null,
    }), [user, client]
    );

    // get all comments
    const fetchAll = useQuery({
        queryKey: ["comments", fileId],
        queryFn: ({ queryKey }) => fetchComments(queryKey[1] as string | undefined)
    });

    const create = useMutation({
        mutationFn: (commentData: NewCommentData) => postComment(withUserClientInfo(commentData)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        }
    });

    const update = useMutation({
        mutationFn: ({ id, commentData }: { id: string; commentData: NewCommentData; }) => updateComment(id, withUserClientInfo(commentData)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        }
    });

    const deleteSingleComment = useMutation({
        mutationFn: (id: string) => deleteComment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        }
    });

    const reply = useMutation({
        mutationFn: ({ parentId, replyData }: { parentId: string; replyData: NewCommentData; }) => postReply(parentId, replyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        }
    });

    const loading =
        fetchAll.isLoading ||
        create.isPending ||
        update.isPending ||
        deleteSingleComment.isPending ||
        reply.isPending;

    const error =
        fetchAll.error ||
        create.error ||
        update.error ||
        deleteSingleComment.error ||
        reply.error


    // Move buildCommentThreads outside the hook to avoid new function identity each render
    function buildCommentThreads(comments: ISonexComment[]) {
        const commentMap = new Map<
            string,
            ISonexComment & { replies: ISonexComment[]; }
        >();

        // Initialize all comments with empty replies
        comments.forEach((c) => {
            commentMap.set(c.id, { ...c, replies: [] });
        });

        const roots: (ISonexComment & { replies: ISonexComment[]; })[] = [];

        commentMap.forEach((comment) => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                roots.push(comment);
            }
        });

        return roots;
    }

    const threads = useMemo(() => {
        if (!fileId || !fetchAll.data) return [];
        return buildCommentThreads(fetchAll.data);
    }, [fetchAll.data, fileId]);


    return {
        comments: fetchAll.data || [],
        postComment: create.mutateAsync,
        postReply: reply.mutateAsync,
        deleteComment: deleteSingleComment.mutateAsync,
        loading,
        error,
        threads,
    };
};
