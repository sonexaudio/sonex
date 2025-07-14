import { MoreHorizontal, CreditCard, Download, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { useTransactions, type Transaction } from "../../../hooks/useTransactions";
import { formatDistanceToNow } from "date-fns";

interface TransactionsTableProps {
    transactions: Transaction[];
}

const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
    const { deleteTransaction } = useTransactions();

    const handleDeleteTransaction = async (transactionId: string) => {
        await deleteTransaction(transactionId);
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "subscription":
                return "bg-blue-100 text-blue-800";
            case "refund":
                return "bg-red-100 text-red-800";
            case "clientpayment":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (transactions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                        Your payment history will appear here once you make your first transaction.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">
                                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).toLowerCase()}
                                    </h3>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <span>${transaction.amount.toFixed(2)}</span>
                                        {transaction.refundedAt && (
                                            <Badge variant="destructive" className="text-xs">
                                                Refunded
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge className={getTransactionTypeColor(transaction.type)}>
                                    {transaction.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Receipt
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="text-destructive"
                                        >
                                            Delete Transaction
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionsTable; 