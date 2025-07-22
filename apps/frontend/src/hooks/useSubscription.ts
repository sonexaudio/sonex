import { useContext } from "react";
import { SubscriptionContext } from "../context/SubscriptionProvider";

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);

    if (!ctx) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }

    return ctx;
}