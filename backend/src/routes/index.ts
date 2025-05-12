import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.get("/health", (_, res) => {
	res.sendStatus(200);
});

export default router;
