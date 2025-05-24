import type { ProjectWithUserInfo } from "../../../../types/projects";

const ProjectActions = ({
	isOwner,
	project,
}: { isOwner: boolean; project: ProjectWithUserInfo }) => {
	if (isOwner) {
		return (
			<div>
				<button>Edit Project</button>
				{project.status === "Complete" ? (
					<button>Mark as incomplete</button>
				) : project.status === "Archived" ? (
					<button>Unarchive Project</button>
				) : (
					<button>Mark as complete</button>
				)}
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
