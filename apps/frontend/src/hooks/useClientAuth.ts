import { useEffect, useState } from "react";
import type { Client } from "./useClients";
import api from "../lib/axios";

export default function useClientAuth() {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem("projectToken");
        if (accessToken) {
            getClient().then(() => setLoading(false));
        }
    }, []);

    async function getClient() {
        const email = localStorage.getItem("clientEmail");
        try {
            if (email) {
                const { data: { data } } = await api.get("/clients/auth", {
                    params: { email }
                });

                setClient(data.client);
            }
        } catch (error) {
            console.error(error);
            setClient(null);
        } finally {
            setLoading(false);
        }
    }

    function removeClientFromStorage() {
        // client can choose to remove themselves from a project
        if (client) {
            localStorage.removeItem("projectAccessType");
            localStorage.removeItem("projectEmail");
            localStorage.removeItem("projectToken");
        }
    }

    return {
        loading,
        client,
        getClient,
        removeClientFromStorage
    };
}
