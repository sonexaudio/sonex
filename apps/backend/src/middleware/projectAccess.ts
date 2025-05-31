import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses";
import { prisma } from "../lib/prisma";
import { generateTokenHash } from "../utils/token";

export async function checkProjectAccess(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const projectId = req.params.id ?? req.body.projectId;
	const userId = req.user?.id;
	const clientToken = req.query?.token as string | undefined;

	if (!projectId) {
		errorResponse(res, 400, "Missing projectId");
		return;
	}

	const project = await prisma.project.findUnique({ where: { id: projectId } });

	if (!project) {
		errorResponse(res, 404, "Project does not exist");
		return;
	}

	// ✅ 1. Authenticated user (owner)
	if (userId && project.userId === userId) {
		req.session.projectAccess = { type: "user", projectId };
		next();
		return;
	}

	// ✅ 2. Client token
	if (clientToken) {
		const hashed = generateTokenHash(clientToken);

		const access = await prisma.clientAccess.findFirst({
			where: {
				token: hashed,
				projectId,
				expires: { gte: new Date() },
			},
		});

		if (access) {
			req.session.projectAccess = {
				type: "client",
				projectId,
				clientEmail: access.email,
				accessGrantedAt: access.createdAt,
			};
		}
	}

	next();
	return;
}
