import { useEffect } from "react";
import AuthLayout from "../../../../components/AuthLayout";
import PageLayout from "../../../../components/PageLayout";
import useProjects from "../../../../hooks/useProjects";
import { useParams } from "react-router";
import useUser from "../../../../hooks/useUser";
import ProjectDetails from "./ProjectDetails";
import ProjectActions from "./ProjectActions";
import ProjectHeader from "./ProjectHeader";
import UpdateProjectForm from "./UpdateProjectForm";
import ProjectDangerZone from "./ProjectDangerZone";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import { FileUploadProvider } from "../../../../context/FileUploadProvider";
import FileUploader from "../../../../components/files/FileUploader";
import FileUploadView from "../../../../components/files/FileUploadView";

const CurrentProjectPage = () => {
	const { currentUser } = useUser();
	const { getSingleProject, loading, state } = useProjects();
	const { id } = useParams();

	useEffect(() => {
		getSingleProject(id as string);
	}, [id]);

	const project = state.currentProject as ProjectWithUserInfo;
	const isOwner = !!currentUser && currentUser.id === project?.userId;

	if (loading) return <p>Loading...</p>;

	return (
		<AuthLayout>
			<PageLayout>
				<div>
					<ProjectHeader isOwner={isOwner} project={project} />
					<ProjectActions isOwner={isOwner} project={project} />
					<ProjectDetails project={project} />
					<div className="flex gap-8 w-full">
						<UpdateProjectForm project={project} />
						<FileUploadProvider
							meta={{
								projectId: id as string,
								uploaderId: currentUser?.id as string, // for now
								uploaderType: isOwner ? "USER" : "CLIENT",
							}}
						>
							<div>
								<FileUploader />
								<FileUploadView />
							</div>
						</FileUploadProvider>
					</div>
					<div className="my-8">
						<ProjectDangerZone />
					</div>
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default CurrentProjectPage;
