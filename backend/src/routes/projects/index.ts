import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma";

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

projectRouter.post("/", requireAuth, async (req, res) => {
	const id = req.user?.id;
	const projectData = req.body;

	if (!projectData.title) {
		res.status(422).json({ error: "Project title is required" });
		return;
	}

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
});

projectRouter.get("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const existingProject = await prisma.project.findUnique({
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

	if (!existingProject) {
		res.status(404).json({ error: "Project does not exist" });
	}

	res.json({ data: { project: existingProject } });
});

projectRouter.put("/:id", requireAuth, async (req, res) => {
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
});

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

	res.sendStatus(204);
});

export default projectRouter;
