import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import api from "../../lib/axios";
import type { User } from "../../types/users";
import { useAuth } from "../../hooks/useAuth";

export default function OnboardingStepStripe({ onNext, user }: { onNext: () => void; user: User; }) {
    const { refetchUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const hasAccount = user?.connectedAccountId !== null;

    // should be ran only the first time the user is onboarding
    useEffect(() => {
        const createAccount = async () => {
            try {
                await api.post("/accounts/account");
                await refetchUser();
            } catch (error) {
                console.error("Account not created", error);
            }
        };
        if (!hasAccount) {
            createAccount();
        }
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        const { data: { data } } = await api.post("/accounts/onboarding");
        window.location.href = data.accountLink;
    };


    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full px-2 space-y-2">
                <h2 className="text-2xl font-semibold">Connect your Stripe Account</h2>
                <p className="text-sm mb-4">Connect your Stripe Account to start getting paid for your work. If you don't have a Stripe account you can still create one when you click this button.</p>
                <Button
                    type="button"
                    className="w-full mb-6"
                    onClick={handleConnect}
                    disabled={loading}
                >
                    {loading ? "Redirecting to Stripe Portal..." : "Connect your Stripe Account"}
                </Button>

                <div className="flex flex-col sm:flex-row justify-between sm:align-middle items-center gap-4">
                    <div className="flex items-center">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <span key={i} className={i === 2 ? 'mx-1 w-3 h-3 rounded-full bg-black' : 'mx-1 w-3 h-3 rounded-full bg-gray-300'} />
                        ))}
                    </div>
                    <span className="text-black cursor-pointer" onClick={onNext}>Skip</span>
                </div>
            </div>
        </div >
    );
} 