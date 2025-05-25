import { useParams } from "react-router";
import useProjects from "../../../../hooks/useProjects";
import Button from "../../../../components/ui/Button";

const ProjectDangerZone = () => {
	const { id } = useParams();
	const { deleteProject } = useProjects();
	return (
		<div className="my-8">
			<Button variant="danger" type="button" onClick={() => deleteProject(id as string)}>
				Delete Project
			</Button>
		</div>
	);
};
export default ProjectDangerZone;
