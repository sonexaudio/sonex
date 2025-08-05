import api from "../../lib/axios";
import type { Client } from "../useClients";


export async function fetchClients() {
    const { data } = await api.get("/clients");
    return data.data; // returns {clients}
}

export async function createClient(clientData: Partial<Client>) {
    const { data } = await api.post("/clients", clientData);
    return data.data.client; // returns the newly created client
}

export async function addClientToProject(
    projectId: string,
    clientData: Partial<Client>
) {
    const { data } = await api.post(`/projects/${projectId}/clients`, clientData);
    return data.data.client; // returns the newly added client to the project
}

export async function updateClient(id: string) {
    const { data } = await api.put(`/clients/${id}`);
    return data.data.client;
}


export async function deleteClient(id: string) {
    await api.delete(`/clients/${id}`);
    return id;
}

export async function deleteAllClients(clients: Client[]) {
    const clientIds = clients.map(client => client.id);
    await api.post("/clients/delete-all", { clients: clientIds });
}