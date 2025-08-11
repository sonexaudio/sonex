import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "../generated/prisma";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (session) {
		req.user = session?.user as User;
		return next();
	}

	res.status(401).json({ error: "Unauthorized" });
}

export const checkUserStillExists = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.isAuthenticated() || !req.user) return next();

	try {
		const userInDb = await prisma.user.findUnique({
			where: { id: req.user.id },
		});

		if (!userInDb) {
			// User was deleted — destroy session
			req.logout((err) => {
				if (err) return next(err);
				req.session.destroy((err) => {
					if (err) return next(err);
					return res
						.status(401)
						.clearCookie("sid")
						.json({ message: "Session invalid. User no longer exists." });
				});
			});
		} else {
			next();
		}
	} catch (err) {
		console.error("Error checking user existence:", err);
		res.status(500).json({ message: "Server error." });
	}
};
