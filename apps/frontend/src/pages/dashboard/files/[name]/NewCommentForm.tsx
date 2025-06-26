import { useState, type FormEvent } from "react";
import { useComments } from "../../../../hooks/useComments";
import { useParams } from "react-router";
import useUser from "../../../../hooks/useUser";
import useClientAuth from "../../../../hooks/useClientAuth";

const NewCommentForm = () => {
    const { postComment } = useComments();
    const { fileId } = useParams();
    const { currentUser } = useUser();
    const { client } = useClientAuth();
    const [content, setContent] = useState("");
    const [isRevision, setIsRevision] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handlePostComment = async (e: FormEvent) => {
        e.preventDefault();
        if (!content) return;
        setSubmitting(true);

        try {
            const commentData = {
                fileId,
                content,
                userId: currentUser ? currentUser.id : null,
                clientId: client ? client.id : null,
            };
            await postComment(commentData);
            setContent("");
        } catch (error) {
            console.error("Can't post comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="flex flex-col" onSubmit={handlePostComment}>
            <h3 className="text-lg">Add New Comment</h3>
            <label htmlFor="content" className="flex flex-col">
                Text
                <input type="text" placeholder="Enter your comment..." value={content} onChange={(e) => setContent(e.target.value)} />
            </label>
            <label htmlFor="timestamp">
                <input type="checkbox" name="timestamp" checked={isRevision} onChange={() => setIsRevision(!isRevision)} />
                This is a revision
            </label>
            <button type="submit" disabled={submitting}>Submit</button>
        </form>
    );
};

export default NewCommentForm;