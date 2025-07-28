import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses";
import { prisma } from "../lib/prisma";
import { generateTokenHash } from "../utils/token";
import jwt from "jsonwebtoken";
import config from "../config";

declare global {
	namespace Express {
		interface Request {
			client?: { projectId: string; email: string; };
		}
	}
}

export async function requireProjectAccess(req: Request, res: Response, next: NextFunction) {
	const projectId = req.params.id || req.query.projectId || req.body.projectId;

	// 1. Check if user is authenticated
	if (req.isAuthenticated()) {
		console.log("Checking project access for authenticated user...");
		const userId = req.user?.id;
		try {
			const project = await prisma.project.findUnique({ where: { id: projectId } });
			if (project?.userId === userId) {
				console.log("User is the owner of the project");
				return next();
			}
		} catch (error) {
			return errorResponse(res, 500, "Error checking project access");
		}
	}

	// 2. Client JWT
	const token = req.headers.authorization?.split(" ")[1];
	if (token) {
		try {
			const payload = jwt.verify(token, config.auth.clientTokenSecret) as { projectId: string, email: string; };
			if (payload.projectId === projectId) {
				console.log("Client token is valid for the project");
				req.client = payload;
				return next();
			}
		} catch (error) {
			return errorResponse(res, 401, "Invalid or expired client token");
		}
	}
}