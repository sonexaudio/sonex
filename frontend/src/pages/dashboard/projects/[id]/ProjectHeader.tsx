import type { ProjectWithUserInfo } from "../../../../hooks/useProjects";

const ProjectHeader = ({
	project,
	isOwner,
}: { project: ProjectWithUserInfo; isOwner: boolean }) => {
	return (
		<div>
			<h1>{project.title}</h1>
			<p>{project.dueDate ? `Due ${project.dueDate}` : "No due date"}</p>
			{!isOwner && <p>Created by {project.user.firstName}</p>}
		</div>
	);
};
export default ProjectHeader;
