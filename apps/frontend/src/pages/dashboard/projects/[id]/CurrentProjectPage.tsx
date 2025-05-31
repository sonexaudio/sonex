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
import ProjectAccessGate from "../../../../components/auth/ProjectAccessLevel";
import useClientAuth from "../../../../hooks/useClientAuth";
import ProjectFiles from "./ProjectFiles";


const CurrentProjectPage = () => {
	const { currentUser } = useUser();
	const { client, getClient } = useClientAuth();

	const { getSingleProject, loading, state } = useProjects();
	const { id } = useParams();

	useEffect(() => {
		if (id) {
			getSingleProject(id as string);

			if (!currentUser) {
				getClient();
			}
		}

	}, [id, currentUser?.id, client?.id]);

	const project = state.currentProject as ProjectWithUserInfo;
	const isOwner = (!!currentUser && currentUser.id === project?.userId);

	if (loading) return <p>Loading...</p>;

	return (
		<ProjectAccessGate>
			<PageLayout>
				<div>
					<ProjectHeader isOwner={isOwner} project={project} />
					<ProjectActions isOwner={isOwner} project={project} />

					<ProjectDetails project={project} />
					{isOwner && (
						<>
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

							<div>
								<ProjectFiles isProjectOwner={isOwner} />
								<NewClientForm />
								<ProjectClients />
							</div>
							<div className="my-8">
								<ProjectDangerZone />
							</div>
						</>
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
