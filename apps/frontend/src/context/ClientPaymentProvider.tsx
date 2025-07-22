import type React from "react";
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import api from "../lib/axios";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "../components/ui/sheet";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface ClientPaymentContextProps {
    openPaymentDialog: () => void;
    closePaymentDialog: () => void;
    isDialogOpen: boolean;
    paymentStatus: "idle" | "processing" | "success" | "error";
    errorMessage: string | null;
}

const ClientPaymentContext = createContext<
    ClientPaymentContextProps | undefined
>(undefined);

export const useClientPayment = () => {
    const ctx = useContext(ClientPaymentContext);
    if (!ctx)
        throw new Error(
            "useClientPayment must be used within ClientPaymentProvider",
        );
    return ctx;
};

interface ClientPaymentProviderProps {
    project: {
        id: string;
        userId: string;
        amount: number;
        paymentStatus?: string;
    };
    client: {
        id: string;
        email: string;
    };
    children: React.ReactNode;
}

const PaymentDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    project: ClientPaymentProviderProps["project"];
    client: ClientPaymentProviderProps["client"];
    setStatus: (s: "idle" | "processing" | "success" | "error") => void;
    setError: (e: string | null) => void;
}> = ({ isOpen, onClose, project, client, setStatus, setError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("processing");
        setError(null);
        setCardError(null);
        try {
            // 1. Create payment intent
            const { data } = await api.post("/payments/client", {
                projectId: project?.id,
                clientId: client.id,
                userId: project?.userId,
                amount: project?.amount,
            });
            const clientSecret = data?.data?.clientSecret;
            if (!clientSecret) throw new Error("Failed to get payment secret");
            // 2. Confirm card payment
            if (!stripe || !elements) throw new Error("Stripe not loaded");
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error("Card element not found");
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });
            if (result.error) {
                setCardError(result.error.message || "Payment failed");
                setStatus("error");
                setError(result.error.message || "Payment failed");
            } else if (
                result.paymentIntent &&
                result.paymentIntent.status === "succeeded"
            ) {
                setSuccess(true);
                setStatus("success");
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setCardError("Payment failed");
                setStatus("error");
                setError("Payment failed");
            }
        } catch (err: any) {
            setCardError(err.message || "Payment failed");
            setStatus("error");
            setError(err.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{project?.title}</SheetTitle>
                    <SheetDescription>
                        Upon payment, you will immediately be able to download the files in
                        this project.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    <h2 className="text-xl font-bold mb-4">Pay for Project</h2>
                    {success ? (
                        <div className="text-green-600 font-semibold text-center">Payment successful!</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="w-full px-4">
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                color: "#32325d",
                                                '::placeholder': { color: "#a0aec0" },
                                            },
                                            invalid: { color: "#fa755a" },
                                        },
                                    }}
                                    onChange={e => setCardError(e.error?.message || null)}
                                />
                            </div>
                            {cardError && <div className="text-red-600 text-sm">{cardError}</div>}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : `Pay $${project.amount}`}
                            </button>
                        </form>
                    )}
                </div>
            </SheetContent>
            {/* <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                    disabled={loading}
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-4">Pay for Project</h2>
                {success ? (
                    <div className="text-green-600 font-semibold text-center">Payment successful!</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#32325d",
                                            '::placeholder': { color: "#a0aec0" },
                                        },
                                        invalid: { color: "#fa755a" },
                                    },
                                }}
                                onChange={e => setCardError(e.error?.message || null)}
                            />
                        </div>
                        {cardError && <div className="text-red-600 text-sm">{cardError}</div>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : `Pay $${project.amount}`}
                        </button>
                    </form>
                )}
            </div> */}
        </Sheet>
    );
};

export const ClientPaymentProvider: React.FC<ClientPaymentProviderProps> = ({
    project,
    client,
    children,
}) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<
        "idle" | "processing" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const openPaymentDialog = useCallback(() => {
        setDialogOpen(true);
        setPaymentStatus("idle");
        setErrorMessage(null);
    }, []);
    const closePaymentDialog = useCallback(() => {
        setDialogOpen(false);
        setPaymentStatus("idle");
        setErrorMessage(null);
    }, []);

    const contextValue = useMemo(
        () => ({
            openPaymentDialog,
            closePaymentDialog,
            isDialogOpen,
            paymentStatus,
            errorMessage,
        }),
        [
            openPaymentDialog,
            closePaymentDialog,
            isDialogOpen,
            paymentStatus,
            errorMessage,
        ],
    );

    return (
        <ClientPaymentContext.Provider value={contextValue}>
            <Elements stripe={stripePromise}>
                {children}
                <PaymentDialog
                    isOpen={isDialogOpen}
                    onClose={closePaymentDialog}
                    project={project}
                    client={client}
                    setStatus={setPaymentStatus}
                    setError={setErrorMessage}
                />
            </Elements>
        </ClientPaymentContext.Provider>
    );
};
