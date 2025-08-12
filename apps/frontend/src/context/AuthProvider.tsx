import { createContext, useState, type ReactNode } from "react";

import api from "../lib/axios";
import { useNavigate } from "react-router";
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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccessful, setSubmitSuccessful] = useState(false);

	const { data: session, isPending, error, refetch } = authClient.useSession();

	const navigate = useNavigate();

	const loginWithEmail = async ({ email, password, redirectTo }: { email: string, password: string, redirectTo?: string; }) => {
		const { data: success, error } = await authClient.signIn.email(
			{
				email,
				password,
				rememberMe: true,
			},
			{
				onRequest: () => {
					setIsSubmitting(true);
				},
				onResponse: () => {
					setIsSubmitting(false);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: () => {
					toast("Welcome back!");

					if (redirectTo && redirectTo !== "signup") {
						navigate(redirectTo);
						return;
					}

					navigate("/overview");
				},
			},
		);

		if (error) throw error;

		return success;
	};

	const loginWithGoogle = async () => {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	};

	const signup = async (data: {
		email: string;
		password: string;
		name: string;
	}) => {
		const { data: success, error } = await authClient.signUp.email(
			{
				email: data.email,
				password: data.password,
				name: data.name,
			},
			{
				onRequest: () => {
					setIsSubmitting(true);
					setSubmitSuccessful(false);
				},
				onResponse: () => {
					setIsSubmitting(false);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: async () => {
					setSubmitSuccessful(true);
				},
			},
		);

		if (error) throw error;



		return success;
	};

	const verifyOTP = async ({ email, otp }: { email: string, otp: string; }) => {
		await authClient.emailOtp.verifyEmail({
			email,
			otp,
			fetchOptions: {
				onRequest: () => {
					setIsSubmitting(true);
				},
				onError: (ctx) => {
					setIsSubmitting(false);
					toast.error(ctx.error.message);
				},
				onSuccess: async () => {
					toast.success("OTP verified successfully!");
					setTimeout(() => navigate("/login", { state: { from: "signup" } }), 2000);
				}
			}
		});
	}

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
					toast("See you later!");
					navigate("/");
				},
			},
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
		error: error ? (error as BetterFetchError) : null,
		isSubmitting,
		submitSuccessful,
		verifyOTP
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
