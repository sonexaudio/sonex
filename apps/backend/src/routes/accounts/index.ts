import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { stripe } from "../../lib/stripe";
import { getOrCreateStripeAccount } from "../../utils";
import type { User } from "../../generated/prisma";
import config from "../../config";
import { ForbiddenError, NotFoundError } from "../../errors";
import { sendSuccessResponse } from "../../utils/responses";

const accountRouter = Router();

accountRouter.get("/info", requireAuth, async (req, res, next) => {
	if (!req.user?.connectedAccountId) {
		res.status(400).json({ error: "User does not have account" });
		return;
	}

	try {
		const account = await stripe.accounts.retrieve(req.user.connectedAccountId);

		if (!account) {
			throw new NotFoundError("Could not find account");
		}

		if (account.id !== req.user.connectedAccountId) {
			throw new ForbiddenError("You do not have access to this account");
		}

		sendSuccessResponse(res, {
			accountData: {
				email: account.email,
				requestDate: new Date().toISOString(),
				profile: account.business_profile,
				metadata: account.metadata,
			},
		});
	} catch (error) {
		next(error);
	}
});

accountRouter.post("/account", requireAuth, async (req, res, next) => {
	const user = req.user as User;
	try {
		const accountId = await getOrCreateStripeAccount(user);
		sendSuccessResponse(res, { accountId });
	} catch (error) {
		next(error);
	}
});

// account onboarding link
accountRouter.post("/onboarding", requireAuth, async (req, res, next) => {
	const user = req.user as User;
	try {
		if (!user?.connectedAccountId) {
			throw new NotFoundError("User does not have connected account");
		}

		if (user?.isOnboarded) {
			sendSuccessResponse(res, { message: "User already onboarded" });
			return;
		}

		const account: string = user.connectedAccountId;

		const accountLink = await stripe.accountLinks.create({
			account,
			type: "account_onboarding",
			refresh_url: `${config.frontendUrl}/return/${account}`,
			return_url: `${config.frontendUrl}/return/${account}`,
		});

		sendSuccessResponse(res, { accountLink: accountLink.url });
	} catch (error) {
		next(error);
	}
});

export default accountRouter;
