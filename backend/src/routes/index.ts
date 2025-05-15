import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import paymentRoutes from "./payments";
import accountRoutes from "./accounts";
import stripeWebhook from "./webhooks/stripe";
import stripeConnectWebhook from "./webhooks/stripe-connect";
import { checkUserStillExists } from "../middleware/auth";

const router = express.Router();

router.use("/webhooks/stripe", stripeWebhook);
router.use("/webhooks/stripe-connect", stripeConnectWebhook);

router.use(express.json());
router.use(checkUserStillExists);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/accounts", accountRoutes);

router.get("/health", (_, res) => {
	res.sendStatus(200);
});

export default router;
