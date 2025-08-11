export interface Activity {
    id: string;
    userId: string;
    stripeSubscriptionId: string;
    plan: string;
    interval: string;
    priceId: string;
    pendingDowngradeTo: string;
    pendingDowngradeAt: Date | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    cancelAtPeriodEnd: boolean;

    // Flags
    isActive: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
}