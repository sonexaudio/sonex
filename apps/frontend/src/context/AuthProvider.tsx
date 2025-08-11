import { createContext, type ReactNode } from "react";

import api from "../lib/axios";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";
import type { AuthContextType } from "../types/users";
import { authClient } from "../lib/client-auth";
import type { BetterFetchError } from "better-auth/react";
import { toast } from "sonner";

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
		const { data: success, error } = await authClient.signIn.email({
			email,
			password,
			rememberMe: true,
		},
			{
				onRequest: () => { },
				onResponse: () => { },
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: () => {
					toast("Welcome back!");
					navigate("/overview");
				}
			}
		);

		if (error) throw error;

		return success;
	};

	const loginWithGoogle = async () => {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	};

	const signup = async (data: { email: string; password: string; name: string; }): Promise<NonNullable<{
		token: null;
		user: {
			id: string;
			email: string;
			name: string;
			image: string | null | undefined;
			emailVerified: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
	} | {
		token: string;
		user: {
			id: string;
			email: string;
			name: string;
			image: string | null | undefined;
			emailVerified: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
	}> | undefined> => {

			const { data: success, error } = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			}, {
				onRequest: () => { },
				onResponse: () => { },
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: () => {
					const { name } = data;
					const firstName = name.split(" ")[0];
					toast(`Welcome to Sonex ${firstName}!`);
					navigate("/overview");
				}
			});

			if (error) throw error;
		return success
	};

	const unlinkGoogleAccount = async () => {
		try {
			await api.put("/auth/google/unlink");
		} catch (error) {
			console.error(error);
		}
	};

	const logout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: () => {
					toast("See you later!")
					navigate("/");
				}
			}
		});
	};

	const value: AuthContextType = {
		user: session?.user || null,
		session: session?.session || null,
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
