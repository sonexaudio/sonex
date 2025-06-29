import type { ISonexComment } from "../types/comments";
import type React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, Clock, MessageCircle } from "lucide-react";
import CommentForm from "./CommentForm";
import { differenceInMinutes } from "date-fns";

interface CommentItemProps {
    comment: ISonexComment;
    onReply: (
        parentId: string,
        content: string,
        isRevision: boolean,
        audioTimeStamp?: number,
    ) => void;
    getCurrentTime?: () => number;
    onTimestampClick?: (time: number) => void;
    level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    onReply,
    getCurrentTime,
    onTimestampClick,
    level = 0,
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatRelativeTime = (date: Date) => {
        const diffInMinutes = differenceInMinutes(new Date(), date);

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const handleReply = (content: string, isRevision: boolean, audioTimeStamp?: number) => {
        onReply(comment.id, content, isRevision, audioTimeStamp);
        setShowReplyForm(false);
    };

    const handleTimeStampClick = () => {
        if (comment.timestamp !== null && onTimestampClick) {
            onTimestampClick(comment.timestamp);
        }
    };

    return (
        <div className={`${level > 0 ? "ml-8 border-1 border-muted-foreground pl-4" : ""}`}>
            <div className="flex gap-x-3 mb-4">
                <div className="size-8 bg-gradient-to-br from-bg-primary to-bg-primary/50 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-white">{comment.client?.name[0]}</span>
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-muted rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-x-2">
                            <span className="font-medium">{comment.client?.name}</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt as Date)}</span>
                            {comment.timestamp && (
                                <Button onClick={handleTimeStampClick} className="flex items-center gap-x-1 text-xs text-primary bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors duration-200">
                                    <Clock size="size-3" />
                                    <span>@ {formatTime(comment.timestamp)}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>

                <div className="flex items-center gap-x-4 text-xs">
                    <Button onClick={() => setShowReplyForm(!showReplyForm)}>
                        <MessageCircle className="size-3" />
                        <span>Reply</span>
                    </Button>

                    {comment.replies?.length > 0 && (
                        <Button onClick={() => setShowReplies(!showReplies)}>
                            {showReplies ? (
                                <ChevronDown className="size-3" />
                            ) : (
                                <ChevronRight className="size-3" />
                            )}
                            <span>{comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}</span>
                        </Button>
                    )}



                </div>
                {showReplyForm && (
                    <div className="mt-3">
                        <CommentForm
                            onSubmit={handleReply}
                            getCurrentTime={getCurrentTime}
                            placeholder="Write a reply"
                            buttonText="Reply"
                            compact
                        />
                    </div>
                )}
            </div>


            {showReplies && comment.replies?.length > 0 && (
                <div className="space-y-4">
                    {comment.replies?.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            getCurrentTime={getCurrentTime}
                            onTimestampClick={onTimestampClick}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
