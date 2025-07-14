import { useState } from "react";
import { Plus, Users } from "lucide-react";
import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import { useClients } from "../../../hooks/useClients";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "../../../components/ui/dialog";
import NewClientForm from "./NewClientForm";
import ClientsTable from "./ClientsTable";

const ClientsPage = () => {
	const [showNewClientForm, setShowNewClientForm] = useState(false);
	const { clients, loading, error } = useClients();

	const handleCloseDialog = () => {
		setShowNewClientForm(false);
	};

	if (loading) return <p>Loading...</p>;

	return (
		<AuthLayout>
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
						<Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									New Client
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<NewClientForm onClose={handleCloseDialog} />
							</DialogContent>
						</Dialog>
					</div>

					{/* Error Display */}
					{error && (
						<div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
							{error}
						</div>
					)}

					{/* Clients Table */}
					<ClientsTable clients={clients} />
				</div>
			</PageLayout>
		</AuthLayout>
	);
};

export default ClientsPage;
