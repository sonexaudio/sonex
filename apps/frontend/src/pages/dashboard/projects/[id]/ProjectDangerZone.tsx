import { useParams } from "react-router";
import useProjects from "../../../../hooks/useProjects";

const ProjectDangerZone = () => {
	const { id } = useParams();
	const { deleteProject } = useProjects();
	return (
		<div className="my-8">
			<button type="button" onClick={() => deleteProject(id as string)}>
				Delete Project
			</button>
		</div>
	);
};
export default ProjectDangerZone;
