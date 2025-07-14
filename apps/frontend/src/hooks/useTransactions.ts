import { useState, useEffect } from "react";
import api from "../lib/axios";
import type { AxiosError } from "axios";

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

export interface AxiosResponseError extends AxiosError {
    error?: string;
}

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const {
                data: { data },
            } = await api.get("/transactions");
            setTransactions(data.transactions);
        } catch (error) {
            console.error(error);
            setError(
                (error as AxiosError<AxiosResponseError>).response?.data
                    ?.error as string,
            );
        } finally {
            setLoading(false);
        }
    }

    async function createTransaction(transactionData: Partial<Transaction>) {
        try {
            const {
                data: { data },
            } = await api.post("/transactions", transactionData);
            if (data) {
                setTransactions(prev => [data.transaction, ...prev]);
            }
            return data?.transaction;
        } catch (error) {
            console.error(error);
            setError(
                (error as AxiosError<AxiosResponseError>).response?.data
                    ?.error as string,
            );
            throw error;
        }
    }

    async function updateTransaction(id: string, transactionData: Partial<Transaction>) {
        try {
            const {
                data: { data },
            } = await api.put(`/transactions/${id}`, transactionData);
            if (data) {
                setTransactions(prev =>
                    prev.map(tx => tx.id === id ? data.transaction : tx)
                );
            }
            return data?.transaction;
        } catch (error) {
            console.error(error);
            setError(
                (error as AxiosError<AxiosResponseError>).response?.data
                    ?.error as string,
            );
            throw error;
        }
    }

    async function deleteTransaction(id: string) {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch (error) {
            console.error(error);
            setError(
                (error as AxiosError<AxiosResponseError>).response?.data
                    ?.error as string,
            );
            throw error;
        }
    }

    return {
        transactions,
        loading,
        error,
        fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
    };
} 