import { formatDistanceToNow } from "date-fns";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import { Badge } from "../../../../components/ui/badge";

const ProjectHeader = ({
	project,
	isOwner,
}: { project: ProjectWithUserInfo; isOwner: boolean; }) => {
	return (
		<div>
			<h1 className="text-3xl font-bold tracking-tight">{project?.title}</h1>
			<div className="flex gap-2 mt-2 items-center text-muted-foreground">
				<p>
					{project?.dueDate ? `Due in ${formatDistanceToNow(project?.dueDate)}` : "No due date"}
				</p>
				<span>•</span>
				<Badge>{project.status}</Badge>
				<span>•</span>
				<Badge>{project.paymentStatus}</Badge>
			</div>
			{!isOwner && <p className="text-muted-foreground">Created by {project?.user?.firstName}</p>}
		</div>
	);
};
export default ProjectHeader;
