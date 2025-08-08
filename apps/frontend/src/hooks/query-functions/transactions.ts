import api from "../../lib/axios";
import type { Transaction } from "../useTransactions";

// Fetch all transactions
export async function fetchTransactions(): Promise<Transaction[]> {
    const { data } = await api.get("/transactions");
    return data.data.transactions;
}

// Create a new transaction
export async function createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data } = await api.post("/transactions", transactionData);
    return data.data.transaction;
}

// Update an existing transaction
export async function updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data } = await api.put(`/transactions/${id}`, transactionData);
    return data.data.transaction;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
}
