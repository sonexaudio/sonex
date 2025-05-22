import type { ProjectWithUserInfo } from "../../../../hooks/useProjects";

const ProjectDetails = ({ project }: { project: ProjectWithUserInfo }) => {
	return (
		<div className="my-6">
			<div>
				<h3>Project Details</h3>
				<p>Basic information about this project</p>
			</div>

			<div>
				<dl className="grid grid-cols-2 gap-4">
					<div>
						<dt className="text-sm font-medium text-muted-foreground">
							Created
						</dt>
						<dd>{new Date(project.createdAt as Date).toLocaleDateString()}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-muted-foreground">
							Last Modified
						</dt>
						<dd>{new Date(project.updatedAt as Date).toLocaleDateString()}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-muted-foreground">
							Status
						</dt>
						<dd>{project.status}</dd>
					</div>
					<div className="mt-4">
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Description
						</h3>
						<p>{project.description || "No description provided."}</p>
					</div>
				</dl>
			</div>
		</div>
	);
};
export default ProjectDetails;
