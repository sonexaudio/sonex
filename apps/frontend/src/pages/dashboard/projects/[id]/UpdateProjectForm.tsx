import { useForm } from "react-hook-form";
import type { ProjectWithUserInfo } from "../../../../types/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema } from "@sonex/schemas/project";
import useProjects from "../../../../hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";

const UpdateProjectForm = ({ project }: { project: ProjectWithUserInfo; }) => {
	const { updateProject } = useProjects();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ProjectSchema),
		defaultValues: {
			title: project?.title,
			description: project?.description || "",
			amount: project?.amount || 0,
			paymentStatus: project?.paymentStatus as "Free" | "Unpaid" | "Paid",
			status: project?.status as "Active" | "Complete" | "Archived" | "Private",
		},
	});
	return (
		<Card>
			<CardHeader>
				<CardTitle>Update Project Information</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit((data) => updateProject(project.id, data))}
					className="flex flex-col gap-8"
				>
					<div>
						<Input type="text" {...register("title")} />
						{errors.title && (
							<p className="text-sm text-red-600">{errors.title.message}</p>
						)}
					</div>
					<div>
						<Textarea {...register("description")} />
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
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Project Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Active">Active</SelectItem>
							<SelectItem value="Complete">Complete</SelectItem>
							<SelectItem value="Archived">Archived</SelectItem>
							<SelectItem value="Private">Private</SelectItem>
						</SelectContent>
					</Select>
					<Select
						{...register("paymentStatus")}
						defaultValue={project?.paymentStatus}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Payment Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Free"> Free</SelectItem>
							<SelectItem value="Unpaid">Unpaid</SelectItem>
							<SelectItem value="Paid">Paid</SelectItem>
						</SelectContent>
					</Select>
					<Button type="submit">Update Project</Button>
				</form>
			</CardContent>
		</Card>
	);
};
export default UpdateProjectForm;
