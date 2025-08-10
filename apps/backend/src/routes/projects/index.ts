import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as projectService from "../../services/project.service";
import { Prisma } from "../../generated/prisma";
import { validate } from "../../middleware/validate";
import { ProjectSchema } from "@sonex/schemas/project";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responses";
import { requireProjectAccess } from "../../middleware/projectAccess";

const projectRouter = Router();

projectRouter.get("/", requireAuth, async (req, res) => {
	const id = req.user?.id!;
	const { page, limit, search, status, paymentStatus, sortField, sortDirection } = req.query;
	try {
		const { projects, totalCount } = await projectService.getProjectsForUser(id, {
			page: Number(page) || 1,
			limit: Number(limit) || 10,
			search: search as string,
			status: status as string,
			paymentStatus: paymentStatus as string,
			sortField: sortField as string,
			sortDirection: sortDirection as string,
		});
		res.json({
			data: {
				projects,
				pagination: {
					page: Number(page) || 1,
					limit: Number(limit) || 10,
					totalCount,
					totalPages: Math.ceil(totalCount / (Number(limit) || 10)),
					hasNextPage: (Number(page) || 1) < Math.ceil(totalCount / (Number(limit) || 10)),
					hasPrevPage: (Number(page) || 1) > 1,
				},
			},
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch projects" });
	}
});

projectRouter.post(
	"/",
	requireAuth,
	validate(ProjectSchema),
	async (req, res) => {
		const userId = req.user?.id!;
		try {
			const newProject = await projectService.createProject(userId, req.body);
			res.status(201).json({ data: { project: newProject } });
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientValidationError) {
				res.status(422).json({ error: error.message });
				return;
			}
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				res.status(409).json({ error: "Project already exists with that name" });
				return;
			}
			res.status(500).json({ error: "Something went wrong" });
		}
	}
);

projectRouter.get("/:id", requireProjectAccess, async (req, res) => {
	const { id } = req.params;
	const project = await projectService.getProjectById(id);
	if (!project) {
		sendErrorResponse(res, 404, "Project not found");
		return;
	}
	res.json({ data: { project } });
});

projectRouter.get("/:id/folders", async (req, res) => {
	const { id } = req.params;
	try {
		const folders = await projectService.getProjectFolders(id);
		sendSuccessResponse(res, { folders });
	} catch (error) {
		sendErrorResponse(res, 500, "Failed to fetch folders");
	}
});

projectRouter.get("/:id/comments", async (req, res) => {
	const { id } = req.params;
	try {
		const comments = await projectService.getProjectComments(id);
		sendSuccessResponse(res, { comments });
	} catch (error) {
		sendErrorResponse(res, 500, "Failed to fetch comments");
	}
});

projectRouter.get("/:id/transactions", async (req, res) => {
	const { id } = req.params;
	try {
		const transactions = await projectService.getProjectTransactions(id);
		sendSuccessResponse(res, { transactions });
	} catch (error) {
		sendErrorResponse(res, 500, "Failed to fetch transactions");
	}
});

projectRouter.get("/:id/activities", async (req, res) => {
	const { id } = req.params;
	try {
		const activities = await projectService.getProjectActivities(id);
		sendSuccessResponse(res, { activities });
	} catch (error) {
		sendErrorResponse(res, 500, (error as Error).message);
	}
});

projectRouter.post("/:id/clients", async (req, res) => {
	const { id } = req.params;
	try {
		const client = await projectService.createClientForProject(id, req.body);
		sendSuccessResponse(res, { client });
	} catch (error) {
		sendErrorResponse(res, 500, (error as Error).message);
	}
});

projectRouter.put(
	"/:id",
	requireAuth,
	validate(ProjectSchema),
	async (req, res) => {
		const { id } = req.params;
		const userId = req.user?.id!;
		try {
			const updatedProject = await projectService.updateProject(id, userId, req.body);
			res.json({ data: { updatedProject } });
		} catch (error: any) {
			if (error.message === "Project does not exist") {
				res.status(404).json({ error: error.message });
			} else if (error.message === "Forbidden") {
				res.status(403).json({ error: error.message });
			} else {
				res.status(500).json({ error: "Failed to update project" });
			}
		}
	}
);

projectRouter.delete("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const userId = req.user?.id!;
	try {
		await projectService.deleteProject(id, userId);
		res.sendStatus(204);
	} catch (error: any) {
		if (error.message === "Project does not exist") {
			res.status(404).json({ error: error.message });
		} else if (error.message === "Forbidden") {
			res.status(403).json({ error: error.message });
		} else {
			res.status(500).json({ error: "Failed to delete project" });
		}
	}
});

export default projectRouter;
