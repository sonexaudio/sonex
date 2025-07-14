import { useNavigate, useParams } from "react-router";
import PageLayout from "../../../../components/PageLayout";
import FileView from "./FileView";
import SingleFileContextProvider from "../../../../context/SingleFileContextProvider";
import { ProjectProvider } from "../../../../context/ProjectProvider";

const SingleFilePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    return (
        <PageLayout>
            <ProjectProvider>
                <SingleFileContextProvider>
                    <FileView
                        onBack={() => navigate(`/projects/${id as string}`)}
                    />
                </SingleFileContextProvider>
            </ProjectProvider>
        </PageLayout>
    );
};

export default SingleFilePage;