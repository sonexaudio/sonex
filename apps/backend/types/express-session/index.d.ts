import "express-session";

declare module "express-session" {
	interface SessionData {
		projectAccess?: {
			type: "user" | "client";
			projectId: string;
			clientEmail?: string;
			accessGrantedAt?: Date;
		};
	}
}
