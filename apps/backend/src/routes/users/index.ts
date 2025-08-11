import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { parseUserName, type UserDisplayName } from "../../utils";
import { sendSuccessResponse } from "../../utils/responses";
import {
	findActivitiesByUserId,
	findSubscriptionByUserInfo,
	findTransactionsByUserId,
	findUserById,
} from "../../services/db.service";
import { ForbiddenError, NotFoundError } from "../../errors";
import { deleteUserById, getFullUserInfo, updateUserById } from "../../services/user.service";

const userRouter = Router();

userRouter.get("/current", requireAuth, async (req, res, next) => {
	const userId = req.user?.id;
	try {
		const user = await getFullUserInfo(userId);

		if (!user) {
			throw new NotFoundError(`User with ID ${userId} not found`);
		}
		sendSuccessResponse(res, { user });
	} catch (error) {
		next(error);
	}
})

userRouter.get("/:id/subscription-status", async (req, res, next) => {
	const { id } = req.params;
	try {
		const subscription = await findSubscriptionByUserInfo(id);

		// Even if the user doesn't have an active subscription, they might still be considered "active"
		const user = await findUserById(id);

		const hasActiveSubscription = !!subscription;
		const isActive =
			hasActiveSubscription ||
			user?.subscriptionStatus === "free" ||
			user?.isActive ||
			!user?.hasExceededStorageLimit ||
			user?.subscriptionStatus !== "past_due" ||
			!user?.isInGracePeriod;

		sendSuccessResponse(res, { isActive });
	} catch (error) {
		next(error);
	}
});

userRouter.put("/:id", requireAuth, async (req, res, next) => {
	const { id } = req.params;
	const { name, ...userData } = req.body;
	const currentUserId = req.user?.id;

	try {
		// parse new name if provided
		let parsedName: UserDisplayName | undefined;

		if (name) {
			parsedName = parseUserName(req.body.name);
		}

		const updatedUser = await updateUserById(
			id,
			{
				...userData,
				firstName: parsedName?.firstName, // could either be given name or null
				lastName: parsedName?.lastName || null, // lastName can be undefined
			},
			currentUserId,
		);

		sendSuccessResponse(res, { user: updatedUser });
	} catch (error) {
		next(error);
	}
});

userRouter.delete("/:id", requireAuth, async (req, res, next) => {
	const { id } = req.params;
	const currentUserId = req.user?.id;

	try {
		const user = await findUserById(id);

		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		await deleteUserById(id, currentUserId);
	} catch (error) {
		next(error);
	}
});

userRouter.get("/:id/activities", requireAuth, async (req, res, next) => {
	const { id } = req.params;
	const currentUserId = req.user?.id;

	if (currentUserId !== id) {
		throw new ForbiddenError("You do not have permission to access this user's activities");
	}

	try {
		const activities = await findActivitiesByUserId(id);
		sendSuccessResponse(res, { activities });
		res.json({ data: { activities } });
	} catch (error) {
		console.error(error);
		next(error);
	}
});

userRouter.get("/:id/transactions", requireAuth, async (req, res, next) => {
	const { id } = req.params;
	const currentUserId = req.user?.id;

	if (currentUserId !== id) {
		throw new ForbiddenError("You do not have permission to access this user's transactions");
	}

	try {
		const transactions = await findTransactionsByUserId(id);
		sendSuccessResponse(res, { transactions });
	} catch (error) {
		console.error(error);
		next(error);
	}
});

// Mark user as onboarded
userRouter.put("/onboarded", requireAuth, async (req, res, next) => {
	const userId = req.user?.id;
	try {
		const updated = await updateUserById(userId!, { isOnboarded: true });
		sendSuccessResponse(res, { user: updated });
	} catch (error) {
		next(error);
	}
});

export default userRouter;
