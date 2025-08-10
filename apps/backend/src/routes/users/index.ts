import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { parseUserName, type UserDisplayName } from "../../utils";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responses";

const userRouter = Router();

userRouter.get("/:id/subscription-status", async (req, res) => {
	const { id } = req.params;
	try {
		const subscription = await prisma.subscription.findFirst({
			where: {
				userId: id,
				startDate: {
					// get the subscription that has started in the past 30 days
					gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					lt: new Date(),
				},
				isActive: true,
			}
		});

		const user = await prisma.user.findUnique({
			where: {
				id,
			}
		});


		const hasActiveSubscription = !!subscription;
		const isActive = hasActiveSubscription || user?.subscriptionStatus === "free" || user?.isActive || !user?.hasExceededStorageLimit || user?.subscriptionStatus !== "past_due" || !user?.isInGracePeriod;

		sendSuccessResponse(res, { isActive });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Failed to fetch subscription status");
	}

});

userRouter.put("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;
	const { name, ...userData } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: {
				id,
			},
		});

		if (!user) {
			res.status(404).json({ error: "User does not exist in database" });
			return;
		}

		if (req.user?.id !== id) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		// parse new name if provided
		let parsedName: UserDisplayName | undefined;

		if (name) {
			parsedName = parseUserName(req.body.name);
		}

		const updated = await prisma.user.update({
			where: { id },
			data: {
				...userData,
				firstName: parsedName?.firstName || user.firstName, // could either be given name or null
				lastName: parsedName?.lastName || user.lastName,
			},
		});

		res.json({ data: { user: updated } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

userRouter.delete("/:id", requireAuth, async (req, res) => {
	const { id } = req.params;

	try {
		const user = await prisma.user.findUnique({
			where: {
				id,
			},
		});

		if (!user) {
			res.status(404).json({ error: "User does not exist" });
			return;
		}

		if (req.user?.id !== id) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		await prisma.user.delete({
			where: {
				id,
			},
		});

		req.logOut((err) => {
			if (err) {
				console.error("Logout error:", err);
				res.status(500).json({ error: "Logout failed" });
				return;
			}
			res.sendStatus(204);
		});
	} catch (error) {
		res.status(500).json({ error: "Something went wrong" });
	}
});

userRouter.get("/:id/activities", requireAuth, async (req, res) => {
	const { id } = req.params;

	try {
		const activities = await prisma.activity.findMany({
			where: {
				userId: id,
			},
		});

		res.json({ data: { activities } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

userRouter.get("/:id/transactions", requireAuth, async (req, res) => {
	const { id } = req.params;

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				userId: id,
			},
		});

		res.json({ data: { transactions } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// Mark user as onboarded
userRouter.put("/onboarded", requireAuth, async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const updated = await prisma.user.update({
			where: { id: userId },
			data: { isOnboarded: true },
		});
		res.json({ data: { user: updated } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

export default userRouter;
