import { useEffect } from "react";
import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import useProjects from "../../../hooks/useProjects";
import { useNavigate } from "react-router";

const ProjectsPage = () => {
	const { state, getAllProjects, loading } = useProjects();
	const navigate = useNavigate();

	const projects = state.allProjects;

	useEffect(() => {
		getAllProjects();
	}, []);

	if (loading) {
		return <p>Loading...</p>;
	}

	return (
		<AuthLayout>
			<PageLayout>
				<div>
					{projects.length === 0 ? (
						<p>No projects yet...</p>
					) : (
						<>
							<h1 className="text-xl mb-4">Projects</h1>
							{projects.map((project) => (
								<div
									key={project.id}
									onClick={() => navigate(`/projects/${project.id}`)}
									className="border rounded-lg p-4 shadow-md cursor-pointer"
								>
									<div>{project.title}</div>
									<div>${project.amount}</div>
								</div>
							))}
						</>
					)}
				</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default ProjectsPage;
