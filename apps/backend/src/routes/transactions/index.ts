import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

const txRouter = Router();

txRouter.get("/", requireAuth, async (req, res) => {
	const transactions = await prisma.transaction.findMany({
		where: {
			userId: req.user?.id,
		},
	});

	res.json({ data: { transactions } });
});

txRouter.get("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const transaction = await prisma.transaction.findUnique({
		where: {
			id,
			userId: req.user?.id,
		},
	});

	if (!transaction) {
		res.status(404).json({ error: "Could not find transaction" });
		return;
	}

	res.json({ data: { transaction } });
});

// TODO: Add verification to check if user manually added transaction in update/delete route
// Transactions added by system can not be manipulated

txRouter.put("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const transactionData = req.body;

	const transaction = await prisma.transaction.findUnique({
		where: {
			id,
		},
	});

	if (!transaction) {
		res.status(404).json({ error: "Transaction not found" });
		return;
	}

	if (transaction.userId !== req.user?.id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	const updatedTx = await prisma.transaction.update({
		where: { id },
		data: transactionData,
	});

	res.json({ data: { transaction: updatedTx } });
});

txRouter.delete("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const transaction = await prisma.transaction.findUnique({
		where: {
			id,
		},
	});

	if (!transaction) {
		res.status(404).json({ error: "Transaction not found" });
		return;
	}

	if (transaction.userId !== req.user?.id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	await prisma.transaction.delete({
		where: {
			id,
		},
	});

	res.sendStatus(204);
});
