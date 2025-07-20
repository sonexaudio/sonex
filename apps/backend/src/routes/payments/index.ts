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

// create checkout session link to subscribe to a plan
// actions here will trigger stripe webhook
paymentRouter.post("/subscribe", requireAuth, async (req, res) => {
	const { priceId } = req.body;
	try {
		const customerId: string = await getOrCreateStripeCustomer(
			req.user as User,
		);

		const validPrice = await stripe.prices.retrieve(priceId).catch(() => null);

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
			allow_promotion_codes: true,
			saved_payment_method_options: {
				payment_method_save: "enabled",
			}
		});

		res.json({ data: { sessionUrl: session.url } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// allow user to update their plan: upgrade and downgrade
paymentRouter.post("/change-plan", requireAuth, async (req, res) => {
	const { newPriceId } = req.body;
	const user = req.user as User;

	console.log("CHANGE PLAN REQUEST", req.body.newPriceId);

	try {
		let stripeSubscription: Stripe.Subscription;

		// Get current subscription
		const currentSubscription = await prisma.subscription.findFirst({
			where: {
				userId: user.id,
				isActive: true,
			},
		});

		console.log("CURRENT SUBSCRIPTION", currentSubscription);

		// If no current subscription, user is on free plan
		const isOnFreePlan = !currentSubscription;
		const currentPriceId = currentSubscription?.priceId || null;
		const subscriptionId = currentSubscription?.stripeSubscriptionId;
		console.log("ON FREE PLAN", isOnFreePlan);
		console.log("CURRENT PRICE ID", currentPriceId);
		console.log("SUBSCRIPTION ID", subscriptionId);

		// Validate the new price
		const newPrice = await stripe.prices.retrieve(newPriceId).catch(() => null);
		console.log("NEW PRICE DETAILS", newPrice);

		if (!newPrice) {
			return errorResponse(res, 400, "Invalid price ID");
		}


		// Determine if this is an upgrade or downgrade
		const isUpgrade = determineIsUpgrade(currentPriceId, newPriceId);

		console.log("IS UPGRADE?", isUpgrade);

		// HANDLE UPGRADE FROM FREE PLAN
		if (isOnFreePlan || !subscriptionId) {
			const customerId = await getOrCreateStripeCustomer(user);
			const subscription = await stripe.subscriptions.create({
				customer: customerId,
				items: [{ price: newPriceId }],
				expand: ["latest_invoice.payment_intent"],
				metadata: {
					userId: user.id,
					plan: newPrice.product as string,
				},
			});

			console.log("NEW SUBSCRIPTION", subscription);

			//  Return client secret for payment confirmation
			const invoice = subscription.latest_invoice as Stripe.Invoice;
			const paymentIntent = invoice.confirmation_secret?.client_secret || null;

			console.log("PAYMENT INTENT", paymentIntent);

			successResponse(res, {
				message: "Subscription created",
				subscriptionId: subscription.id,
				clientSecret: paymentIntent,
				status: subscription.status
			});

		} else if (isUpgrade) {
			// User is upgrading from existing subscription
			// Change immediately without waiting for next billing cycle
			// Charge prorated amount and pay difference immediately
			// User is upgrading from existing subscription
			if (!subscriptionId) {
				return errorResponse(res, 400, "No active subscription found");
			}

			// Get current subscription item ID
			stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
			console.log("STRIPE SUBSCRIPTION", stripeSubscription);

			const currentItemId = stripeSubscription.items.data[0].id;
			console.log("CURRENT ITEM ID", currentItemId);

			const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
				proration_behavior: "always_invoice",
				items: [
					{
						id: currentItemId,
						price: newPriceId,
						quantity: 1,
					},
				],
			});

			console.log("UPDATED STRIPE SUBSCRIPTION", updatedSubscription);

			// Update user's Subscription record
			await prisma.subscription.update({
				where: { stripeSubscriptionId: subscriptionId },
				data: {
					priceId: newPriceId,
					plan: newPrice.metadata?.planName || newPrice.product as string,
				}
			});

			// Update user immediately with new storage limit
			const storageLimit = Number(newPrice.metadata?.storageLimit) || 5369;
			console.log("NEW STORAGE LIMIT", storageLimit);
			await prisma.user.update({
				where: { id: user.id },
				data: {
					storageLimit,
					hasExceededStorageLimit: (user.storageUsed || 0) > storageLimit,
					isInGracePeriod: false,
					gracePeriodExpiresAt: null,
				},
			});

			successResponse(res, {
				message: "Subscription upgraded successfully"
			});
		} else {
			// HANDLE DOWNGRADE LOGIC
			// Create a new subscription schedule for the next billing cycle
			if (!subscriptionId) {
				return errorResponse(res, 400, "No active subscription found");
			}

			stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

			// await stripe.subscriptions.update(subscriptionId, {
			// 	proration_behavior: "none",
			// 	billing_cycle_anchor: "unchanged"
			// 	items: [
			// 		{
			// 			id: stripeSubscription.items.data[0].id,

			// 		}
			// 	]
			// })

			// Create a new subscription schedule for the next billing cycle
			const schedule = await stripe.subscriptionSchedules.create({
				from_subscription: subscriptionId
			});

			const subscriptionSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
				end_behavior: "release",
				phases: [
					{
						items: [
							{
								price: schedule.phases[0].items[0].price as string,
								quantity: 1,
							}
						],
						start_date: schedule.phases[0].start_date,
						end_date: schedule.phases[0].end_date,
					},
					{
						items: [
							{
								price: newPriceId,
								quantity: 1
							}
						]
					}
				]
			});


			// Update the user's subscription record
			await prisma.subscription.update({
				where: { stripeSubscriptionId: subscriptionId },
				data: {
					pendingDowngradeTo: newPriceId,
					pendingDowngradeAt: new Date(stripeSubscription.items.data[0].current_period_end * 1000),
				}
			});

			successResponse(res, { effectiveDate: new Date(stripeSubscription.items.data[0].current_period_end * 1000), scheduleId: schedule.id }, "Subscription downgrade scheduled for next billing cycle");
		}
	} catch (error) {
		console.error("Error changing plan:", error);
		errorResponse(res, 500, "Failed to change subscription plan");
	}
});
// create client payment intent secret for client to pay user for a project
paymentRouter.post("/client", async (req, res) => {
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
					},
				},
			},
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
			},
		});

		successResponse(
			res,
			{ clientSecret: intent.client_secret },
			"Payment intent created",
		);
	} catch (error) {
		console.error("[Stripe Intent Error]", error);
		errorResponse(res, 500, "Something went wrong");
	}
});

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

function determineIsUpgrade(currentPriceId: string | null, newPriceId: string) {
	if (currentPriceId === null) return true;

	// Define plan hierarchy - higher numbers = higher tier
	const planRank: Record<string, number> = {
		[process.env.STRIPE_PRICE_SONEXPERIENCE_MONTHLY || ""]: 1,
		[process.env.STRIPE_PRICE_SONEXPERIENCE_YEARLY || ""]: 1,
		[process.env.STRIPE_PRICE_SONEXPLORER_MONTHLY || ""]: 2,
		[process.env.STRIPE_PRICE_SONEXPLORER_YEARLY || ""]: 2,
		[process.env.STRIPE_PRICE_SONEXECUTIVE_MONTHLY || ""]: 3,
		[process.env.STRIPE_PRICE_SONEXECUTIVE_YEARLY || ""]: 3,
	};

	const currentRank = planRank[currentPriceId] || 0;
	const newRank = planRank[newPriceId] || 0;
	return newRank > currentRank;
}
