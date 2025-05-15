import { createContext, useEffect, useState, type ReactNode } from "react";

import api, { setSessionExpiredHandler } from "../lib/axios";
import { useNavigate } from "react-router";

type User = {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	googleId?: string;
};

interface AuthContextType {
	user: User | null;
	loading: boolean;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	loginWithGoogle: () => Promise<void>;
	signup: (data: Record<string, string>) => Promise<void>;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Fetch user session on load
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { data } = await api.get("/auth/me");
				setUser(data.data.user);
			} catch (error) {
				// handle session-expired messages if backend returns them
				if (
					error.response?.status === 401 &&
					error.response?.data?.message ===
						"Session invalid. User no longer exists."
				) {
					console.warn("Session expired or user no longer exists.");
				}
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

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
			const { data } = await api.get("/auth/me");
			setUser(data.user);
		} catch (err: any) {
			console.error(err.response?.data);
			throw err.response?.data;
		}
	};

	const loginWithGoogle = async () => {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	};

	const signup = async (data: Record<string, string>) => {
		try {
			const res = await api.post("/auth/register", data);
			return res.data.user;
		} catch (error: any) {
			console.error(error);
			throw error.response?.data;
		}
	};

	const logout = async () => {
		await api.get("/auth/logout");
		setUser(null);
	};

	const value: AuthContextType = {
		user,
		loading,
		loginWithEmail,
		loginWithGoogle,
		signup,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
