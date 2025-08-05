import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import NewProjectForm from "../../../components/forms/NewProjectForm";
import ProjectsTable from "./ProjectsTable";


const ProjectsPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<div className="space-y-6 mt-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Projects</h1>
							<p className="text-muted-foreground">
								Manage your projects, track progress, and collaborate with clients.
							</p>
						</div>
						<NewProjectForm />
					</div>

					{/* Projects Table */}
					<ProjectsTable />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};

export default ProjectsPage;
