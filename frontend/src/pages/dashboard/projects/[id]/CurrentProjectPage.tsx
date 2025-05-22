import { useEffect } from "react";
import AuthLayout from "../../../../components/AuthLayout";
import PageLayout from "../../../../components/PageLayout";
import useProjects, {
	type ProjectWithUserInfo,
} from "../../../../hooks/useProjects";
import { useParams } from "react-router";
import useUser from "../../../../hooks/useUser";
import ProjectDetails from "./ProjectDetails";
import ProjectActions from "./ProjectActions";
import ProjectHeader from "./ProjectHeader";
import UpdateProjectForm from "./UpdateProjectForm";
import ProjectDangerZone from "./ProjectDangerZone";

const CurrentProjectPage = () => {
	const { currentUser } = useUser();
	const { getSingleProject, loading, state } = useProjects();
	const { id } = useParams();

	useEffect(() => {
		getSingleProject(id as string);
	}, [id]);

	const project = state.currentProject;
	const isOwner = !!currentUser && currentUser.id === project?.userId;

	if (loading) return <p>Loading...</p>;

	return (
		<AuthLayout>
			<PageLayout>
				<div>
					<ProjectHeader isOwner={isOwner} project={project} />
					<ProjectActions isOwner={isOwner} project={project} />
					<ProjectDetails project={project} />
					<UpdateProjectForm project={project} />
					<ProjectDangerZone />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default CurrentProjectPage;
