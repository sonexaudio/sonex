import { useEffect } from "react";
import AuthLayout from "../../../../components/AuthLayout";
import PageLayout from "../../../../components/PageLayout";
import useProjects from "../../../../hooks/useProjects";
import { useParams } from "react-router";

const CurrentProjectPage = () => {
	const { getSingleProject, loading, state } = useProjects();
	const { id } = useParams();

	useEffect(() => {
		getSingleProject(id);
	}, []);

	const project = state.currentProject;

	if (loading) return <p>Loading...</p>;

	return (
		<AuthLayout>
			<PageLayout>
				<div>{project.title}</div>
			</PageLayout>
		</AuthLayout>
	);
};
export default CurrentProjectPage;
