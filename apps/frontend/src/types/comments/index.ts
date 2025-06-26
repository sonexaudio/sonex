import type { Client } from "../../hooks/useClients";
import type { User } from "../users";

export interface ISonexComment {
    id: string;
    fileId: string;
    clientId: string | null;
    userId: string | null;
    parentId: string | null;
    replies: ISonexComment[];
    user: User | null;
    client: Client | null;
    content: string;
    timestamp: number;
    done: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export const GET_ALL_COMMENTS = "getComments";
export const GET_FILE_COMMENTS = "getFileComments";
export const POST_COMMENT = "postComment";
export const DELETE_COMMENT = "deleteComment";

export type CommentState = {
    allComments: ISonexComment[];
};

export type CommentReducerAction =
    | {
        type: typeof GET_ALL_COMMENTS;
        payload: { comments: ISonexComment[]; };
    }
    | {
        type: typeof GET_FILE_COMMENTS;
        payload: { comments: ISonexComment[]; };
    }
    | {
        type: typeof POST_COMMENT;
        payload: { comment: ISonexComment; };
    }
    | {
        type: typeof DELETE_COMMENT;
        payload: { id: string; };
    };