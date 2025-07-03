import { useNavigate, useParams } from "react-router";
import PageLayout from "../../../../components/PageLayout";
import FileView from "./FileView";
import SingleFileContextProvider from "../../../../context/SingleFileContextProvider";

const SingleFilePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    return (
        <PageLayout>
            <SingleFileContextProvider>
                <FileView
                    onBack={() => navigate(`/projects/${id as string}`)}
                />
            </SingleFileContextProvider>
        </PageLayout>
    );
};

export default SingleFilePage;