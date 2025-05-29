import { useEffect, useState } from "react";
import useUser from "./useUser";
import api from "../lib/axios";
import type { AxiosError } from "axios";

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
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchClients() {
        try {
            const { data: { data } } = await api.get("/clients");
            if (data) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error(error);
            setError(((error as AxiosError<AxiosResponseError>).response?.data?.error as string));
            setClients([]);
        } finally {
            setLoading(false);
        }
    }

    async function addClient(clientData: Partial<Client>) {
        try {
            const { data: { data } } = await api.post("/clients", clientData);
            if (data) {
                setClients((prev) => [...prev, ...data.clients]);
            }
        } catch (error) {
            console.error(error);
            setError(((error as AxiosError<AxiosResponseError>).response?.data?.error as string));
        }

    }

    async function updateClient(id: string, clientData: Partial<Client>) {
        if (Object.entries(clientData).length === 0) return;

        setLoading(true);
        try {
            const { data: { data } } = await api.put(`/clients/${id}`, clientData);

            if (data) {
                const updatedClients = clients.map(client => client.id === id ? { ...data.client } : client);

                setClients(updatedClients);
            }
        } catch (error) {
            console.error(error);
            setError(((error as AxiosError<AxiosResponseError>).response?.data?.error as string));
        } finally {
            setLoading(false);
        }
    }

    async function removeClient(id: string) {
        setLoading(true);
        try {
            await api.delete("/clients");
            setClients(clients.filter(client => client.id !== id));
        } catch (error) {
            console.error(error);
            setError((error as AxiosError<AxiosResponseError>).response?.data?.error as string);
        } finally {
            setLoading(false);
        }
    }

    async function removeAllClients(clients: Client[]) {
        try {
            await api.post("/clients/delete-all", clients);
        } catch (error) {
            console.error(error);
            setError((error as AxiosError<AxiosResponseError>).response?.data?.error as string);
        }
    }

    useEffect(() => {
        if (currentUser?.id) {
            fetchClients();
        }
    }, [currentUser?.id]);

    return {
        clients,
        addClient,
        refetchClients: fetchClients,
        updateClient,
        removeClient,
        removeAllClients,
        loading,
        error
    };
}