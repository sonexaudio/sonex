
import PageLayout from "../../../components/PageLayout";
import { useClients } from "../../../hooks/useClients";
import NewClientForm from "../../../components/forms/NewClientForm";
import ClientsTable from "./ClientsTable";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

const ClientsPage = () => {
	useDocumentTitle("My Sonex | Clients");

	const { clients, clientsLoading } = useClients();

	if (clientsLoading) return <p>Loading...</p>;

	return (

		<PageLayout>
			<div className="space-y-6 mt-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Clients</h1>
						<p className="text-muted-foreground">
							Manage your clients, track relationships, and collaborate on projects.
						</p>
					</div>
					<NewClientForm />
				</div>
				<ClientsTable clients={clients} />
			</div>
		</PageLayout>
	);
};

export default ClientsPage;
