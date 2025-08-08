
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "./query-functions/transactions";

export interface Transaction {
    id: string;
    userId: string;
    type: string;
    amount: number;
    subscriptionId?: string;
    stripeChargeId?: string;
    refundedAt?: Date | string;
    refundReason?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Generic error type for React Query hooks
export interface SonexQueryError<T = unknown> {
    error?: T;
}

export function useTransactions<TError = unknown>() {
    const queryClient = useQueryClient();

    // Fetch all transactions
    const transactionsQuery = useQuery<Transaction[], SonexQueryError<TError>>({
        queryKey: ["transactions"],
        queryFn: fetchTransactions,
    });

    // Create transaction
    const createMutation = useMutation({
        mutationFn: (transactionData: Partial<Transaction>) => createTransaction(transactionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    // Update transaction
    const updateMutation = useMutation({
        mutationFn: ({ id, transactionData }: { id: string; transactionData: Partial<Transaction>; }) => updateTransaction(id, transactionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    // Delete transaction
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    return {
        transactions: transactionsQuery.data || [],
        isLoading: transactionsQuery.isLoading,
        error: transactionsQuery.error,
        refetch: transactionsQuery.refetch,
        createTransaction: createMutation.mutateAsync,
        updateTransaction: (id: string, transactionData: Partial<Transaction>) =>
            updateMutation.mutateAsync({ id, transactionData }),
        deleteTransaction: deleteMutation.mutateAsync,
        createStatus: createMutation.status,
        updateStatus: updateMutation.status,
        deleteStatus: deleteMutation.status,
    };
}