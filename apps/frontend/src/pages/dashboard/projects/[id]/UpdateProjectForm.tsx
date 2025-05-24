import { useForm } from "react-hook-form";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema } from "@sonex/schemas/project";
import useProjects from "../../../../hooks/useProjects";

const UpdateProjectForm = ({ project }: { project: ProjectWithUserInfo }) => {
	const { updateProject } = useProjects();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ProjectSchema),
		defaultValues: {
			title: project.title,
			description: project.description || "",
			amount: project.amount || 0,
			paymentStatus: project.paymentStatus as "Free" | "Unpaid" | "Paid",
			status: project.status as "Active" | "Complete" | "Archived" | "Private",
		},
	});
	return (
		<div>
			<h3 className="text-lg font-bold">Project Update</h3>
			<form
				onSubmit={handleSubmit((data) => updateProject(project.id, data))}
				className="flex flex-col gap-8"
			>
				<div>
					<input type="text" {...register("title")} />
					{errors.title && (
						<p className="text-sm text-red-600">{errors.title.message}</p>
					)}
				</div>
				<div>
					<textarea {...register("description")} />
					{errors.description && (
						<p className="text-sm text-red-600">{errors.description.message}</p>
					)}
				</div>
				<div>
					<input
						type="number"
						{...register("amount", { valueAsNumber: true })}
					/>
					{errors.amount && (
						<p className="text-sm text-red-600">{errors.amount.message}</p>
					)}
				</div>
				<select {...register("status")}>
					<option value="Active">Active</option>
					<option value="Complete">Complete</option>
					<option value="Archived">Archived</option>
					<option value="Private">Private</option>
				</select>
				<select
					{...register("paymentStatus")}
					defaultValue={project.paymentStatus}
				>
					<option value="Free"> Free</option>
					<option value="Unpaid">Unpaid</option>
					<option value="Paid">Paid</option>
				</select>
				<button type="submit">Update Project</button>
			</form>
		</div>
	);
};
export default UpdateProjectForm;
