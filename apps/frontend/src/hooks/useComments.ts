import { useReducer, useState } from "react";
import { DELETE_COMMENT, GET_ALL_COMMENTS, GET_FILE_COMMENTS, POST_COMMENT, type CommentReducerAction, type CommentState, type ISonexComment } from "../types/comments";
import api from "../lib/axios";

function commentReducer(state: CommentState, action: CommentReducerAction) {
    switch (action.type) {
        case GET_ALL_COMMENTS:
            return { ...state, allComments: action.payload.comments };
        case GET_FILE_COMMENTS:
            return { ...state, allComments: action.payload.comments };
        case POST_COMMENT:
            return { ...state, allComments: [action.payload.comment, ...state.allComments] };
        case DELETE_COMMENT:
            return { ...state, allComments: state.allComments.filter(c => c.id !== action.payload.id) };
        default:
            return state;
    }
}


export function useComments() {
    const [comments, dispatch] = useReducer(commentReducer, { allComments: [] });
    const [loading, setLoading] = useState(true);

    async function getComments(fileId: string | null = null) {
        setLoading(true);
        try {
            const params = fileId ? { fileId } : {};
            const { data: { data } } = await api.get("/comments", { params });
            dispatch({ type: fileId ? GET_FILE_COMMENTS : GET_ALL_COMMENTS, payload: { comments: data.comments } });
        } catch (error) {
            console.error("Failed to fetch files:", error);
        } finally {
            setLoading(false);
        }
    }

    async function postComment(commentData: Partial<ISonexComment>) {
        try {
            const { data: { data } } = await api.post("/comments", commentData);
            dispatch({ type: POST_COMMENT, payload: data.comment });
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    }

    async function deleteComment(id: string) {
        try {
            await api.delete(`/comments/${id}`);
            dispatch({ type: DELETE_COMMENT, payload: { id } });
        } catch (error) {
            console.error("Error Deleting Comment", error);
        }
    }

    return {
        comments,
        loading,
        getComments,
        postComment,
        deleteComment
    };
}