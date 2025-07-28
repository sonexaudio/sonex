import type React from "react";
import { useEffect, useState, createContext } from "react";
import type { Client } from "../hooks/useClients";
import api from "../lib/axios";

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

    async function fetchClientFromStorage() {
        try {
            const { data: { data } } = await api.get("/auth/client");
            console.log("Client data fetched:", data);
            if (!data.client) {
                setClient(null);
                return;
            }
            setClient(data.client);
        } catch (error) {
            console.error("Error fetching client:", error);
            setClient(null);
        }
    }

    function removeClientFromStorage() {
        localStorage.removeItem("projectEmail");
        localStorage.removeItem("clientEmail");
    }

    // Fetch client data on initial load
    useEffect(() => {
        // my axios instance is already configured to find and provide the details from localStorage in the headers.
        fetchClientFromStorage().then(() => setLoading(false));

        // Listen for storage changes to update client state
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "projectToken" || e.key === "clientEmail") {
                fetchClientFromStorage();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // TODO - Add functions to send access and validate code provided by the client

    return (
        <ClientAuthContext.Provider value={{ loading, client, removeClientFromStorage }}>
            {children}
        </ClientAuthContext.Provider>
    );
};
