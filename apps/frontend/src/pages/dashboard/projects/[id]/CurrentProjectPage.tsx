import { useEffect } from "react";
import PageLayout from "../../../../components/PageLayout";
import useProjects from "../../../../hooks/useProjects";
import { useParams } from "react-router";
import useUser from "../../../../hooks/useUser";
import ProjectActions from "./ProjectActions";
import ProjectHeader from "./ProjectHeader";
import UpdateProjectForm from "./UpdateProjectForm";
import ProjectDangerZone from "./ProjectDangerZone";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import FileDropzone from "../../../../components/files/FileDropzone";
import { FileUploadProvider } from "../../../../context/FileUploadProvider";
import FileUploadViewer from "../../../../components/files/FileUploadViewer";
import NewClientForm from "../../clients/NewClientForm";
import ProjectClients from "./ProjectClients";
import ProjectAccessGate from "../../../../components/auth/ProjectAccessLevel";
import useClientAuth from "../../../../hooks/useClientAuth";
import ProjectFiles from "./ProjectFiles";
import NewFolderForm from "../../../../components/folders/NewFolderForm";
import ProjectFileSystem from "./ProjectFileSystem";
import ProjectViewTabs from "./ProjectTabs/ProjectView";
import { useProjectContext } from "../../../../context/ProjectProvider";



const CurrentProjectPage = () => {
	const { currentUser } = useUser();
	const { client, getClient } = useClientAuth();
	const { project, loading, refreshProject } = useProjectContext();

	const { id } = useParams();

	useEffect(() => {
		if (!currentUser) {
			getClient();
		}
	}, [id, currentUser?.id, client?.id]);

	const isOwner = (!!currentUser && currentUser.id === project?.userId);

	if (loading) return <p>Loading...</p>;

	return (
		<ProjectAccessGate>
			<PageLayout>

				<div className="flex flex-col gap-6 p-6">
					<div className="flex items-center justify-between">
						<ProjectHeader project={project as ProjectWithUserInfo} isOwner={isOwner} />

					</div>
					{isOwner && (
						<ProjectViewTabs />
					)}
					{client && (
						<>
							<FileUploadProvider
								projectId={id as string}
								uploaderId={client?.id as string}
								uploaderType="CLIENT"
							>
								<section className="border border-red-600 rounded-md size-full p-8 space-y-8">
									<FileDropzone />
									<FileUploadViewer />
								</section>
							</FileUploadProvider>

							<ProjectFiles isProjectOwner={false} />
						</>
					)}
				</div>
			</PageLayout>
		</ProjectAccessGate>
	);
};
export default CurrentProjectPage;
