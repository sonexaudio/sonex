export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	googleId: string;
	avatarUrl?: string | null;

	stripeCustomerId?: string | null;
	connectedAccountId?: string | null;

	isOnboarded?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	loginWithGoogle: () => Promise<void>;
	unlinkGoogleAccount: () => Promise<void>;
	signup: (data: Record<string, string>) => Promise<void>;
	logout: () => Promise<void>;
	refetchUser: () => Promise<void>;
}
