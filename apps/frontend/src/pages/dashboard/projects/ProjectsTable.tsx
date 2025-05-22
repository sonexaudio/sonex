import { useNavigate } from "react-router";
import { useEffect } from "react";
import useProjects from "../../../hooks/useProjects";

const ProjectsTable = () => {
	const { state, getAllProjects, loading } = useProjects();

	const navigate = useNavigate();

	const projects = state.allProjects;

	useEffect(() => {
		getAllProjects();
	}, []);

	if (loading) {
		return <p>Loading...</p>;
	}

	if (projects.length === 0) {
		return <p>No projects yet...</p>;
	}
	return (
		<>
			<h1 className="text-xl mb-4">Projects</h1>
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Status</th>
						<th>Amount</th>
						<th>Payment Status</th>
						<th>Due</th>
						<th>Created</th>
						<th>Last modified</th>
					</tr>
				</thead>
				<tbody>
					{projects.map((project) => (
						<tr key={project.id}>
							<th onClick={() => navigate(`/projects/${project.id}`)}>
								{project.title}
							</th>
							<td>{project.status}</td>
							<td>{project.amount}</td>
							<td>{project.paymentStatus}</td>
							<td>
								{project.dueDate
									? new Date(project.dueDate).toLocaleDateString()
									: "No due date"}
							</td>
							<td>
								{new Date(project.createdAt as Date).toLocaleDateString()}
							</td>
							<td>
								{new Date(project.updatedAt as Date).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
};
export default ProjectsTable;
