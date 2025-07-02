import { useNavigate, useParams } from "react-router";
import useProjects from "../../../../hooks/useProjects";
import { Button } from "../../../../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../../components/ui/alert-dialog";

const ProjectDangerZone = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { deleteProject } = useProjects();

	const handleDeleteProject = async () => {
		await deleteProject(id as string);
		return navigate("projects");
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" type="button">
					Delete Project
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your project and remove all files and data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={handleDeleteProject}>Yes, delete</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
export default ProjectDangerZone;