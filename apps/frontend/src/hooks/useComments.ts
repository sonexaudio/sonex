import { useCallback, useEffect, useMemo, useState } from "react";
import type { ISonexComment } from "../types/comments";
import api from "../lib/axios";
import { useAuth } from "./useAuth";
import useClientAuth from "./useClientAuth";
import { useParams } from "react-router";


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

    const [comments, setComments] = useState<ISonexComment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id || client?.id) {
            getComments();
        }
    }, [user?.id, client?.id, fileId]);

    const getComments = async () => {
        setLoading(true);
        try {
            const params = fileId ? { fileId: fileId as string } : {};
            const {
                data: { data },
            } = await api.get("/comments", { params });
            setComments(data.comments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const postComment = useCallback(async (commentData: NewCommentData) => {
        setLoading(true);
        try {
            const newComment: Partial<ISonexComment> = {
                clientId: client?.id || null,
                userId: user?.id || null,
                fileId: fileId as string,
                content: commentData.content,
                timestamp: commentData.isRevision
                    ? (commentData.audioTimestamp as number)
                    : null,
            };

            const {
                data: { data },
            } = await api.post("/comments", newComment);

            if (data) {
                getComments();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const postReply = useCallback(
        async (parentId: string, replyData: NewCommentData) => {
            setLoading(true);
            try {
                const newReply: Partial<ISonexComment> = {
                    clientId: client?.id || null,
                    userId: user?.id || null,
                    fileId: fileId as string,
                    content: replyData.content,
                    timestamp: replyData.isRevision
                        ? (replyData.audioTimestamp as number)
                        : null,
                    parentId,
                };

                const {
                    data: { data },
                } = await api.post("/comments/reply", newReply);

                if (data.comment) {
                    await getComments();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const deleteComment = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await api.delete(`/comments/${id}`);
            setComments((prev) =>
                prev
                    .filter((comment) => comment.id !== id)
                    .map((comment) => ({
                        ...comment,
                        replies: comment.replies.filter((reply) => reply.id !== id),
                    })),
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const threads = useMemo(() => {
        if (!fileId) return [];

        // Build a map of comments
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
    }, [comments, fileId]);

    return {
        comments,
        postComment,
        postReply,
        deleteComment,
        loading,
        threads,
    };
};
