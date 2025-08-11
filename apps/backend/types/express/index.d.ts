import type { User as PrismaUser } from "../../src/generated/prisma";

declare global {
	namespace Express {
		interface Request {
			user?: User & { id: string; };
		}
	}
}
