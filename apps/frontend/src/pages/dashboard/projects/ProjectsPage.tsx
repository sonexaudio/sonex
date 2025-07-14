import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import NewProjectForm from "./NewProjectForm";
import ProjectsTable from "./ProjectsTable";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "../../../components/ui/dialog";

const ProjectsPage = () => {
	const [showNewProjectForm, setShowNewProjectForm] = useState(false);

	const handleCloseDialog = () => {
		setShowNewProjectForm(false);
	};

	return (
		<AuthLayout>
			<PageLayout>
				<div className="space-y-6 mt-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Projects</h1>
							<p className="text-muted-foreground">
								Manage your projects, track progress, and collaborate with clients.
							</p>
						</div>
						<Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									New Project
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<NewProjectForm onClose={handleCloseDialog} />
							</DialogContent>
						</Dialog>
					</div>

					{/* Projects Table */}
					<ProjectsTable />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};

export default ProjectsPage;
