import PageLayout from "../../../../components/PageLayout";
import FilePlayer from "../FilePlayer";
import CommentView from "./CommentView";
import NewCommentForm from "./NewCommentForm";

const SingleFilePage = () => {
    return (
        <PageLayout>
            <div>
                <FilePlayer />
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="col-span-2">
                        <CommentView />
                    </div>
                    <div className="col-span-1">
                        <NewCommentForm />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default SingleFilePage;