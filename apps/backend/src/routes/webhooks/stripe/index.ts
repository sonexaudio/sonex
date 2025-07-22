import express from "express";
import { stripe } from "../../../lib/stripe";
import type Stripe from "stripe";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";
import { logActivity } from "../../../utils/activity-logging";
import logger from "../../../utils/logger";

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

				if (!invoice.parent?.subscription_details?.subscription) {
					console.warn("Invoice is not associated with a subscription", {
						invoiceId: invoice.id,
						invoiceStatus: invoice.status,
						invoiceCustomer: invoice.customer,
						invoiceMetadata: invoice.metadata,
					});
					break;
				}

				//  Find the subscription that the invoice is associated with
				const subscription = await stripe.subscriptions.retrieve(
					invoice.parent?.subscription_details?.subscription as string,
				);

				// Who is the user?
				// Add current subscription to that user
				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: invoice.customer as string,
					},
				});

				if (!user) {
					console.warn("User not found", {
						invoiceId: invoice.id,
						invoiceStatus: invoice.status,
						invoiceCustomer: invoice.customer,
					});
					break;
				}

				//  Get subscription details
				const priceId = subscription.items.data[0].plan.id;
				const plan = subscription.items.data[0].plan.metadata?.planName;
				const interval = subscription.items.data[0].plan.metadata?.planInterval;
				const periodStart = subscription.items.data[0]?.current_period_start;
				const periodEnd = subscription.items.data[0]?.current_period_end;
				const cancelAtPeriodEnd = subscription.cancel_at_period_end;
				const storageLimit = Number(subscription.items.data[0].price.metadata?.storageLimit) || 5369;
				const storageUsed = user.storageUsed || 0;
				const hasExceededStorageLimit = storageUsed > storageLimit;

				// Create or update subscription record
				const subscriptionRecord = await prisma.subscription.upsert({
					where: {
						stripeSubscriptionId: subscription.id,
					},
					update: {
						isActive: true,
						startDate: new Date(periodStart * 1000),
						endDate: new Date(periodEnd * 1000),
						cancelAtPeriodEnd,
						priceId,
						plan
					},
					create: {
						userId: user.id,
						stripeSubscriptionId: subscription.id,
						plan: plan as string,
						priceId,
						interval,
						startDate: new Date(periodStart * 1000),
						endDate: new Date(periodEnd * 1000),
						cancelAtPeriodEnd,
						isActive: true,
					}
				});

				// Update user
				// TODO: isFounderMember should be set or kept to true if the user is a founder member.
				// If this is a new subscription, isFounderMember should be determined somehow by checking how many founder member discounts was provided in stripe. Should only be given to first 500 users for life (even if they cancel and re-subscribe), but I don't know how to do this.
				// If this is a renewal or reactivation, isFounderMember should be kept to true if it was true before.
				await prisma.user.update({
					where: {
						id: user?.id as string
					},
					data: {
						subscriptionStatus: "subscribed",
						isInGracePeriod: false,
						gracePeriodExpiresAt: null,
						storageLimit: storageLimit,
						hasExceededStorageLimit,
					}
				});

				// Create new transaction
				const transaction = await prisma.transaction.create({
					data: {
						userId: user?.id as string,
						type: "Subscription",
						amount: invoice.amount_paid / 100,
						subscriptionId: subscriptionRecord.id,
					},
				});

				// add new activity
				await logActivity({
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
					}
				});
				// TODO: Email user the receipt
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const subscription = await stripe.subscriptions.retrieve(
					invoice.parent?.subscription_details?.subscription as string,
				);

				const user = await prisma.user.findUnique({
					where: { stripeCustomerId: invoice.customer as string }
				});

				const isFirstTimeFailure = invoice.billing_reason === "subscription_create";

				if (isFirstTimeFailure) {
					await logActivity({
						userId: user?.id as string,
						action: "Subscription payment failed",
						targetType: "subscription",
						targetId: invoice.id,
					});

					// TODO: Send email regarding failed payment attempt
					break;
				}
				// If this is a retry attempt, we need to update the user and subscription information
				// Because stripe will retry before cancelling, we only need to update the user information to be past due
				await prisma.user.update({
					where: {
						id: user?.id as string
					},
					data: {
						subscriptionStatus: "past_due",
					}
				});

				await logActivity({
					userId: user?.id as string,
					action: "Subscription renewal payment failed",
					targetType: "subscription",
					targetId: invoice.id,
				});

				// TODO: Send email regarding failed payment attempt and subscription is now past due and will be cancelled witing a few more attempts.

				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;

				// Mark subscription as inactive
				await prisma.subscription.update({
					where: {
						stripeSubscriptionId: subscription.id
					},
					data: {
						isActive: false,
					}
				});

				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: subscription.customer as string
					}
				});

				//  Reset user to free plan
				const STORAGE_LIMIT = 5369; // Free plan limit
				const storageUsed = user?.storageUsed || 0;
				const hasExceededStorageLimit = storageUsed > STORAGE_LIMIT;
				const gracePeriodExpiresAt = hasExceededStorageLimit
					? new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
					: null;

				await prisma.user.update({
					where: { id: user?.id as string },
					data: {
						subscriptionStatus: "free",
						storageLimit: STORAGE_LIMIT,
						hasExceededStorageLimit,
						gracePeriodExpiresAt,
						isInGracePeriod: hasExceededStorageLimit,
					}
				});

				await logActivity({
					userId: user?.id as string,
					action: "Subscription cancelled",
					targetType: "subscription",
					targetId: subscription.id,
					metadata: {
						reason: subscription.cancellation_details?.reason,
					}
				});

				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const changes = event.data.previous_attributes;

				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: subscription.customer as string,
					},
				});

				// Handle cancellation or resumption of subscription
				if (changes?.cancel_at_period_end !== undefined) {
					const cancelAtPeriodEnd = subscription.cancel_at_period_end;
					await prisma.subscription.update({
						where: {
							stripeSubscriptionId: subscription.id
						},
						data: { cancelAtPeriodEnd }
					});

					await logActivity({
						userId: user?.id as string,
						action: cancelAtPeriodEnd ? "Subscription cancelled" : "Subscription resumed",
						targetType: "subscription",
						targetId: subscription.id,
					});

					// TODO: Send email regarding subscription cancellation or resumption
				}

				// Handle subscription plan change
				if (changes?.items !== undefined && !subscription.pending_update) {
					// Plan details
					const currentPrice = subscription.items.data[0].price;
					const plan = subscription.items.data[0].plan.id;
					const storageLimit = Number(subscription.items.data[0].price.metadata?.storageLimit) || 5369;
					const startDate = new Date(subscription.items.data[0].current_period_start * 1000);
					const endDate = new Date(subscription.items.data[0].current_period_end * 1000);
					const cancelAtPeriodEnd = subscription.cancel_at_period_end;
					const storageUsed = user?.storageUsed || 0;
					const hasExceededStorageLimit = storageUsed > storageLimit;

					const gracePeriodExpiresAt = hasExceededStorageLimit ? new Date(subscription.items.data[0].current_period_end * 1000 + 21 * 24 * 60 * 60 * 1000) : null; // 21 days from the end of the current period or null if they haven't exceeded the limit


					// Update subscription record
					await prisma.subscription.update({
						where: { stripeSubscriptionId: subscription.id },
						data: {
							priceId: currentPrice.id,
							plan,
							startDate,
							endDate,
							cancelAtPeriodEnd
						}
					});

					// Update user storage limit
					await prisma.user.update({
						where: { id: user?.id as string },
						data: {
							storageLimit,
							hasExceededStorageLimit,
							isInGracePeriod: hasExceededStorageLimit,
							gracePeriodExpiresAt,
						}
					});

					await logActivity({
						userId: user?.id as string,
						action: "Subscription plan changed",
						targetType: "subscription",
						targetId: subscription.id,
						metadata: {
							new_plan: currentPrice.id,
							storage_limit: storageLimit,
						}
					});

				}
				break;
			}

			// Events for subscription schedule change. Should be triggered when user changes their billing cycle to monthly or yearly or downgrade.
			case "subscription_schedule.created": {
				const schedule = event.data.object as Stripe.SubscriptionSchedule;

				const subscription = await stripe.subscriptions.retrieve(schedule.subscription as string);

				console.log("NEW SUBSCRIPTION SCHEDULE", schedule);
				console.log("SUBSCRIPTION", subscription);

				break;
			}

			case "subscription_schedule.released": {
				const schedule = event.data.object as Stripe.SubscriptionSchedule;

				const subscription = await stripe.subscriptions.retrieve(schedule.subscription as string);

				console.log("NEW SUBSCRIPTION SCHEDULE", schedule);
				console.log("SUBSCRIPTION", subscription);

				// This event is triggered when a scheduled downgrade takes effect

				// The actual subscription update will be handled by customer.subscription.updated
				await logActivity({
					userId: subscription.metadata?.userId as string,
					action: "Scheduled subscription change completed",
					targetType: "subscription",
					targetId: schedule.subscription as string,
				});

				break;
			}

			// Events for clients paying users
			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				// This route is ONLY for clients paying users for the projects.
				// Exit out if the payment intent is not for a project
				if (paymentIntent.metadata?.type !== "project_payment") {
					console.warn("Payment intent is not for project payment", {
						type: paymentIntent.metadata?.type,
						paymentIntentId: paymentIntent.id,
						paymentIntentStatus: paymentIntent.status,
						paymentIntentAmount: paymentIntent.amount / 100,
						paymentIntentCurrency: paymentIntent.currency,
						paymentIntentCustomer: paymentIntent.customer,
						paymentIntentMetadata: paymentIntent.metadata,
					});
					break;
				}
				// Get intent metadata
				const { clientId, projectId, feePercent } = paymentIntent.metadata;
				const amount = paymentIntent.amount / 100;

				// Get client, user, and project
				const project = await prisma.project.findUnique({
					where: {
						id: projectId as string,
					},
					include: {
						user: true,
						clients: {
							where: {
								clientId: clientId as string,
							}
						}
					}
				});

				// Update project's payment status to paid
				// For future reference, this will prevent the user from being able to manually update the payment status.
				// TODO: Add a 'paidViaStripe' flag to the project table. This prevents the above concern.
				await prisma.project.update({
					where: {
						id: projectId as string,
					},
					data: {
						paymentStatus: "Paid",
					}
				});

				// Mark all files in project as downloadable
				// This allows the client to now download the files
				await prisma.file.updateMany({
					where: {
						projectId: projectId as string,
					},
					data: {
						isDownloadable: true
					}
				});
				// Create transaction
				await prisma.transaction.create({
					data: {
						userId: project?.user.id as string,
						type: "Project payment",
						amount,
					}
				});

				await logActivity({
					userId: project?.user.id as string,
					action: "Project payment",
					targetType: "project",
					targetId: project?.id as string,
					metadata: {
						amount,
						applicationFeeApplied: Number(feePercent) > 0,
						clientId,
					}
				});

				// TODO: Send email to client.email and user.email regarding project payment
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				// This route is ONLY for clients paying users for the projects.
				// Exit out if the payment intent is not for a project
				if (paymentIntent.metadata?.type !== "project_payment") {
					console.warn("Payment intent is not for project payment", {
						type: paymentIntent.metadata?.type,
					});
					break;
				}

				// TODO: Send email to client.email only regarding project payment failure
				// In this case, I only want to use logger to log the failure and not to user's account or in database.
				logger.error("Project payment failed", {
					paymentIntentId: paymentIntent.id,
					paymentIntentStatus: paymentIntent.status,
					paymentIntentAmount: paymentIntent.amount / 100,
					paymentIntentCurrency: paymentIntent.currency,
					paymentIntentCustomer: paymentIntent.customer,
					paymentIntentMetadata: paymentIntent.metadata,
				});

				break;

			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
				break;
		}

		res.send();
		return;
	},
);

export default stripeWhRouter;
