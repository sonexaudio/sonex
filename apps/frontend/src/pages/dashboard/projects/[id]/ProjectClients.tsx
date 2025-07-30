import { useParams } from "react-router";
import ClientCard from "../../clients/ClientCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Eye, MessageCircle } from "lucide-react";
import { useProjectContext } from "../../../../hooks/projects/useProjectContext";


const ProjectClients = () => {
	const { projectData: { clients: projectClients, isLoading } } = useProjectContext();
	const { id } = useParams();


	if (isLoading) return <p>Loading clients...</p>;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-semibold text-lg">Clients</CardTitle>
				<CardDescription>Clients with access to this project</CardDescription>
			</CardHeader>
			<CardContent>
				{projectClients?.map((client) => (
					<ClientCard key={client.id} client={client} />
				))}

				{/* Permissions Legend */}
				<div className="rounded-xl p-4">
					<h4 className="text-sm font-medium text-gray-900 mb-3">Permission Types</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-blue-500 rounded-full" />
							<Eye className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">Can view project files and progress</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-500 rounded-full" />
							<MessageCircle className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">Can leave comments and feedback</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProjectClients;
