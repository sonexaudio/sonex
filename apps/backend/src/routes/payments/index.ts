import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getOrCreateStripeCustomer } from "../../utils";
import type { User } from "../../generated/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import type Stripe from "stripe";

const paymentRouter = Router();

// get current user subscription
paymentRouter.get("/subscription", requireAuth, async (req, res) => {
	if (!req.user?.stripeCustomerId) {
		res.status(400).json({ error: "User does not have subscription" });
		return;
	}

	const subscription = await prisma.subscription.findFirst({
		where: {
			userId: req.user?.id,
			isActive: true,
			endDate: {
				gte: new Date(),
			},
		},
	});

	res.json({ data: { subscription } });
});

// create checkout session link
// actions here will trigger stripe webhook
paymentRouter.post(
	"/create-checkout-session",
	requireAuth,
	async (req, res) => {
		const { priceId } = req.body;
		try {
			const customerId: string = await getOrCreateStripeCustomer(
				req.user as User,
			);

			const validPrice = await stripe.prices
				.retrieve(priceId)
				.catch(() => null);

			if (!validPrice) {
				res.status(400).json({ error: "Invalid or missing price" });
				return;
			}

			// TODO do a check to make sure user doesn't already have a subscription

			const session = await stripe.checkout.sessions.create({
				customer: customerId,
				mode: "subscription",
				line_items: [
					{
						price: priceId,
						quantity: 1,
					},
				],
				success_url: `${config.frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${config.frontendUrl}/payments/cancel`,

				metadata: {
					userId: req.user?.id as string,
				},

				subscription_data: {
					metadata: {
						userId: req.user?.id as string,
						plan: validPrice.product as string,
					},
				},
			});

			res.json({ data: { sessionUrl: session.url } });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Something went wrong" });
		}
	},
);

// create billing portal link
// actions here will trigger stripe webhook
paymentRouter.post("/portal", requireAuth, async (req, res) => {
	if (!req.user?.stripeCustomerId) {
		res.status(400).json({
			error: "User does not exist or is not yet an active Sonex User",
		});
		return;
	}

	try {
		const session = await stripe.billingPortal.sessions.create({
			customer: req.user?.stripeCustomerId as string,
			return_url: `${config.frontendUrl}/account`,
		});

		res.json({ data: { portalUrl: session.url } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// initiate refund
paymentRouter.post("/refund", requireAuth, async (req, res) => {
	if (!req.user?.stripeCustomerId) {
		res.status(400).json({ error: "User has no current subscription" });
		return;
	}

	const { chargeId } = req.body;

	if (!chargeId) {
		res.status(400).json({ error: "Charge id is required" });
		return;
	}

	try {
		// Lookup and Ownership
		const tx = await prisma.transaction.findFirst({
			where: { stripeChargeId: chargeId },
		});

		if (!tx) {
			res.status(404).json({ error: "Transaction not found" });
			return;
		}

		if (tx.userId !== req.user?.id) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		// charge verification
		let charge: Stripe.Charge;
		try {
			charge = await stripe.charges.retrieve(chargeId);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Invalid charge ID" });
			return;
		}

		if (Date.now() / 1000 - charge.created > 45 * 24 * 60 * 60) {
			res.status(400).json({ error: "Refund window expired" });
			return;
		}

		const refund = await stripe.refunds.create(
			{
				charge: chargeId,
				reason: "requested_by_customer",
				customer: req.user?.stripeCustomerId,
				metadata: {
					userId: tx.userId,
				},
			},
			{ idempotencyKey: `${req.user?.id}-${chargeId}` },
		);

		res.json({ data: { refundId: refund.id, receipt: refund.receipt_number } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

export default paymentRouter;
