import { createContext, useEffect, useState, type ReactNode } from "react";

import api, { setSessionExpiredHandler } from "../lib/axios";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";

export type User = {
	id: string;
	connectedAccountId: string;
	stripeCustomerId: string;
	avatarUrl?: string | null;

	firstName?: string;
	lastName?: string;
	email?: string;
	googleId?: string;
	isOnboarded: boolean;

	createdAt: string;
	updatedAt: string;
};

interface AuthContextType {
	user: User | null;
	loading: boolean;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	loginWithGoogle: () => Promise<void>;
	unlinkGoogleAccount: () => Promise<void>;
	signup: (data: Record<string, string>) => Promise<void>;
	logout: () => Promise<void>;
	refetchUser: () => Promise<void>;
}

type ErrorResponse = {
	message: string;
};

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchUser = async () => {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.get("/auth/me");
			setUser(data);
		} catch (error) {
			const axiosError = error as AxiosError<ErrorResponse>;
			// handle session-expired messages if backend returns them
			if (
				axiosError.response?.status === 401 &&
				axiosError.response?.data?.message ===
					"Session invalid. User no longer exists."
			)
				console.warn("Session expired or user no longer exists.");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	// Fetch user session on load
	useEffect(() => {
		// Only fetch if redirected back from Google
		if (
			window.location.pathname === "/" &&
			document.referrer.includes("/auth/google")
		) {
			fetchUser();
		} else {
			fetchUser(); // Safe to always call
		}
	}, []);

	useEffect(() => {
		setSessionExpiredHandler((message) => {
			setUser(null); // clear state
			navigate("/login", {
				replace: true,
				state: { message },
			});
		});
	}, [navigate]);

	const loginWithEmail = async (email: string, password: string) => {
		try {
			await api.post("/auth/login", { email, password });
			fetchUser();
		} catch (err) {
			const axiosError = err as AxiosError<ErrorResponse>;
			console.error(axiosError.response?.data);
			throw axiosError.response?.data;
		}
	};

	const loginWithGoogle = async () => {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	};

	const signup = async (data: Record<string, string>) => {
		try {
			const res = await api.post("/auth/register", data);
			return res.data.user;
		} catch (error) {
			const axiosError = error as AxiosError<ErrorResponse>;
			console.error(axiosError);
			throw axiosError.response?.data;
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
		await api.get("/auth/logout");
		fetchUser();
		navigate("/");
	};

	const value: AuthContextType = {
		user,
		loading,
		loginWithEmail,
		loginWithGoogle,
		unlinkGoogleAccount,
		signup,
		logout,
		refetchUser: fetchUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
