import express from "express";
import authRoutes from "./auth";
import clientAuthRoutes from "./auth/client";
import userRoutes from "./users";
import paymentRoutes from "./payments";
import accountRoutes from "./accounts";
import projectRoutes from "./projects";
import fileRoutes from "./files";
import folderRoutes from "./folders";
import clientRoutes from "./clients";
import commentRoutes from "./comments";
import transactionRoutes from "./transactions";
import stripeWebhook from "./webhooks/stripe";
import stripeConnectWebhook from "./webhooks/stripe-connect";
import { checkUserStillExists } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

const router = express.Router();

router.use("/webhooks/stripe", stripeWebhook);
router.use("/webhooks/stripe-connect", stripeConnectWebhook);

// 08-10-25 User auth now handled by better-auth
// To be able to implement 2FA, Passkey, OAuth, etc

router.all("/api/auth/*all", toNodeHandler(auth));

router.use(express.json());
router.use(checkUserStillExists);
router.use("/users", userRoutes);
router.use("/auth/client", clientAuthRoutes);
router.use("/payments", paymentRoutes);
router.use("/accounts", accountRoutes);
router.use("/projects", projectRoutes);
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/clients", clientRoutes);
router.use("/comments", commentRoutes);
router.use("/transactions", transactionRoutes);

router.get("/health", (_, res) => {
	res.sendStatus(200);
});

router.use(errorHandler);

export default router;
