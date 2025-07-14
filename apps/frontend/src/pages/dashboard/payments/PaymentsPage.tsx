import { useState } from "react";
import { Plus, CreditCard, TrendingUp } from "lucide-react";
import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import { useTransactions } from "../../../hooks/useTransactions";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "../../../components/ui/dialog";
import NewPaymentForm from "./NewPaymentForm";
import TransactionsTable from "./TransactionsTable";

const PaymentsPage = () => {
    const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
    const { transactions, loading, error } = useTransactions();

    const handleCloseDialog = () => {
        setShowNewPaymentForm(false);
    };

    // Calculate summary statistics
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTransactions = transactions.length;
    const recentTransactions = transactions.slice(0, 5);

    if (loading) return <p>Loading...</p>;

    return (
        <AuthLayout>
            <PageLayout>
                <div className="space-y-6 mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                            <p className="text-muted-foreground">
                                Track your payment history, manage transactions, and monitor your financial activity.
                            </p>
                        </div>
                        <Dialog open={showNewPaymentForm} onOpenChange={setShowNewPaymentForm}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <NewPaymentForm onClose={handleCloseDialog} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-card border rounded-lg p-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
                            </div>
                            <p className="text-2xl font-bold">{totalTransactions}</p>
                        </div>
                        <div className="bg-card border rounded-lg p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                            </div>
                            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <TransactionsTable transactions={transactions} />
                </div>
            </PageLayout>
        </AuthLayout>
    );
};

export default PaymentsPage; 