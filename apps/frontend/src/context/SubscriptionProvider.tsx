import { createContext, useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import api from "../lib/axios";

export interface Subscription {
    id: string;
    userId: string;
    stripeSubscriptionId: string;
    plan: string;
    startDate: Date;
    endDate: Date;
    cancelAtPeriodEnd: boolean;
    isActive: boolean;
}

export type SubscriptionContextType = {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    refetchSubscription: () => void;
    getProjectOwnerSubscription: (userId: string) => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const SubscriptionProvider = ({ children }: { children: React.ReactNode; }) => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useUser();

    const fetchSubscription = async () => {
        const { data: { data } } = await api.get("/payments/subscription");
        console.log("DATA", data);
        setSubscription(data.subscription);
    };

    // Used for fetching the owner's subscription without needing an authenticated user
    const getProjectOwnerSubscription = async (userId: string) => {
        const { data: { data } } = await api.get(`/payments/subscription/${userId}`);
        setSubscription(data.subscription);
    };

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            try {
                // get subscription
                fetchSubscription();
            } catch (error) {
                setError("Failed to fetch subscription");
            } finally {
                setLoading(false);
            }
        }
    }, [currentUser?.id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <SubscriptionContext.Provider value={{ subscription, loading, error, refetchSubscription: fetchSubscription, getProjectOwnerSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
export default SubscriptionProvider;