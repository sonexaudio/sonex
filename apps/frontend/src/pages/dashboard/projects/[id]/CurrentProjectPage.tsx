import PageLayout from "../../../../components/PageLayout";
import { useParams } from "react-router";
import ProjectHeader from "./ProjectHeader";
import FileDropzone from "../../../../components/files/FileDropzone";
import { FileUploadProvider } from "../../../../context/FileUploadProvider";
import FileUploadViewer from "../../../../components/files/FileUploadViewer";
import ProjectFileSystem from "./ProjectFileSystem";
import ProjectViewTabs from "./ProjectTabs/ProjectView";
import { ClientPaymentProvider, useClientPayment } from "../../../../context/ClientPaymentProvider";
import { Button } from "../../../../components/ui/button";
import { useProjectContext } from "../../../../hooks/projects/useProjectContext";
import ProjectAccessGate from "../../../../components/auth/ProjectAccessLevel";


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
	const { id } = useParams();
	const { projectData: { isLoading, project }, isOwner, isClient, currentClient, currentUser } = useProjectContext();

	const shouldShowPayment =
		project &&
		isClient &&
		!isOwner &&
		project?.paymentStatus !== "Paid" &&
		project?.amount &&
		project?.userId;

	if (isLoading) return <p>Loading...</p>;

	return (
		<ProjectAccessGate>
			<PageLayout>
				<FileUploadProvider
					projectId={id as string}
					uploaderId={isOwner ? currentUser?.id as string : currentClient?.id as string}
					uploaderType={isOwner ? "USER" : "CLIENT"}
				>
					<div className="flex flex-col gap-6 p-6">
						<div className="flex items-center justify-between">

							<ProjectHeader project={project} isOwner={isOwner} />
						</div>
						{isOwner && (
							<ProjectViewTabs />
						)}
						{shouldShowPayment ? (
							<ClientPaymentProvider
								project={{
									id: project?.id,
									userId: project?.userId,
									amount: project?.amount!,
									paymentStatus: project?.paymentStatus,
								}}
								client={{
									id: currentClient?.id as string,
									email: currentClient?.email as string,
								}}
							>
								<div className="mb-4">
									<PayForProjectButton />
								</div>

								<section className="border rounded-md size-full p-8 space-y-8">
									<FileDropzone />
									<FileUploadViewer />
								</section>

								<ProjectFileSystem />
							</ClientPaymentProvider>
						) : (
							!!currentClient && (
								<>
										<section className="border rounded-md size-full p-8 space-y-8">
											<FileDropzone />
											<FileUploadViewer />
										</section>

									<ProjectFileSystem />
								</>
							)
						)}
					</div>
				</FileUploadProvider>
			</PageLayout>
		</ProjectAccessGate>
	);
};
export default CurrentProjectPage;
