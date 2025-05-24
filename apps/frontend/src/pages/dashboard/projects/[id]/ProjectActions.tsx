import { useState } from "react";
import type { ProjectWithUserInfo } from "../../../../types/projects";

const ProjectActions = ({
	isOwner,
	project,
}: { isOwner: boolean; project: ProjectWithUserInfo }) => {
	if (isOwner) {
		const [copiedProjectLink, setCopiedProjectLink] = useState(false);

		const projectLink = `${import.meta.env.VITE_FRONTEND_URL}/projects/${project.id}?client_view=true`;

		const handleProjectLink = () => {
			setCopiedProjectLink(true);
			navigator.clipboard.writeText(projectLink);
			setTimeout(() => {
				setCopiedProjectLink(false);
			}, 3000);
		};

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

				{/* Share link */}
				<div className="flex">
					<input type="text" readOnly defaultValue={projectLink} />
					<button type="button" onClick={handleProjectLink}>
						{copiedProjectLink ? "Copied!" : "Copy Project Link"}
					</button>
				</div>
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
