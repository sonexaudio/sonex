import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import ProjectsTable from "./ProjectsTable";

const ProjectsPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<div>
					<ProjectsTable />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default ProjectsPage;
