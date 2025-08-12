import type { BetterFetchError } from "better-auth/react";
import type { Subscription } from "../../context/SubscriptionProvider";
import type { SonexActivity } from "../../hooks/useActivities";
import type { Transaction } from "../../hooks/useTransactions";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	image?: string | null;
	emailVerified: boolean;
	createdAt: Date | undefined;
	updatedAt: Date | undefined;
}

export interface User extends AuthUser {
	firstName: string;
	lastName: string;
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
	activities: SonexActivity[];
	transactions: Transaction[];
	subscriptions: Subscription[];
}

export interface AuthContextType {
	user: AuthUser | null;
	session: UserSession | null;
	loading: boolean;
	loginWithEmail: ({
		email,
		password,
		redirectTo,
	}: { email: string; password: string; redirectTo?: string; }) => Promise<{
		redirect: boolean;
		token: string;
		url: string | undefined;
		user: {
			id: string;
			email: string;
			name: string;
			image: string | null | undefined;
			emailVerified: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
	}>;
	loginWithGoogle: () => Promise<void>;
	unlinkGoogleAccount: () => Promise<void>;
	signup: (data: { email: string; password: string; name: string; }) => Promise<
		| NonNullable<
			| {
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
			}
			| {
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
			}
		>
		| undefined
	>;
	logout: () => Promise<void>;
	refetchUser: () => void;
	error: BetterFetchError | Error | string | null;
	isSubmitting: boolean;
	submitSuccessful: boolean;
	verifyOTP: (data: { email: string; otp: string; }) => Promise<void>;
}

export interface UserSession {
	id: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	token: string;
	ipAddress?: string | null | undefined;
	userAgent?: string | null | undefined;
}
