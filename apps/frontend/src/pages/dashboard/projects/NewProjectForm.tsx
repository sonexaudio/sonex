import { useForm } from "react-hook-form";
import useProjects from "../../../hooks/useProjects";
import { ProjectSchema } from "@sonex/schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { Project } from "../../../types/projects";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { DialogHeader, DialogTitle, DialogContent, DialogFooter } from "../../../components/ui/dialog";

interface NewProjectFormProps {
	onClose?: () => void;
}

const NewProjectForm = ({ onClose }: NewProjectFormProps) => {
	const { createProject } = useProjects();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ProjectSchema),
		defaultValues: {
			title: "",
			description: "",
			amount: 0,
		},
	});

	const handleSubmitProject = async (data: Partial<Project>) => {
		setSubmitError(null);
		setIsSubmitting(true);

		try {
			await createProject(data);
			reset();
			onClose?.();
		} catch (error) {
			setSubmitError(error as string);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		reset();
		onClose?.();
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Create New Project</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<form onSubmit={handleSubmit((data) => handleSubmitProject(data))} className="space-y-6">
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Add a new music project to collaborate on with clients.
						</p>

						{submitError && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
								{submitError}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="title">Project Title</Label>
							<Input
								id="title"
								type="text"
								{...register("title")}
								placeholder="Enter project title"
								className={errors.title ? "border-red-500" : ""}
							/>
							{errors.title && (
								<p className="text-sm text-red-600">{errors.title.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								{...register("description")}
								placeholder="Enter a description (optional)"
								className={errors.description ? "border-red-500" : ""}
							/>
							{errors.description && (
								<p className="text-sm text-red-600">{errors.description.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								type="number"
								{...register("amount", { valueAsNumber: true })}
								placeholder="Enter amount"
								className={errors.amount ? "border-red-500" : ""}
							/>
							{errors.amount && (
								<p className="text-sm text-red-600">{errors.amount.message}</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</>
	);
};

export default NewProjectForm;
