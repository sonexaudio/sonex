import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import paymentRoutes from "./payments";
import accountRoutes from "./accounts";
import projectRoutes from "./projects";
import fileRoutes from "./files";
import clientRoutes from "./clients";
import stripeWebhook from "./webhooks/stripe";
import stripeConnectWebhook from "./webhooks/stripe-connect";
import { checkUserStillExists } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";

const router = express.Router();

router.use("/webhooks/stripe", stripeWebhook);
router.use("/webhooks/stripe-connect", stripeConnectWebhook);

router.use(express.json());
router.use(checkUserStillExists);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/accounts", accountRoutes);
router.use("/projects", projectRoutes);
router.use("/files", fileRoutes);
router.use("/clients", clientRoutes);

router.get("/health", (_, res) => {
	res.sendStatus(200);
});

router.use(errorHandler);

export default router;
