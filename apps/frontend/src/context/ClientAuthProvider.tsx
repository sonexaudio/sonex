import type React from "react";
import { useEffect, useState, createContext } from "react";
import type { Client } from "../hooks/useClients";
import api from "../lib/axios";
import type { AxiosError } from "axios";

interface ClientAuthContextType {
    loading: boolean;
    client: Client | null;
    removeClientFromStorage: () => void;
}

export const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode; }> = ({
    children,
}) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<Client | null>(null);

    async function checkClientAuth() {
        setLoading(true);
        console.log("Checking client authentication...");
        try {
            const { data: { data } } = await api.get("/auth/client");
            console.log("Client data:", data);

            if (data.client) {
                console.log("Client data fetched successfully:", data.client);
                setClient(data.client);
            } else {
                setClient(null);
            }
        } catch (error) {
            // Silently try to refresh tokens
            if ((error as AxiosError).response?.status === 401) {
                try {
                    await api.post("/auth/client/refresh");
                    // Try again
                    const { data: { data } } = await api.get("/auth/client");
                    setClient(data.client);
                } catch (refreshError) {
                    console.error("Refresh failed", refreshError);
                    setClient(null);
                }
            } else {
                console.error("Error fetching client:", error);
                setClient(null);
            }
        } finally {
            setLoading(false);
        }
    }

    function removeClientFromStorage() {
        localStorage.removeItem("projectEmail");
        localStorage.removeItem("clientEmail");
    }

    // Fetch client data on initial load
    useEffect(() => {
        // my axios instance is already configured to find and provide the details from the cookies.
        checkClientAuth();
    }, []);

    // TODO - Add functions to send access and validate code provided by the client

    console.log("ClientAuthProvider values:", { loading, client });

    return (
        <ClientAuthContext.Provider value={{ loading, client, removeClientFromStorage }}>
            {children}
        </ClientAuthContext.Provider>
    );
};
