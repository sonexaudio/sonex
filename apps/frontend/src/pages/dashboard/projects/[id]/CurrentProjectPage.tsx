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
import type { Client } from "../../../../hooks/useClients";
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
import { ClientPaymentProvider, useClientPayment } from "../../../../context/ClientPaymentProvider";
import { Button } from "../../../../components/ui/button";


const PayForProjectButton = ({ disabled }: { disabled?: boolean; }) => {
	const { openPaymentDialog, paymentStatus } = useClientPayment();
	return (
		<Button

			onClick={openPaymentDialog}
			disabled={disabled || paymentStatus === "processing"}
		>
			{paymentStatus === "processing" ? "Processing..." : "Pay for Project"}
		</Button>
	);
};

const CurrentProjectPage = () => {
	const { project, loading, isOwner, authorizedClient } = useProjectContext();

	console.log("AUTHORIZED CLIENT", authorizedClient);

	const { id } = useParams();

	if (loading) return <p>Loading...</p>;

	const isValidProject = (p: any): p is ProjectWithUserInfo => !!p && typeof p === 'object' && 'id' in p && 'userId' in p && 'amount' in p;
	const isValidClient = (c: any): c is Client => !!c && typeof c === 'object' && 'id' in c && 'email' in c;

	const shouldShowPayment =
		isValidProject(project) &&
		isValidClient(authorizedClient) &&
		(project as ProjectWithUserInfo).paymentStatus !== "Paid" &&
		!!(project as ProjectWithUserInfo).amount &&
		!!(project as ProjectWithUserInfo).userId;

	return (
		<ProjectAccessGate>
			<PageLayout>
				<div className="flex flex-col gap-6 p-6">
					<div className="flex items-center justify-between">
						{isValidProject(project) && (
							<ProjectHeader project={project} isOwner={isOwner} />
						)}
					</div>
					{isOwner && (
						<ProjectViewTabs />
					)}
					{shouldShowPayment && isValidProject(project) && isValidClient(authorizedClient) ? (
						<ClientPaymentProvider
							project={{
								id: (project as ProjectWithUserInfo).id,
								userId: (project as ProjectWithUserInfo).userId,
								amount: (project as ProjectWithUserInfo).amount!,
								paymentStatus: (project as ProjectWithUserInfo).paymentStatus,
							}}
							client={{
								id: (authorizedClient as Client).id,
								email: (authorizedClient as Client).email,
							}}
						>
							<div className="mb-4">
								<PayForProjectButton />
							</div>
							<FileUploadProvider
								projectId={id as string}
								uploaderId={(authorizedClient as Client).id}
								uploaderType="CLIENT"
							>
								<section className="border rounded-md size-full p-8 space-y-8">
									<FileDropzone />
									<FileUploadViewer />
								</section>
							</FileUploadProvider>
							<ProjectFileSystem />
						</ClientPaymentProvider>
					) : (
						isValidClient(authorizedClient) && (
							<>
								<FileUploadProvider
									projectId={id as string}
									uploaderId={(authorizedClient as Client).id}
									uploaderType="CLIENT"
								>
									<section className="border rounded-md size-full p-8 space-y-8">
										<FileDropzone />
										<FileUploadViewer />
									</section>
								</FileUploadProvider>
								<ProjectFileSystem />
							</>
						)
					)}
				</div>
			</PageLayout>
		</ProjectAccessGate>
	);
};
export default CurrentProjectPage;
