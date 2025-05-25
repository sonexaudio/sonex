import { useForm } from "react-hook-form";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema } from "@sonex/schemas/project";
import useProjects from "../../../../hooks/useProjects";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";

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
				className="flex flex-col gap-8 max-w-md"
			>
				<div>
					<Input type="text" {...register("title")} />
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
					<Input
						type="number"
						{...register("amount", { valueAsNumber: true })}
					/>
					{errors.amount && (
						<p className="text-sm text-red-600">{errors.amount.message}</p>
					)}
				</div>
				<Select {...register("status")}>
					<Select.Option value="Active">Active</Select.Option>
					<Select.Option value="Complete">Complete</Select.Option>
					<Select.Option value="Private">Private</Select.Option>
					<Select.Option value="Archived">Archived</Select.Option>
				</Select>
				{/* <select {...register("status")}>
					<option value="Active">Active</option>
					<option value="Complete">Complete</option>
					<option value="Archived">Archived</option>
					<option value="Private">Private</option>
				</select> */}
				<Select
					{...register("paymentStatus")}
				>
					<Select.Option value="Free"> Free</Select.Option>
					<Select.Option value="Unpaid">Unpaid</Select.Option>
					<Select.Option value="Paid">Paid</Select.Option>
				</Select>
				<Button type="submit">Update Project</Button>
			</form>
		</div>
	);
};
export default UpdateProjectForm;
