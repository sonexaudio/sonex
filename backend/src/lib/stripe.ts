import Stripe from "stripe";
import config from "../config";

const { stripe: stripeConfig } = config;

export const stripe = new Stripe(stripeConfig.secretKey, {
	apiVersion: "2025-04-30.basil",
	typescript: true,
});
