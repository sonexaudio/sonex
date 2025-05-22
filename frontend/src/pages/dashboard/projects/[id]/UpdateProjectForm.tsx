import type { ProjectWithUserInfo } from "../../../../hooks/useProjects";

const UpdateProjectForm = ({ project }: { project: ProjectWithUserInfo }) => {
	return (
		<div>
			<h1>Project Update</h1>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="flex flex-col gap-8 max-w-md"
			>
				<input type="text" value={project.title} />
				<textarea
					name="description"
					id=""
					value={project.description || ""}
				></textarea>
				<input type="number" value={project.amount || 0} />
				<input type="date" value={project.dueDate || ""} />
				<select name="status" id="" defaultValue={project.status}>
					<option value="Active">Active</option>
					<option value="Complete">Complete</option>
					<option value="Archived">Archived</option>
					<option value="Private">Private</option>
				</select>
				<select name="paymentStatus" id="" defaultValue={project.paymentStatus}>
					<option value="Free"> Free</option>
					<option value="Unpaid">Unpaid</option>
					<option value="Paid">Paid</option>
				</select>
				<button>Update Project</button>
			</form>
		</div>
	);
};
export default UpdateProjectForm;
