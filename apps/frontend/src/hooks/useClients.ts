import { useState } from "react";
import useUser from "./useUser";
import api from "../lib/axios";
import type { AxiosError } from "axios";
import { useProjectContext } from "../context/ProjectProvider";

export interface Client {
	id: string;
	name: string;
	email: string;
	projectId: string;
	addedBy: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface AxiosResponseError extends AxiosError {
	error?: string;
}

export function useClients() {
	const { currentUser } = useUser();
	const {
		clients,
		clientsLoading,
		refreshClients,
		addClientToState,
		updateClientInState,
		deleteClientFromState
	} = useProjectContext();
	const [error, setError] = useState<string | null>(null);

	async function addClient(clientData: Partial<Client>) {
		try {
			const {
				data: { data },
			} = await api.post("/clients", clientData);
			if (data) {
				addClientToState(data.client);
			}
		} catch (error) {
			console.error(error);
			setError(
				(error as AxiosError<AxiosResponseError>).response?.data
					?.error as string,
			);
		}
	}

	async function updateClient(id: string, clientData: Partial<Client>) {
		if (Object.entries(clientData).length === 0) return;

		try {
			const {
				data: { data },
			} = await api.put(`/clients/${id}`, clientData);

			if (data) {
				updateClientInState(id, data.client);
			}
		} catch (error) {
			console.error(error);
			setError(
				(error as AxiosError<AxiosResponseError>).response?.data
					?.error as string,
			);
		}
	}

	async function removeClient(id: string) {
		try {
			await api.delete(`/clients/${id}`);
			deleteClientFromState(id);
		} catch (error) {
			console.error(error);
			setError(
				(error as AxiosError<AxiosResponseError>).response?.data
					?.error as string,
			);
		}
	}

	async function removeAllClients(clients: Client[]) {
		try {
			const clientIds = clients.map((client) => client.id);
			await api.post("/clients/delete-all", { clients: clientIds });
			// Clear all clients from state
			clients.forEach(client => deleteClientFromState(client.id));
		} catch (error) {
			console.error(error);
			setError(
				(error as AxiosError<AxiosResponseError>).response?.data
					?.error as string,
			);
		}
	}

	return {
		clients,
		addClient,
		refetchClients: refreshClients,
		updateClient,
		removeClient,
		removeAllClients,
		loading: clientsLoading,
		error,
	};
}
