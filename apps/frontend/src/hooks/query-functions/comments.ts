import api from "../../lib/axios";

export interface NewCommentData {
    content: string;
    isRevision: boolean;
    audioTimestamp?: number | null;
    userId?: string | null;
    clientId?: string | null;
}

export async function fetchComments(fileId?: string) {
    // Check if file id is provided
    // If so, fetch comments for that specific file
    // Otherwise, fetch all comments
    const params = fileId ? { fileId } : {};

    const { data } = await api.get("/comments", {
        params,
    });

    return data.data.comments; // returns the comments
}

export async function postComment(commentData: NewCommentData) {
    const { data } = await api.post("/comments", commentData);
    return data.data.comment; // returns the newly created comment
}

export async function updateComment(id: string, commentData: NewCommentData) {
    const { data } = await api.put(`/comments/${id}`, commentData);
    return data.data.comment; // returns the updated comment
}

export async function deleteComment(id: string) {
    await api.delete(`/comments/${id}`);
    return id; // returns the id of the deleted comment
}

// Function to post a reply to a comment
export async function postReply(parentId: string, replyData: {
    content: string;
    isRevision: boolean;
    audioTimestamp?: number | null;
    userId?: string | null;
    clientId?: string | null;
}) {
    const { data } = await api.post("/comments/reply", {
        ...replyData,
        parentId,
    });
    return data.data.comment; // returns the newly created reply
}