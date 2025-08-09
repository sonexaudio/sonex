import { useState } from "react";
import useUser from "../../../hooks/useUser";
import PageLayout from "../../../components/PageLayout";
import { useSubscription } from "../../../hooks/useSubscription";
import api from "../../../lib/axios";
import SettingsTabs from "./SettingsTabs";
import ProfileSettings from "../../../components/settings/ProfileSettings";
import SubscriptionSettings from "../../../components/settings/SubscriptionSettings";
import StorageSettings from "../../../components/settings/StorageSettings";
import BillingSettings from "../../../components/settings/BillingSettings";
import AccountSettings from "../../../components/settings/AccountSettings";
import { getStripePrices } from "../../../utils/stripeConfig";

const SettingsPage = () => {
    const { currentUser } = useUser();
    const { subscription } = useSubscription();
    const [showYearlyPricing, setShowYearlyPricing] = useState(false);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
    const prices = getStripePrices();
    const [activeTab, setActiveTab] = useState("profile");


    const handleSubscribe = async (priceId: string) => {
        try {
            const {
                data: { data },
            } = await api.post("/payments/subscribe", {
                priceId,
            });

            window.location.href = data.sessionUrl;
        } catch (error) {
            setSubscriptionError(error.response.data.error);
            console.error(error);
        }
    };

    return (

        <PageLayout>
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="flex-1">
                        {activeTab === "profile" && <ProfileSettings />}
                        {activeTab === "subscription" && <SubscriptionSettings />}
                        {activeTab === "storage" && <StorageSettings />}
                        {activeTab === "billing" && <BillingSettings />}
                        {activeTab === "account" && <AccountSettings />}
                    </div>
                </div>
            </div>
        </PageLayout>

    );
};
export default SettingsPage;