import express from "express";
import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import config from "../../../config";

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

		res.send();
	},
);
