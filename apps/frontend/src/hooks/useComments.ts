import { useCallback, useEffect, useReducer, useState } from "react";
import { DELETE_COMMENT, GET_ALL_COMMENTS, GET_FILE_COMMENTS, POST_COMMENT, type CommentReducerAction, type CommentState, type ISonexComment } from "../types/comments";
import api from "../lib/axios";
import { useAuth } from "./useAuth";
import useClientAuth from "./useClientAuth";
import useFiles from "./useFiles";

// function commentReducer(state: CommentState, action: CommentReducerAction) {
//     switch (action.type) {
//         case GET_ALL_COMMENTS:
//             return { ...state, allComments: action.payload.comments };
//         case GET_FILE_COMMENTS:
//             return { ...state, allComments: action.payload.comments };
//         case POST_COMMENT:
//             return { ...state, allComments: [action.payload.comment, ...state.allComments] };
//         case DELETE_COMMENT:
//             return { ...state, allComments: state.allComments.filter(c => c.id !== action.payload.id) };
//         default:
//             return state;
//     }
// }


// export function useComments() {
//     const [comments, dispatch] = useReducer(commentReducer, { allComments: [] });
//     const [loading, setLoading] = useState(true);

//     async function getComments(fileId: string | null = null) {
//         setLoading(true);
//         try {
//             const params = fileId ? { fileId } : {};
//             const { data: { data } } = await api.get("/comments", { params });
//             dispatch({ type: fileId ? GET_FILE_COMMENTS : GET_ALL_COMMENTS, payload: { comments: data.comments } });
//         } catch (error) {
//             console.error("Failed to fetch files:", error);
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function postComment(commentData: Partial<ISonexComment>) {
//         try {
//             const { data: { data } } = await api.post("/comments", commentData);
//             dispatch({ type: POST_COMMENT, payload: data.comment });
//         } catch (error) {
//             console.error("Failed to add comment", error);
//         }
//     }

//     async function deleteComment(id: string) {
//         try {
//             await api.delete(`/comments/${id}`);
//             dispatch({ type: DELETE_COMMENT, payload: { id } });
//         } catch (error) {
//             console.error("Error Deleting Comment", error);
//         }
//     }

//     return {
//         comments,
//         loading,
//         getComments,
//         postComment,
//         deleteComment
//     };
// }

export interface NewCommentData {
    content: string;
    isRevision: boolean;
    audioTimestamp?: number;
}

export const useComments = () => {
    const { user } = useAuth();
    const { client } = useClientAuth();
    const { files: { currentFile } } = useFiles();

    const [comments, setComments] = useState<ISonexComment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id || client?.id) {
            getComments();
        }
    }, [user?.id, client?.id, currentFile?.id]);

    const getComments = async () => {
        setLoading(true);
        try {
            const params = currentFile?.id ? { fileId: currentFile?.id as string } : {};
            const { data: { data } } = await api.get("/comments", { params });
            console.log(comments);
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
                clientId: client ? client.id : null,
                userId: user ? user.id : null,
                fileId: currentFile?.id,
                content: commentData.content,
                timestamp: commentData.isRevision ? commentData.audioTimestamp as number : null
            };

            const { data: { data } } = await api.post("/comments", newComment);

            setComments(prev => [...prev, data.comment]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }, []);

    const postReply = useCallback(async (parentId: string, replyData: NewCommentData) => {
        setLoading(true);
        try {
            const newReply: Partial<ISonexComment> = {
                clientId: client ? client.id : null,
                userId: user ? user.id : null,
                fileId: currentFile?.id,
                content: replyData.content,
                timestamp: replyData.isRevision ? replyData.audioTimestamp as number : null
            };

            const { data: { data } } = await api.post("/comments/reply", { reply: newReply, parentId });

            setComments(prev => prev.map(comment => {
                if (comment.id === parentId) {
                    return { ...comment, replies: [...comment.replies, data.reply] };
                }

                return {
                    ...comment,
                    replies: comment.replies.map(reply => reply.id === parentId ? { ...reply, replies: [...reply.replies, data.reply] } : reply)
                };
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }, []);

    const deleteComment = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await api.delete(`/comments/${id}`);
            setComments(prev =>
                prev
                    .filter(comment => comment.id !== id)
                    .map(comment => ({
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== id)
                    }))
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        comments,
        postComment,
        postReply,
        deleteComment,
        loading,
    };
};