import { Router } from "express";
import { successResponse } from "../../utils/responses";
import { prisma } from "../../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
    const { content, timestamp, parentId } = req.body;
    successResponse(res, { message: "This works" }, null, 201);
    return;
});

export default router;