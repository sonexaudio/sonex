import { formatDistanceToNow } from "date-fns";
import type { DetailedProject } from "../../../../types/projects";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { LockIcon } from "lucide-react";

const ProjectHeader = ({
	project,
	isOwner,
}: { project: DetailedProject | null; isOwner: boolean; }) => {
	return (
		<div className="flex justify-between items-center w-full">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{project?.title}</h1>
				<div className="flex gap-2 mt-2 items-center text-muted-foreground">
					<p>
						{project?.dueDate ? `Due in ${formatDistanceToNow(project?.dueDate)}` : "No due date"}
					</p>
					<span>•</span>
					<Badge>{project?.status}</Badge>
					<span>•</span>
					<Badge>{project?.paymentStatus}</Badge>
				</div>
				{!isOwner && <p className="text-muted-foreground mt-2">Created by {project?.user?.firstName} {project?.user?.lastName} <span><Button variant="link">Contact</Button></span></p>}
			</div>
			{isOwner ? <Button>Archive Project</Button> :
				<div className="flex items-center gap-2">
					<Button disabled={project?.paymentStatus === "Unpaid"}>
						<LockIcon className="size-4" />
						Download Files
					</Button>
					<Button disabled={project?.paymentStatus === "Paid"}>{project?.paymentStatus === "Unpaid" ? "Pay Project" : "Project Paid"}</Button>
				</div>
			}
		</div>
	);
};
export default ProjectHeader;
