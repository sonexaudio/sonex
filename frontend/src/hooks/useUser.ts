import { useState } from "react";
import api from "../lib/axios";
import { useAuth } from "./useAuth";

export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	googleId: string;
	avatarUrl?: string | null;
	stripeCustomerId?: string | null;
	isOnboarded?: boolean;
	createdAt?: string;
	updatedAt?: string;
};

export default function useUser() {
	const { user, loading, refetchUser } = useAuth();
	const [activities, setActivities] = useState([]);
	const [transactions, setTransactions] = useState([]);

	const updateUserInfo = async (userData: Record<string, unknown>) => {
		const { firstName, lastName, ...rest } = userData;

		let name: string | undefined;
		if (firstName && lastName) {
			name = `${firstName} ${lastName}`;
		}

		try {
			const {
				data: { data },
			} = await api.put(`/users/${user?.id}`, { name, ...rest });

			if (data) {
				await refetchUser();
			}
		} catch (error) {
			console.error(error);
		}
	};

	const deleteUser = async () => {
		try {
			await api.delete(`/users/${user?.id}`);
			refetchUser();
		} catch (error) {
			console.error(error);
		}
	};

	const getActivities = async () => {
		const {
			data: { data },
		} = await api.get(`/users/${user?.id}/activities`);
		setActivities(data.activities);
	};

	const getTransactionHistory = async () => {
		const {
			data: { data },
		} = await api.get(`/users/${user?.id}/transactions`);
		setTransactions(data.transactions);
	};

	return {
		currentUser: user,
		getActivities,
		activities,
		getTransactionHistory,
		transactions,
		updateUserInfo,
		deleteUser,
		loading,
	};
}
