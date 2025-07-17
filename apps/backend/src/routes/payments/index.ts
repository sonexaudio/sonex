import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getOrCreateStripeCustomer } from "../../utils";
import type { User } from "../../generated/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import type Stripe from "stripe";
import { errorResponse, successResponse } from "../../utils/responses";

const paymentRouter = Router();

// get current user subscription
paymentRouter.get("/subscription",
	requireAuth,
	async (req, res) => {
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
	}
);

// create checkout session link to subscribe to a plan
// actions here will trigger stripe webhook
paymentRouter.post("/subscribe",
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

			// check if user already has a subscription
			const existingSubscription = await prisma.subscription.findFirst({
				where: { userId: req.user?.id, isActive: true },
			});

			if (existingSubscription) {
				res.status(400).json({ error: "User already has a subscription" });
				return;
			}

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

// create client payment intent secret for client to pay user for a project
paymentRouter.post("/client",
	async (req, res) => {
		const { projectId, clientId, userId, amount } = req.body;

		if (!projectId || !clientId || !userId || !amount) {
			res.status(400).json({ error: "Missing required fields" });
			return;
		}

		try {
			// retrive details of the project
			// clientId must be a client of the project
			// userId must be the owner of the project
			// amount must match the project's total amount
			// project must not be paid already (paymentStatus of "Paid")
			// project must have paymentStatus of "Unpaid" and not have a transaction
			// TODO: attach transaction to project (Project can have only one transaction)
			const project = await prisma.project.findUnique({
				where: {
					id: projectId,
				},
				include: {
					user: true,
					clients: {
						where: {
							id: clientId,
						}
					},
				}
			});
			if (!project) {
				errorResponse(res, 404, "Project not found");
				return;
			}

			if (project.paymentStatus === "Paid") {
				errorResponse(res, 400, "Project is already paid");
				return;
			}

			if (project.user.id !== userId) {
				errorResponse(res, 403, "User is not the project owner");
				return;
			}
			if (project.clients.length === 0 || project.clients[0].id !== clientId) {
				errorResponse(res, 403, "Client not associated with project");
				return;
			}

			if (project.amount !== amount) {
				errorResponse(res, 400, "Amount does not match project's total amount");
				return;
			}

			const amountInCents = Math.round(Number(project.amount) * 100);
			const isFreeUser = project.user.subscriptionStatus !== "subscribed";
			const applicationFee = isFreeUser ? Math.round(amountInCents * 0.05) : 0;

			// create payment intent
			const intent = await stripe.paymentIntents.create({
				amount: amountInCents,
				currency: "usd",
				application_fee_amount: applicationFee,
				transfer_data: {
					destination: project.user.connectedAccountId as string,
				},
				metadata: {
					type: "project_payment",
					clientId,
					userId,
					projectId,
					feePercent: isFreeUser ? 0.05 : 0,
				}
			});

			successResponse(res, { clientSecret: intent.client_secret }, "Payment intent created");

		} catch (error) {
			console.error("[Stripe Intent Error]", error);
			errorResponse(res, 500, "Something went wrong");
		}
	}
);

// create billing portal link
// actions here will trigger stripe webhook
paymentRouter.post("/portal",
	requireAuth,
	async (req, res) => {
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
	}
);

// initiate refund
paymentRouter.post("/refund",
	requireAuth,
	async (req, res) => {
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
	}
);

export default paymentRouter;
