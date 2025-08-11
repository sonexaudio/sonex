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
