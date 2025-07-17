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

				const subscription = await stripe.subscriptions.retrieve(
					invoice.parent?.subscription_details?.subscription as string,
				);

				const periodStart = subscription.items.data[0]?.current_period_start;
				const periodEnd = subscription.items.data[0]?.current_period_end;
				const cancelAtPeriodEnd = subscription.cancel_at_period_end;

				// Needed: subscription's limit. I will have to add this to the Stripe product metadata in order to retrieve it.
				// const limit = subscription.items.data[0].plan.metadata.limit;

				// Who is the user?
				// Add current subscription to that user
				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: invoice.customer as string,
					},
				});

				// Find existing subscriptions for user that are active and outside of current start and end date relative to current date
				// If any are found, cancel them recursively
				await prisma.subscription.updateMany({
					where: {
						userId: user?.id as string,
						isActive: true,
						startDate: {
							lte: new Date(periodStart * 1000),
						},
						endDate: {
							gte: new Date(periodEnd * 1000)
						}
					},
					data: {
						isActive: false,
					}
				});

				// Update user information
				// storageLimit should be set to the subscription's limit
				// isFounderMember should be set or kept to true if the user is a founder member.
				// If this is a new subscription, isFounderMember should be determined somehow by checking how many founder member discounts was provided in stripe. Should only be given to first 500 users for life (even if they cancel and re-subscribe), but I don't know how to do this.
				// If this is a renewal or reactivation, isFounderMember should be kept to true if it was true before.
				const STORAGE_LIMIT = Number(invoice.metadata?.storageLimit);
				const storageUsed = user?.storageUsed || 0;
				const hasExceededStorageLimit = storageUsed > STORAGE_LIMIT;

				await prisma.user.update({
					where: {
						id: user?.id as string
					},
					data: {
						subscriptionStatus: "subscribed",
						isInGracePeriod: false,
						gracePeriodExpiresAt: null,
						storageLimit: STORAGE_LIMIT,
						hasExceededStorageLimit,
					}
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
				// Email user the receipt
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
				await prisma.subscription.update({
					where: {
						stripeSubscriptionId: subscription.id
					},
					data: {
						isActive: false,
					}
				});

				// I need to check if after cancellation, the user has exceeded their storage limit after resetting the storage limit back to 5GB.
				// If they have, will need to establish grace period 21 days from current date for time to pay or remove files before cancelling the account.

				const user = await prisma.user.findUnique({
					where: {
						stripeCustomerId: subscription.customer as string
					}
				});

				const STORAGE_LIMIT = 5369;
				const storageUsed = user?.storageUsed || 0;
				const hasExceededStorageLimit = storageUsed > STORAGE_LIMIT;
				const gracePeriodExpiresAt = hasExceededStorageLimit ? new Date(Date.now() * 21 * 24 * 60 * 60 * 1000) : null; // 21 days from now or null if they haven't exceeded the limit

				await prisma.user.update({
					where: {
						id: subscription.customer as string,
					},
					data: {
						subscriptionStatus: "free",
						storageLimit: STORAGE_LIMIT,
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
						plan: subscription.items.data[0].plan.id,
						reason: subscription.cancellation_details?.reason,
					}
				});

				// TODO: Send email regarding subscription cancellation and storage limit reset to 5GB. If they have exceeded the limit, they will have 21 days to pay or remove files before their account is cancelled.

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

				// Did the user just only update their payment method?
				if (changes?.default_payment_method !== undefined) {
					// TODO: Send email of payment method update confirmation
				}

				// Does the user want to cancel or resume their subscription?
				// Either cancel or resume, we'll only need to update the subscription information
				if (changes?.cancel_at_period_end !== undefined) {
					const cancelAtPeriodEnd = subscription.cancel_at_period_end;
					await prisma.subscription.update({
						where: {
							stripeSubscriptionId: subscription.id
						},
						data: {
							cancelAtPeriodEnd,
						}
					});

					await logActivity({
						userId: user?.id as string,
						action: cancelAtPeriodEnd ? "Subscription cancelled" : "Subscription resumed",
						targetType: "subscription",
						targetId: subscription.id,
					});

					// TODO: Send email regarding subscription cancellation or resumption
				}


				// Did the user upgrade or downgrade subscription?
				// If downgrade, the effect should take place at the end of the current period, not immediately.
				if (changes?.items !== undefined) {
					const previousPlanAmount = changes.items.data?.[0]?.price?.unit_amount;
					const currentPlanAmount = subscription.items.data?.[0]?.price?.unit_amount;

					const isUpgrade = previousPlanAmount && currentPlanAmount && previousPlanAmount < currentPlanAmount;
					const isDowngrade = previousPlanAmount && currentPlanAmount && previousPlanAmount > currentPlanAmount;

					// metadata for plan
					const plan = subscription.items.data[0].plan.id;
					const storageLimit = Number(subscription.items.data[0].metadata.storageLimit);
					const startDate = new Date(subscription.items.data[0].current_period_start * 1000);
					const endDate = new Date(subscription.items.data[0].current_period_end * 1000);
					const cancelAtPeriodEnd = subscription.cancel_at_period_end;
					const storageUsed = user?.storageUsed || 0;
					const hasExceededStorageLimit = storageUsed > storageLimit;
					const gracePeriodExpiresAt = hasExceededStorageLimit ? new Date(Date.now() * 21 * 24 * 60 * 60 * 1000) : null; // 21 days from now or null if they haven't exceeded the limit

					// If upgrade, the user will have paid the difference and immediately be upgraded.
					if (isUpgrade) {
						await prisma.user.update({
							where: {
								id: user?.id as string,
							},
							data: {
								storageLimit,
								hasExceededStorageLimit,
								gracePeriodExpiresAt,
								isInGracePeriod: hasExceededStorageLimit,
							}
						});
						await prisma.subscription.upsert({
							where: {
								stripeSubscriptionId: subscription.id
							},
							update: {
								plan,
								startDate,
								endDate,
								cancelAtPeriodEnd,
							},
							create: {
								userId: user?.id as string,
								stripeSubscriptionId: subscription.id,
								plan,
								startDate,
								endDate,
								cancelAtPeriodEnd,
							}
						});

						// Create transaction
						await prisma.transaction.create({
							data: {
								userId: user?.id as string,
								type: "Subscription upgrade",
								amount: currentPlanAmount - previousPlanAmount,
								subscriptionId: subscription.id,
							}
						});

						await logActivity({
							userId: user?.id as string,
							action: "Subscription upgraded",
							targetType: "subscription",
						});

						// TODO: Send email regarding subscription upgrade
					} else if (isDowngrade) {
						// Just want to confirm the user is downgrading
						// but I want to have a way to tell the user via UI that they are downgrading
						// and that they will be downgraded at the end of the current period
						// and that they will have 21 days to pay or remove files before their account is cancelled if the downgrade exceeds the storage limit.
						// and that they will have to pay the difference.
						// Im relying on invoice.paid to handle changes in storage limit and things when current period ends.

						await logActivity({
							userId: user?.id as string,
							action: "Subscription downgraded",
							targetType: "subscription",
							targetId: subscription.id,
							metadata: {
								plan: subscription.items.data[0].plan.id,
							}
						});

						// TODO: Send email regarding subscription downgraded
						// TODO: Setup a flag for pending downgrades in subscription table
					}
				}
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
								id: clientId as string,
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
