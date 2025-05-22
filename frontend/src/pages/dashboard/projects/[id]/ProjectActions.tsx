import type { ProjectWithUserInfo } from "../../../../hooks/useProjects";

const ProjectActions = ({
	isOwner,
	project,
}: { isOwner: boolean; project: ProjectWithUserInfo }) => {
	if (isOwner) {
		return (
			<div>
				<button>Edit Project</button>
				<button>Mark as complete</button>
			</div>
		);
	}

	return (
		<div>
			<button>Contact {project.user.firstName}</button>
		</div>
	);
};
export default ProjectActions;
