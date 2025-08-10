import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responses";
import { prisma } from "../../lib/prisma";
import { parseUserName } from "../../utils";

const clientRouter = Router();

clientRouter.get("/", requireAuth, async (req, res) => {
	const userId = req.user?.id;

	try {
		const clients = await prisma.client.findMany({
			where: {
				userId
			},
		});
		sendSuccessResponse(res, { clients });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

clientRouter.post("/", requireAuth, async (req, res) => {
	const userId = req.user?.id as string;

	try {
		const clientName = parseUserName(req.body.name);
		const client = await prisma.client.create({
			data: {
				...req.body,
				name: `${clientName?.firstName} ${clientName?.lastName}`,
				userId,
			},
		});

		await prisma.activity.create({
			data: {
				userId,
				action: "Added client",
				targetType: "client",
				metadata: {
					email: client.email,
				},
				targetId: client.id,
			},
		});

		sendSuccessResponse(res, { client }, null, 201);
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

// Delete all clients
clientRouter.post("/delete-all", requireAuth, async (req, res) => {
	const userId = req.user?.id as string;
	const { clients } = req.body;

	if (!Array.isArray(clients) || clients.length === 0) {
		sendErrorResponse(res, 400, "No clients provided");
		return;
	}

	try {
		// Fetch only clients that match both ID and userId
		const existingClients = await prisma.client.findMany({
			where: {
				id: { in: clients },
				userId,
			},
		});

		const existingClientIds = existingClients.map((c) => c.id);
		const invalidClients = clients.filter(
			(id) => !existingClientIds.includes(id),
		);

		if (existingClientIds.length === 0) {
			sendErrorResponse(res, 404, "No valid clients found for deletion");
			return;
		}

		// Delete all valid clients in a transaction
		await prisma.$transaction([
			prisma.client.deleteMany({
				where: {
					id: { in: existingClientIds },
				},
			}),

			...existingClients.map((client) =>
				prisma.activity.create({
					data: {
						userId,
						action: "Deleted client",
						targetType: "client",
						targetId: client.id,
						metadata: {
							email: client.email,
						},
					},
				}),
			),
		]);
		res.status(200).json({
			deletedClientIds: existingClientIds,
			invalidClientIds: invalidClients.length > 0 ? invalidClients : undefined,
		});
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

clientRouter.put("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const userId = req.user?.id as string;

	try {
		const client = await prisma.client.findUnique({
			where: { id },
		});

		if (!client) {
			sendErrorResponse(res, 404, "Client not found");
			return;
		}

		if (client.userId !== userId) {
			sendErrorResponse(res, 403, "Forbidden");
			return;
		}

		const updatedClient = await prisma.client.update({
			where: { id },
			data: req.body,
		});

		await prisma.activity.create({
			data: {
				userId,
				action: "Updated client",
				targetType: "client",
				metadata: {
					email: updatedClient.email,
				},
				targetId: updatedClient.id,
			},
		});
		sendSuccessResponse(res, { client: updatedClient });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

clientRouter.delete("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const userId = req.user?.id as string;

	try {
		const client = await prisma.client.findUnique({
			where: { id },
		});
		if (!client) {
			sendErrorResponse(res, 404, "Client not found");
			return;
		}

		if (client.userId !== userId) {
			sendErrorResponse(res, 403, "Forbidden");
			return;
		}

		await prisma.client.delete({
			where: { id },
		});

		await prisma.activity.create({
			data: {
				userId,
				action: "Deleted client",
				targetType: "client",
				metadata: {
					email: client.email,
				},
				targetId: client.id,
			},
		});

		res.sendStatus(204);
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

export default clientRouter;
