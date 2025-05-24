import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import NewProjectForm from "./NewProjectForm";
import ProjectsTable from "./ProjectsTable";

const ProjectsPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<div>
					<ProjectsTable />
					<NewProjectForm />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default ProjectsPage;
