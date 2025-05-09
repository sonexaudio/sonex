import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { stripe } from "../../lib/stripe";
import { getOrCreateStripeCustomer } from "../../utils";
import type { User } from "../../generated/prisma";
import config from "../../config";

const accountRouter = Router();

accountRouter.get("/info", requireAuth, async (req, res) => {
	if (!req.user?.stripeAccountId) {
		res.status(400).json({ error: "User does not have account" });
		return;
	}

	try {
		const account = await stripe.accounts.retrieve(req.user.stripeAccountId);
		if (!account) {
			res.status(404).json({ error: "Could not find account" });
			return;
		}

		if (account.id !== req.user.stripeAccountId) {
			res.status(403).json({ error: "Forbidden" });
		}

		res.json({
			data: {
				accountData: {
					email: account.email,
					requestDate: new Date().toISOString(),
					profile: account.business_profile,
					metadata: account.metadata,
				},
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: "Something went wrong" });
	}
});

accountRouter.post("/account", requireAuth, async (req, res) => {
	try {
		const accountId = await getOrCreateStripeCustomer(req.user as User);
		res.json({ data: accountId });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// account onboarding link
// TODO: add isOnboarded flag to make sure users don't repeat onboarding
accountRouter.post("/onboarding", requireAuth, async (req, res) => {
	if (!req.user?.stripeAccountId) {
		res.status(400).json({ error: "User does not have stripe account" });
		return;
	}

	const account: string = req.user.stripeAccountId;

	const accountLink = await stripe.accountLinks.create({
		account,
		type: "account_onboarding",
		refresh_url: `${config.frontendUrl}/return/${account}`,
		return_url: `${config.frontendUrl}/return/${account}`,
	});

	res.json({ data: accountLink });
});
