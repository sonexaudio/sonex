import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses";
import { prisma } from "../lib/prisma";
import { generateTokenHash } from "../utils/token";
import jwt from "jsonwebtoken";
import config from "../config";

declare global {
	namespace Express {
		interface Request {
			projectClient?: { projectId: string; email: string; };
		}
	}
}

export async function requireProjectAccess(req: Request, res: Response, next: NextFunction) {
	const projectId = req.params.id || req.query.projectId || req.body.projectId;


	// 1. Check if user is authenticated
	if (req.isAuthenticated()) {
		const userId = req.user?.id;
		try {
			const project = await prisma.project.findUnique({ where: { id: projectId } });
			if (project?.userId === userId) {
				return next();
			}
		} catch (error) {
			return errorResponse(res, 500, "Error checking project access");
		}
	}

	// 2. Client JWT
	const token = req.cookies.client_token || req.headers.authorization?.split(" ")[1];
	if (token) {
		try {
			const payload = jwt.verify(token, config.auth.clientTokenSecret) as { projectId: string, email: string; };
			if (payload.projectId === projectId) {
				req.projectClient = payload;
				return next();
			}
		} catch (error) {
			return errorResponse(res, 401, "Invalid or expired client token");
		}
	}

	next();
}