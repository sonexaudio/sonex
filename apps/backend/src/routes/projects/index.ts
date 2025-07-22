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

	// Parse query parameters for pagination and filtering
	const page = Number.parseInt(req.query.page as string) || 1;
	const limit = Number.parseInt(req.query.limit as string) || 10;
	const search = (req.query.search as string) || "";
	const status = (req.query.status as string) || "";
	const paymentStatus = (req.query.paymentStatus as string) || "";
	const sortField = (req.query.sortField as string) || "createdAt";
	const sortDirection = (req.query.sortDirection as string) || "desc";

	// Calculate offset
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Prisma.ProjectWhereInput = {
		userId: id,
	};

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ description: { contains: search, mode: "insensitive" } },
		];
	}

	if (status && status !== "all") {
		where.status = status as any;
	}

	if (paymentStatus && paymentStatus !== "all") {
		where.paymentStatus = paymentStatus as any;
	}

	// Validate sort field to prevent injection
	const allowedSortFields = [
		"title",
		"status",
		"paymentStatus",
		"amount",
		"dueDate",
		"createdAt",
		"updatedAt",
	];
	const validSortField = allowedSortFields.includes(sortField)
		? sortField
		: "createdAt";
	const validSortDirection = sortDirection === "asc" ? "asc" : "desc";

	try {
		// Get projects with counts
		const projects = await prisma.project.findMany({
			where,
			orderBy: {
				[validSortField]: validSortDirection,
			},
			skip: offset,
			take: limit,
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				paymentStatus: true,
				amount: true,
				dueDate: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						files: true,
						clients: true,
					},
				},
			},
		});

		// Get total count for pagination
		const totalCount = await prisma.project.count({ where });

		// Transform data to include counts
		const transformedProjects = projects.map((project) => ({
			...project,
			fileCount: project._count.files,
			clientCount: project._count.clients,
		}));

		res.json({
			data: {
				projects: transformedProjects,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages: Math.ceil(totalCount / limit),
					hasNextPage: page < Math.ceil(totalCount / limit),
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching projects:", error);
		res.status(500).json({ error: "Failed to fetch projects" });
	}
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

projectRouter.get("/:id", async (req, res) => {
	const { id } = req.params;
	const project = await prisma.project.findUnique({
		where: { id },
		include: {
			clients: {
				include: {
					client: true
				}
			},
			files: true,
			user: {
				select: {
					email: true,
					firstName: true,
					lastName: true,
				}
			}
		}
	});

	if (!project) {
		errorResponse(res, 404, "Project not found");
		return;
	}

	res.json({ data: { project } });
});

// Single poject route handling
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
						acceptedAt: new Date(),
					},
				});

				await prisma.activity.create({
					data: {
						action: `${clientAccess.email} accessed project '${project?.title}'`,
						targetType: "authorization",
						userId: project?.userId as string,
						targetId: clientAccess.id,
					},
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

projectRouter.get("/:id/folders", async (req, res) => {
	const { id } = req.params;

	try {
		const folders = await prisma.folder.findMany({
			where: {
				projectId: id
			}
		});

		successResponse(res, { folders });
	} catch (error) {
		errorResponse(res, 500, "Failed to fetch folders");
	}

});

projectRouter.get("/:id/comments", async (req, res) => {
	const { id } = req.params;
	try {
		const comments = await prisma.comment.findMany({
			where: {
				projectId: id
			}
		});

		successResponse(res, { comments });
	} catch (error) {
		errorResponse(res, 500, "Failed to fetch comments");
	}
});

projectRouter.get("/:id/transactions", async (req, res) => {
	const { id } = req.params;

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				projectId: id
			}
		});

		successResponse(res, { transactions });
	} catch (error) {
		errorResponse(res, 500, "Failed to fetch transactions");
	}
});

projectRouter.get("/:id/activities", async (req, res) => {
	const { id } = req.params;
	try {
		const activities = await prisma.activity.findMany({
			where: {
				targetId: id
			}
		});

		successResponse(res, { activities });
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, (error as Error).message);
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
