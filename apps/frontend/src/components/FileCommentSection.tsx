import type React from "react";
import { useComments } from "../hooks/useComments";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageSquare } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { useSingleFileContext } from "../context/SingleFileContextProvider";
import useClientAuth from "../hooks/useClientAuth";
import useUser from "../hooks/useUser";


const FileCommentSection: React.FC = () => {
    const { client } = useClientAuth();
    const { currentUser } = useUser();
    const { comments, postComment, postReply, threads } = useComments();
    const { currentFile, seekToTime } = useSingleFileContext();

    console.log("COMMENT THREADS", threads);

    const handleNewComment = async (content: string, isRevision: boolean, audioTimestamp?: number) => {
        await postComment({ content, isRevision, audioTimestamp });
    };

    const handleReply = async (parentId: string, content: string, isRevision: boolean, audioTimestamp?: number) => {
        await postReply(parentId, { content, isRevision, audioTimestamp, clientId: client?.id || null, userId: currentUser?.id || null });
    };

    const handleTimestampClick = (time: number) => {
        seekToTime(time);
    };


    const fileComments = comments.filter((comment) => comment.fileId === currentFile?.id);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-x-2">
                        <MessageSquare className="size-5" />
                        <span>Comments ({fileComments.length === 0 ? 0 : fileComments?.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0)})</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* New Comment Form */}
                <div className="mb-8">
                    <CommentForm onSubmit={handleNewComment} />
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageSquare className="size-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        threads?.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={handleReply}
                                onTimestampClick={handleTimestampClick}
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FileCommentSection;