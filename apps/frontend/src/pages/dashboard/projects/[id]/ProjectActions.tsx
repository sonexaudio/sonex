import type { ProjectWithUserInfo } from "../../../../types/projects";
import { Button } from "../../../../components/ui/button";

const ProjectActions = ({
	isOwner,
	project,
}: { isOwner: boolean; project: ProjectWithUserInfo; }) => {
	if (isOwner) {
		return (
			<div>
				<div className="flex lg:flex-row flex-col gap-2 justify-self-end mb-2">
					<Button variant="outline" type="button">Edit Project</Button>

					{project.status === "Complete" ? (
						<Button type="button">Mark as incomplete</Button>
					) : project.status === "Archived" ? (
						<Button type="button">Unarchive Project</Button>
					) : (
						<Button type="button">Mark as complete</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<Button type="button">Contact {project.user?.email}</Button>
		</div>
	);
};
export default ProjectActions;
