import express from "express";
import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";

const connectWhRouter = express.Router();

connectWhRouter.post(
	"/",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		const sig = req.headers["stripe-signature"];

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig as string | string[],
				config.stripe.connectSecret,
			);
		} catch (error) {
			res.status(400).send(`Webhook error: ${(error as Error).message}`);
			return;
		}

		switch (event.type) {
			case "account.updated": {
				const account = event.data.object;
				await prisma.user.update({
					where: {
						connectedAccountId: account.id,
					},
					data: {
						isConnectedToStripe: !(
							account.capabilities?.transfers === "pending" ||
							account.capabilities?.transfers === "inactive"
						),
					},
				});
				break;
			}
			default:
				console.log("Unhandled Web Event:", event);
		}

		res.sendStatus(200);
	},
);

export default connectWhRouter;
