import { createContext, type ReactNode } from "react";

import api from "../lib/axios";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";
import type { AuthContextType } from "../types/users";
import { authClient } from "../lib/client-auth";
import type { BetterFetchError } from "better-auth/react";

export type ErrorResponse = {
	message: string;
};

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export function AuthProvider({ children }: { children: ReactNode; }) {
	const { data: session, isPending, error, refetch } = authClient.useSession();
	const navigate = useNavigate();

	const loginWithEmail = async (email: string, password: string) => {
		await authClient.signIn.email({
			email,
			password,
			callbackURL: "/overview",
			rememberMe: true,
		});
	};

	const loginWithGoogle = async () => {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	};

	const signup = async (data: { email: string; password: string; name: string; }) => {
		try {
			await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});
		} catch (error) {
			const axiosError = error as AxiosError<ErrorResponse>;
			throw axiosError.response?.data.message;
		}
	};

	const unlinkGoogleAccount = async () => {
		try {
			await api.put("/auth/google/unlink");
			await fetchUser();
		} catch (error) {
			console.error(error);
		}
	};

	const logout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/");
				}
			}
		});
	};

	const value: AuthContextType = {
		user: session?.user || null,
		loading: isPending,
		loginWithEmail,
		loginWithGoogle,
		unlinkGoogleAccount,
		signup,
		logout,
		refetchUser: refetch,
		error: error ? (error as BetterFetchError) : null
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
