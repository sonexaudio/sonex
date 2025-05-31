import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma";
import { validate } from "../../middleware/validate";
import { INVITE_EXPIRATION_DATE } from "../../../types";
import { ProjectSchema } from "@sonex/schemas/project";
import { errorResponse, successResponse } from "../../utils/responses";
import {
	generateClientAccessToken,
	generateTokenHash,
} from "../../utils/token";
import { checkProjectAccess } from "../../middleware/projectAccess";

const projectRouter = Router();

projectRouter.get("/", requireAuth, async (req, res) => {
	const id = req.user?.id;
	const projects = await prisma.project.findMany({
		where: {
			userId: id,
		},
	});

	res.json({ data: { projects } });
});

projectRouter.post(
	"/",
	requireAuth,
	validate(ProjectSchema),
	async (req, res) => {
		const id = req.user?.id;
		const projectData = req.body;

		// if (!projectData.title) {
		// 	res.status(422).json({ error: "Project title is required" });
		// 	return;
		// }

		try {
			const newProject = await prisma.project.create({
				data: {
					userId: id,
					...projectData,
				},
			});

			res.status(201).json({ data: { project: newProject } });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientValidationError) {
				res.status(422).json({ error: error.message });
				return;
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					res
						.status(409)
						.json({ error: "Project already exists with that name" });
				}
				return;
			}

			res.status(500).json({ error: "Something went wrong" });
		}
	},
);

projectRouter.get("/:id", checkProjectAccess, async (req, res) => {
	const { id } = req.params;
	const access = req.session.projectAccess;

	let project;

	if (access?.type === "client") {
		project = await prisma.project.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						email: true,
					},
				},
			},
		});
	} else {
		project = await prisma.project.findUnique({
			where: { id },
		});
	}

	res.json({ data: { project } });
});

projectRouter.post("/:id/check-access", async (req, res) => {
	const userId = req.user?.id as string;
	const projectId = req.params.id as string;
	const token =
		req.body.accessToken || (req.query?.token as string | undefined);

	const project = await prisma.project.findUnique({
		where: { id: projectId },
	});

	try {
		if (userId) {

			if (project?.userId === userId) {
				req.session.projectAccess = { type: "user", projectId };
				successResponse(res, { authorized: true, accessType: "user" });
				return;
			}
		}

		if (token) {
			const hashed = generateTokenHash(token);
			const clientAccess = await prisma.clientAccess.findFirst({
				where: {
					token: hashed,
					projectId,
					expires: { gte: new Date() },
				},
			});

			if (clientAccess) {
				req.session.projectAccess = {
					type: "client",
					projectId,
					clientEmail: clientAccess.email,
					accessGrantedAt: clientAccess.createdAt,
				};

				await prisma.clientAccess.update({
					where: { id: clientAccess.id },
					data: {
						acceptedAt: new Date()
					}
				});

				await prisma.activity.create({
					data: {
						action: `${clientAccess.email} accessed project '${project?.title}'`,
						targetType: "authorization",
						userId: project?.userId as string,
						targetId: clientAccess.id,
					}
				});

				successResponse(res, {
					authorized: true,
					accessType: "client",
					email: clientAccess.email,
				});
				return;
			}

			successResponse(res, {
				authorized: false,
				reason: "invalid_token",
			});

			return;
		}

		successResponse(res, {
			authorized: false,
			reason: "unauthenticated",
		});
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, "Something went wrong");
	}
});

projectRouter.post("/:id/request-access", async (req, res) => {
	const { email } = req.body;
	const projectId = req.params.id;

	if (!email || !projectId) {
		errorResponse(res, 400, "Missing email or projectId");
		return;
	}

	try {
		const token = generateClientAccessToken();
		const hashed = generateTokenHash(token);

		await prisma.clientAccess.upsert({
			where: {
				email_projectId: { email, projectId },
			},
			update: {
				token: hashed,
				expires: new Date(Date.now() + INVITE_EXPIRATION_DATE), // 3 days
			},
			create: {
				email,
				projectId,
				token: hashed,
				expires: new Date(Date.now() + INVITE_EXPIRATION_DATE),
			},
		});

		successResponse(res, {
			token,
			url: `${req.baseUrl}/${projectId}?token=${token}`,
		}); // for dev, will update to email
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, "Failed to create client access");
	}
});

projectRouter.put(
	"/:id",
	requireAuth,
	validate(ProjectSchema),
	async (req, res) => {
		const { id } = req.params;
		const existingProject = await prisma.project.findUnique({
			where: { id },
		});

		if (!existingProject) {
			res.status(404).json({ error: "Project does not exist" });
			return;
		}

		if (existingProject.userId !== req.user?.id) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		const updatedProject = await prisma.project.update({
			where: { id },
			data: {
				...req.body,
			},
		});

		res.json({ data: { updatedProject } });
	},
);

projectRouter.delete("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const existingProject = await prisma.project.findUnique({
		where: { id },
	});

	if (!existingProject) {
		res.status(404).json({ error: "Project does not exist" });
		return;
	}

	if (existingProject.userId !== req.user?.id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	await prisma.project.delete({
		where: { id },
	});

	res.sendStatus(204);
});

export default projectRouter;
