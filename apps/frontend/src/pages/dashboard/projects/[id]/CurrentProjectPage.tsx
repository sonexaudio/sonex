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
import FileDropzone from "../../../../components/files/FileDropzone";
import { FileUploadProvider } from "../../../../context/FileUploadProvider";
import FileUploadViewer from "../../../../components/files/FileUploadViewer";
import NewClientForm from "../../clients/NewClientForm";
import ProjectClients from "./ProjectClients";

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
							projectId={id as string}
							uploaderId={currentUser?.id as string}
							uploaderType="USER"
						>
							<section className="border border-red-600 rounded-md size-full p-8 space-y-8">
								<FileDropzone />
								<FileUploadViewer />
							</section>
						</FileUploadProvider>
					</div>
				</div>
				<div>
					<NewClientForm />
					<ProjectClients />
				</div>
				<div className="my-8">
					<ProjectDangerZone />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default CurrentProjectPage;
