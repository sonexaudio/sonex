import { XIcon } from "lucide-react";
import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import { useClients } from "../../../hooks/useClients";

const ClientsPage = () => {
    const { clients, loading, removeClient, removeAllClients, error } = useClients();

    if (loading) return <p>Loading...</p>;

    const handleRemoveAllClients = async () => {
        if (clients.length === 0) return;
        await removeAllClients(clients);
    };

    return (
        <AuthLayout>
            <PageLayout>
                <div className="flex gap-4 items-center">
                    <button onClick={handleRemoveAllClients}>Remove all clients</button>
                </div>
                {error && <p className="">{error}</p>}
                <div>
                    {clients.map((client) => (
                        <div key={client.id}>
                            <h3>{client.name} - {client.name}</h3>
                            <p>{new Date(client.createdAt).toLocaleDateString()}</p>
                            <span onClick={() => removeClient(client.id)}><XIcon /></span>
                        </div>
                    ))}
                </div>
            </PageLayout>
        </AuthLayout>
    );
};

export default ClientsPage;