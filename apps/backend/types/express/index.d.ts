import type { User as PrismaUser } from "../../src/generated/prisma";

declare global {
	namespace Express {
		interface User extends PrismaUser { }
		interface Request {
			projectAccess?: {
				type: "user" | "client";
				projectId: string;
				clientEmail?: string | undefined;
				accessGrantedAt?: Date | string | undefined;
			};
		}
	}
}
