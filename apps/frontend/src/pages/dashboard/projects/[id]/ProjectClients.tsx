import { useParams } from "react-router";
import { useClients } from "../../../../hooks/useClients";
import ClientCard from "../../clients/ClientCard";

const ProjectClients = () => {
	const { clients, loading } = useClients();
	const { id } = useParams();
	const projectClients = clients.filter((client) => client.projectId === id);

	if (loading) return <p>Loading clients...</p>;

	return (
		<>
			<h3 className="font-semibold text-lg my-4">Clients</h3>
			{projectClients.map((client) => (
				<ClientCard key={client.id} client={client} />
			))}
		</>
	);
};

export default ProjectClients;
