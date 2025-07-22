export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	googleId: string;
	avatarUrl?: string | null;
	storageUsed: number;
	storageLimit: number;

	stripeCustomerId?: string | null;
	connectedAccountId?: string | null;

	isFounderMember: boolean;
	isVerified: boolean;
	isConnectedToStripe: boolean;
	isOnboarded: boolean;
	isAdmin: boolean;
	isActive: boolean;

	isInGracePeriod: boolean;
	hasExceededStorageLimit: boolean;
	gracePeriodExpiresAt: string;
	resetPasswordToken: string;
	resetTokenExpiresAt: string;

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
