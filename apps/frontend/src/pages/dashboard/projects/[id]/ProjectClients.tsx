import { useParams } from "react-router";
import { useClients } from "../../../../hooks/useClients";
import ClientCard from "../../clients/ClientCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";

const ProjectClients = () => {
	const { clients, loading } = useClients();
	const { id } = useParams();
	const projectClients = clients.filter((client) => client.projectId === id);

	if (loading) return <p>Loading clients...</p>;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-semibold text-lg">Clients</CardTitle>
				<CardDescription>Clients with access to this project</CardDescription>
			</CardHeader>
			<CardContent>
				{projectClients.map((client) => (
					<ClientCard key={client.id} client={client} />
				))}
			</CardContent>
		</Card>
	);
};

export default ProjectClients;
