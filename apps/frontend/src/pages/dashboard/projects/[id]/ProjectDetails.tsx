import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { useProjectContext } from "../../../../hooks/projects/useProjectContext";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import ProjectActions from "./ProjectActions";
import ProjectDangerZone from "./ProjectDangerZone";
import UpdateProjectForm from "./UpdateProjectForm";

const ProjectDetails = () => {
	const { projectData: { project }, isOwner } = useProjectContext();


	return (
		<div className="grid md:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Project Details</CardTitle>
					<CardDescription>Basic information about this project</CardDescription>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-2 gap-4">
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Created
							</dt>
							<dd>{new Date(project?.createdAt as Date).toLocaleDateString()}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Last Modified
							</dt>
							<dd>{new Date(project?.updatedAt as Date).toLocaleDateString()}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Status
							</dt>
							<dd>{project?.status}</dd>
						</div>
						<div className="mt-4">
							<h3 className="text-sm font-medium text-muted-foreground mb-2">
								Description
							</h3>
							<p>{project?.description || "No description provided."}</p>
						</div>
					</dl>

					<div className="my-8 flex flex-col lg:flex-row gap-2">
						<ProjectActions isOwner={isOwner} project={project as ProjectWithUserInfo} />
						<ProjectDangerZone />
					</div>
				</CardContent>
			</Card>

			<UpdateProjectForm project={project as ProjectWithUserInfo} />
		</div>

	);
};
export default ProjectDetails;
