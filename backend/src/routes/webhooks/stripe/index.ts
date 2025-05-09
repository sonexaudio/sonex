import express from "express";
import { stripe } from "../../../lib/stripe";
import type Stripe from "stripe";
import config from "../../../config";

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
			case "checkout.session.completed": {
				const session = event.data.object;
				console.log("Checkout session completed. New subscription:", session);
				break;
			}
			case "invoice.paid": {
				const invoice = event.data.object;
				console.log("Subscription renewed. Details", invoice);
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object;
				console.log("Subscription payment failed", invoice);
				break;
			}

			case "customer.subscription.updated": {
				const session = event.data.object;
				console.log("Customer subscription updated. Details", session);
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object;
				console.log("Refund sucessfully processed. Details", charge);
				break;
			}

			default:
				console.log(`Unhandled Event: ${event.type}`);
		}

		res.send();
	},
);
