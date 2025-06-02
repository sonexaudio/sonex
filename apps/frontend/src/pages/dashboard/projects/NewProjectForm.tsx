import { useForm } from "react-hook-form";
import useProjects from "../../../hooks/useProjects";
import { ProjectSchema } from "@sonex/schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { Project } from "../../../types/projects";

// Here for safe keeping
const NewProjectForm = () => {
	const { createProject } = useProjects();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ProjectSchema),
		defaultValues: {
			amount: 0,
		},
	});

	const handleSubmitProject = async (data: Partial<Project>) => {
		setSubmitError(null);

		try {
			await createProject(data);
		} catch (error) {
			setSubmitError(error as string);
		}
	};

	return (
		<form
			onSubmit={handleSubmit((data) => handleSubmitProject(data))}
			className="flex flex-col gap-8 my-8"
		>
			<h3 className="font-bold text-lg">Create New Project</h3>
			<p>Add a new music project to collaborate on with clients.</p>

			{submitError && (
				<div className="bg-red-100 text-red-700 border border-red-300">
					{submitError}
				</div>
			)}

			<div>
				<input
					type="text"
					{...register("title")}
					placeholder="Enter new project title"
				/>
				{errors.title && (
					<p className="text-sm text-red-600">{errors.title.message}</p>
				)}
			</div>

			<div>
				<textarea
					{...register("description")}
					placeholder="Enter a description (optional)"
				/>
				{errors.description && (
					<p className="text-sm text-red-600">{errors.description.message}</p>
				)}
			</div>

			<div>
				<input
					type="number"
					{...register("amount", { valueAsNumber: true })}
					placeholder="Enter amount"
				/>
				{errors.amount && (
					<p className="text-sm text-red-600">{errors.amount.message}</p>
				)}
			</div>

			<button type="submit">Submit Project</button>
		</form>
	);
};
export default NewProjectForm;
