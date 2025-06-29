import { useNavigate, useParams } from "react-router";
import PageLayout from "../../../../components/PageLayout";
import FilePlayer from "../../../../components/AudioPlayer";
import CommentView from "./CommentView";
import FileView from "./FileView";
import NewCommentForm from "./NewCommentForm";

const SingleFilePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    return (
        <PageLayout>
            <FileView
                onBack={() => navigate(`/projects/${id as string}`)}
            />
        </PageLayout>
    );
};

export default SingleFilePage;