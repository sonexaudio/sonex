import { useState, type ChangeEvent, type FormEvent } from "react";
import useUser from "../../../hooks/useUser";
import { useTransactions } from "../../../hooks/useTransactions";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

interface NewPaymentFormProps {
    onClose: () => void;
}

const NewPaymentForm = ({ onClose }: NewPaymentFormProps) => {
    const { currentUser } = useUser();
    const { createTransaction } = useTransactions();
    const [paymentData, setPaymentData] = useState({
        type: "",
        amount: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setPaymentData((prev) => ({ ...prev, type: value }));
    };

    const handleCreatePayment = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                type: paymentData.type,
                amount: Number.parseFloat(paymentData.amount),
                userId: currentUser?.id,
            };

            await createTransaction(data);
            setPaymentData({ type: "", amount: "", description: "" });
            onClose();
        } catch (error) {
            console.error("Failed to create payment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create a New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Payment Type</Label>
                    <Select value={paymentData.type} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Subscription">Subscription</SelectItem>
                            <SelectItem value="ClientPayment">Client Payment</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentData.amount}
                        onChange={handleInputChange}
                        name="amount"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                        id="description"
                        type="text"
                        value={paymentData.description}
                        onChange={handleInputChange}
                        name="description"
                        placeholder="Payment description"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !paymentData.type || !paymentData.amount}
                    >
                        {loading ? "Creating..." : "Create Payment"}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
};

export default NewPaymentForm;
