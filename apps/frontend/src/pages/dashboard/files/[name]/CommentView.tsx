import { useEffect } from "react";
import { useComments } from "../../../../hooks/useComments";
import { useParams } from "react-router";
import type { ISonexComment } from "../../../../types/comments";

export const CommentCard = ({ comment }: { comment: ISonexComment; }) => {
    const { deleteComment } = useComments();

    const handleDeleteComment = async () => {
        await deleteComment(comment.id);
    };

    return (
        <div key={comment.id} className="flex justify-between items-center border-b p-2">
            <span>{comment.content} - by {comment.user ? comment.user?.firstName : comment.client?.name}</span>
            <button type="button" onClick={handleDeleteComment}>X</button>
        </div>
    );
};


const CommentView = () => {
    const { fileId } = useParams();
    const { comments: { allComments }, loading, getComments } = useComments();

    useEffect(() => {
        getComments(fileId);
    }, [fileId]);

    if (loading) return <p>Loading Comments...</p>;

    return (
        <div className="border shadow rounded p-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            {
                allComments.length > 0 ? (
                    allComments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))
                ) : (
                    <p>No comments for this file.</p>
                )

            }
        </div>
    );
};

export default CommentView;