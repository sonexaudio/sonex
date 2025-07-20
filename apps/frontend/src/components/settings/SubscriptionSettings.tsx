import { format, fromUnixTime } from "date-fns";
import { useSubscription } from "../../hooks/useSubscription";
import {
    PRICING_MAP,
    type PlanName,
} from "../../utils/stripeConfig";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import api from "../../lib/axios";

// Show the current subscription plan and allow the user to change it
// Need to get the

const SubscriptionSettings = () => {
    const { subscription, loading } = useSubscription();
    const [showUpdatePlanDialog, setShowUpdatePlanDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [showYearlyPricing, setShowYearlyPricing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    console.log("SUBSCRIPTION", subscription);

    const currentPlan =
        !subscription || !subscription.isActive ? "SonExperiment" : subscription.plan;
    const currentPlanTitle = PRICING_MAP[currentPlan]?.title;

    const formatNextBillingDate = () => {
        if (!subscription) return "Not applicable for SonExperiment";
        const nextBillingDate = new Date(subscription?.endDate).getTime();
        return format(nextBillingDate, "MMM d, yyyy");
    };

    const handleConfirmPlanChange = (plan: string) => {
        setSelectedPlan(plan);
        setShowUpdatePlanDialog(true);
    };

    const handleUpgradeOrDowngradePlan = async () => {
        // send a request to the backend with details
        // priceId (determined by stripe priceId)
        // If current plan is SonExperiment we'll need to make sure not user's first subscription, so we can re-activate the plan with their card information in stripe
        setIsUpdatingPlan(true);
        try {
            const newPriceId = PRICING_MAP[selectedPlan]?.priceId?.[selectedPlan === "SonExperiment" ? "monthly" : showYearlyPricing ? "yearly" : "monthly"];

            // Handle downgrade from non-SonExperiment plan to SonExperiment
            if (selectedPlan !== "SonExperiment" && currentPlan !== "SonExperiment") {
                const { data: { data } } = await api.post("/payments/change-plan", { newPriceId });
                if (data) {
                    window.location.reload();
                }
            } else if (selectedPlan !== "SonExperiment" && currentPlan === "SonExperiment") {
                const interval = showYearlyPricing ? "yearly" : "monthly";
                const priceId = PRICING_MAP[selectedPlan]?.priceId?.[interval] || null;

                const { data: { data } } = await api.post("/payments/subscribe", { priceId });

                if (data) {
                    window.location.href = data.sessionUrl;
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingPlan(false);
        }

    };

    const handleRedirectToBillingPortal = async () => {
        setIsRedirecting(true);
        try {
            const { data: { data } } = await api.post("/payments/portal");
            if (data?.portalUrl) {
                window.location.href = data.portalUrl;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsRedirecting(false);
        }

    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>
                        Manage your subscription plan and billing cycle.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Monthly and Yearly toggle */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowYearlyPricing(!showYearlyPricing)} className={!showYearlyPricing ? "ring-primary ring-2" : ""}>
                            Monthly
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowYearlyPricing(!showYearlyPricing)} className={showYearlyPricing ? "ring-primary ring-2" : ""}>
                            Annual
                        </Button>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className={currentPlan === "Free" ? "border-primary" : ""}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>The {PRICING_MAP.SonExperiment.title}</CardTitle>
                                        <div className="flex items-baseline mt-1">
                                            <span className="text-2xl font-bold">$0</span>
                                            <span className="ml-1 text-sm text-muted-foreground">
                                                /forever
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Badge
                                            variant="outline"
                                            className="bg-primary/10 text-primary"
                                        >
                                            Current Plan
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {PRICING_MAP.SonExperiment.description}
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc pl-5">
                                    {PRICING_MAP.SonExperiment.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {currentPlan === "SonExperiment" ? (
                                    <Button variant="outline" className="w-full" disabled>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            // TODO: create downgrade function
                                        }}
                                    >
                                        Downgrade
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                        {Object.entries(PRICING_MAP)
                            .filter(([planKey]) => planKey !== "SonExperiment")
                            .map(([planKey, plan]) => {
                                const isCurrentPlan = currentPlan === planKey;
                                return (
                                    <Card
                                        key={planKey}
                                        className={isCurrentPlan ? "border-primary" : ""}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>The {plan.title}</CardTitle>
                                                    <div className="flex items-baseline mt-1">
                                                        <span className="text-2xl font-bold">
                                                            {showYearlyPricing ? plan.priceYearly : plan.priceMonthly}
                                                        </span>
                                                        <span className="ml-1 text-sm text-muted-foreground">
                                                            /{showYearlyPricing ? "year" : "month"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    {isCurrentPlan && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-primary/10 text-primary"
                                                        >
                                                            Current Plan
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                                {plan.features.map((feature) => (
                                                    <li key={feature}>{feature}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            {isCurrentPlan ? (
                                                <Button variant="outline" className="w-full" disabled>
                                                    Current Plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => {
                                                        handleConfirmPlanChange(planKey);
                                                    }}
                                                    disabled={isUpdatingPlan}
                                                >
                                                    {currentPlan === "SonExperiment" ? "Upgrade" : "Change Plan"}
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                        Manage your payment method and billing details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex md:flex-col flex-col-reverse gap-4 md:gap-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 md:gap-0 border rounded-md">
                        <div>
                            <p className="font-medium">Next billing date</p>
                            <p className="text-sm text-muted-foreground">
                                {formatNextBillingDate()}
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            View Invoices
                        </Button>
                    </div>
                    {currentPlan !== "SonExperiment" && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 md:gap-0 border rounded-md">
                            <div>
                                <p className="font-medium">
                                    Update or cancel your current subscription
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This is handled by stripe.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleRedirectToBillingPortal}
                                disabled={isRedirecting}
                            >
                                {isRedirecting ? "Redirecting to Stripe..." : "Manage Subscription"}
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Dialog for upgrade/downgrade */}
            {showUpdatePlanDialog && (
                <Dialog
                    open={showUpdatePlanDialog}
                    onOpenChange={setShowUpdatePlanDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Plan Change</DialogTitle>
                            <DialogDescription>
                                {selectedPlan === "SonExperiment" ?
                                    `You are currently on the ${currentPlanTitle} plan. Changes will take effect on your next billing cycle. The SonExperiment plan only provides 5GB storage. If you have exceeded this amount, you will have 21 Days from the next billing cycle to remove files. Otherwise your account will be restricted` : `You're about to change from the ${currentPlanTitle} plan to the ${selectedPlan} plan. Changes will take immediately.`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="flex justify-between items-center p-4 border rounded-md">
                                <div>
                                    <p className="font-medium">{PRICING_MAP[selectedPlan]?.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPlan === "SonExperiment" ? "$0/forever" : showYearlyPricing ? PRICING_MAP[selectedPlan]?.priceYearly : PRICING_MAP[selectedPlan]?.priceMonthly} /{showYearlyPricing ? "year" : "month"}
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                    {selectedPlan === "SonExperiment" ? "Downgrade" : "Upgrade"}
                                </Badge>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUpdatePlanDialog(false)} disabled={isUpdatingPlan}>Cancel</Button>
                            <Button onClick={handleUpgradeOrDowngradePlan} disabled={isUpdatingPlan}>
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
};
export default SubscriptionSettings;
