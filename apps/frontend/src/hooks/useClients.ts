import { useState } from "react";
import api from "../lib/axios";
import type { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addClientToProject, createClient, deleteClient, fetchClients, removeClientFromProject as removeClientFromProjectApi } from "./query-functions/clients";

export interface Client {
	isBlocked: boolean;
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
	const queryClient = useQueryClient();

	const clientsQuery = useQuery({
		queryKey: ["clients"],
		queryFn: fetchClients,
	});

	const create = useMutation({
		mutationFn: createClient,
		onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); }
	});

	const addToProject = useMutation<{
		projectId: string;
		clientData: Partial<Client>;
	}, unknown, { projectId: string; clientData: Partial<Client>; }>({
		mutationFn: ({ projectId, clientData }) => addClientToProject(projectId, clientData),
		onSuccess: (_data, variables) => {
			// should invalidate the current project, so that everything is refreshed
			queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		}
	});

	const removeFromProject = useMutation({
		mutationFn: (clientId: string) => removeClientFromProjectApi(clientId),
		onSuccess: (_data, clientId) => {
			// Invalidate both the clients and project queries
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			// If you have projectId available, also:
			// queryClient.invalidateQueries({ queryKey: ["project", projectId] });
		}
	});

	const deleteById = useMutation<string, unknown, { id: string; }>({
		mutationFn: ({ id }) => deleteClient(id),
		onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); }
	});

	// 	try {
	// 		const { data: { data } } = await api.post(`/projects/${projectId}/clients`, clientData);

	// 		return data?.client || null;
	// 	} catch (error) {
	// 		console.error(error);
	// 		throw error;
	// 	}
	// };

	// const updateClient = async (id: string, clientData: Partial<Client>) => {
	// 	if (Object.entries(clientData).length === 0) return;
	// 	setLoading(true);
	// 	try {
	// 		const { data: { data } } = await api.put(`/clients/${id}`, clientData);
	// 		if (data?.client) {
	// 			setClients(prev => prev.map(client => client.id === id ? { ...client, ...data.client } : client));
	// 		}
	// 		setError(null);
	// 	} catch (error) {
	// 		console.error(error);
	// 		setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to update client");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const removeClient = async (id: string) => {
	// 	setLoading(true);
	// 	try {
	// 		await api.delete(`/clients/${id}`);
	// 		setClients(prev => prev.filter(client => client.id !== id));
	// 		setError(null);
	// 	} catch (error) {
	// 		console.error(error);
	// 		setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to remove client");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const removeClientFromProject = async (projectId: string, clientId: string) => {
	// 	setLoading(true);
	// 	try {
	// 		await api.delete(`/projects/${projectId}/clients/${clientId}`);
	// 		setClients(prev => prev.filter(client => client.id !== clientId));
	// 		setError(null);
	// 	} catch (error) {
	// 		console.error(error);
	// 		setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to remove client from project");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const removeAllClients = async (clientsToRemove: Client[]) => {
	// 	setLoading(true);
	// 	try {
	// 		const clientIds = clientsToRemove.map(client => client.id);
	// 		await api.post("/clients/delete-all", { clients: clientIds });
	// 		setClients(prev => prev.filter(client => !clientIds.includes(client.id)));
	// 		setError(null);
	// 	} catch (error) {
	// 		console.error(error);
	// 		setError((error as AxiosError<AxiosResponseError>)?.response?.data?.error ?? "Failed to remove all clients");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return {
		// Clients list
		clients: clientsQuery.data?.clients ?? [],

		// Mutations
		createClient: create.mutateAsync,
		deleteClient: deleteById.mutateAsync,
		addToProject: addToProject.mutateAsync,
		removeFromProject: removeFromProject.mutateAsync,

		// loading state
		clientsLoading: clientsQuery.isLoading || create.isPending || deleteById.isPending,
	};
};
