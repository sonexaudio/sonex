import express from "express";
import { stripe } from "../../../lib/stripe";
import type Stripe from "stripe";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";

const stripeWhRouter = express.Router();

stripeWhRouter.post(
	"/",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		const sig = req.headers["stripe-signature"];

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig as string | string[],
				config.stripe.webhookSecret,
			);
		} catch (error) {
			res.status(400).send(`Webhook error: ${(error as Error).message}`);
			return;
		}

		switch (event.type) {
			case "invoice.paid": {
				const invoice = event.data.object as Stripe.Invoice;

				const subscription = await stripe.subscriptions.retrieve(
					invoice.parent?.subscription_details?.subscription as string,
				);

				const periodStart = subscription.items.data[0]?.current_period_start;
				const periodEnd = subscription.items.data[0]?.current_period_end;
				const cancelAtPeriodEnd = subscription.cancel_at_period_end;

				// Who is the user?
				// Add current subscription to that user
				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: invoice.customer as string,
					},
				});
				// Add subscription to database
				const newSubscription = await prisma.subscription.create({
					data: {
						userId: user?.id as string,
						stripeSubscriptionId: subscription.id,
						plan: subscription.items.data[0].plan.id as string,
						startDate: new Date(periodStart * 1000),
						endDate: new Date(periodEnd * 1000),
						cancelAtPeriodEnd,
					},
				});
				// Create new transaction
				const transaction = await prisma.transaction.create({
					data: {
						userId: user?.id as string,
						type: "Subscription",
						amount: invoice.amount_paid / 100,
						subscriptionId: newSubscription.id,
					},
				});
				// add new activity
				await prisma.activity.create({
					data: {
						userId: user?.id as string,
						action: "Subscription payment",
						targetType: "subscription",
						targetId: transaction.id,
						metadata: {
							amount: invoice.amount_paid / 100,
							currency: invoice.currency,
							invoiceId: invoice.id,
							subscriptionId: subscription?.id,
							plan: subscription?.items.data[0]?.plan.id,
						},
					},
				});
				// Email user the receipt
				break;
			}

			case "charge.failed": {
				const charge = event.data.object as Stripe.Charge;
				console.warn("Subscription payment failed:", {
					chargeId: charge.id,
					amount: charge.amount / 100,
					customer: charge.customer,
					reason: charge.failure_message,
				});
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;

				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: subscription.customer as string,
					},
				});

				const periodEnd = subscription.items.data[0]?.current_period_end;
				const cancelAtPeriodEnd = subscription.cancel_at_period_end;

				await prisma.subscription.updateMany({
					where: { stripeSubscriptionId: subscription.id },
					data: {
						cancelAtPeriodEnd: cancelAtPeriodEnd,
						endDate: new Date(periodEnd * 1000),
					},
				});

				await prisma.activity.create({
					data: {
						action: "Subscription updated",
						targetType: "payment",
						targetId: subscription.id,
						userId: user?.id as string,
					},
				});

				console.log("Subscription updated:", subscription.id);
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge;

				const user = await prisma.user.findFirst({
					where: { stripeCustomerId: charge.customer as string },
				});

				if (user) {
					await prisma.transaction.create({
						data: {
							userId: user.id,
							type: "Refund",
							amount: -(charge.amount_refunded / 100),
							stripeChargeId: charge.id,
						},
					});

					await prisma.activity.create({
						data: {
							userId: user.id,
							action: "Subscription refund",
							targetType: "payment",
							targetId: charge.id,
							metadata: {
								amount: -(charge.amount_refunded / 100),
								currency: charge.currency,
								reason: charge.outcome?.reason,
							},
						},
					});
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);

				res.send();
		}
	},
);

export default stripeWhRouter;
