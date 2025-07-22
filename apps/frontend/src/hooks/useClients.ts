import { useState } from "react";
import api from "../lib/axios";
import type { AxiosError } from "axios";

export interface Client {
	id: string;
	name: string;
	email: string;
	projectId: string;
	userId: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface AxiosResponseError extends AxiosError {
	error?: string;
}

export function useClients() {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchClients = async () => {
		setLoading(true);
		try {
			const { data: { data } } = await api.get("/clients");
			if (data?.clients) {
				setClients(data.clients);
			}
			setError(null);
		} catch (error) {
			console.error(error);
			setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to fetch clients");
		} finally {
			setLoading(false);
		}
	};

	const addClient = async (clientData: Partial<Client>) => {
		setLoading(true);
		try {
			const { data: { data } } = await api.post("/clients", clientData);
			if (data?.client) {
				setClients(prev => [...prev, data.client]);
			}
			setError(null);
		} catch (error) {
			console.error(error);
			setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to add client");
		} finally {
			setLoading(false);
		}
	};

	const updateClient = async (id: string, clientData: Partial<Client>) => {
		if (Object.entries(clientData).length === 0) return;
		setLoading(true);
		try {
			const { data: { data } } = await api.put(`/clients/${id}`, clientData);
			if (data?.client) {
				setClients(prev => prev.map(client => client.id === id ? { ...client, ...data.client } : client));
			}
			setError(null);
		} catch (error) {
			console.error(error);
			setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to update client");
		} finally {
			setLoading(false);
		}
	};

	const removeClient = async (id: string) => {
		setLoading(true);
		try {
			await api.delete(`/clients/${id}`);
			setClients(prev => prev.filter(client => client.id !== id));
			setError(null);
		} catch (error) {
			console.error(error);
			setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to remove client");
		} finally {
			setLoading(false);
		}
	};

	const removeAllClients = async (clientsToRemove: Client[]) => {
		setLoading(true);
		try {
			const clientIds = clientsToRemove.map(client => client.id);
			await api.post("/clients/delete-all", { clients: clientIds });
			setClients(prev => prev.filter(client => !clientIds.includes(client.id)));
			setError(null);
		} catch (error) {
			console.error(error);
			setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to remove all clients");
		} finally {
			setLoading(false);
		}
	};

	return {
		clients,
		fetchClients,
		addClient,
		updateClient,
		removeClient,
		removeAllClients,
		loading,
		error,
	};
}
