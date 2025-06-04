import { Router } from "express";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../lib/prisma";

const folderRouter = Router();

folderRouter.post("/", async (req, res) => {
    const { name, parentId, projectId } = req.body;
    try {
        const folder = await prisma.folder.create({
            data: {
                name,
                projectId,
                parentId: parentId ?? null,
            },
        });

        successResponse(res, { folder }, null, 201);
    } catch (error) {
        console.error(error);
        errorResponse(res, 500, "Something went wrong");
    }
});

folderRouter.get("/", async (req, res) => {
    let { projectId, limit, page } = req.query;

    if (!projectId || typeof projectId !== "string") {
        errorResponse(res, 400, "Project Id required");
        return;
    }

    const limitNum = Number.parseInt(limit as string) || 10;
    const pageNum = Number.parseInt(page as string) || 1;

    try {
        const folders = await prisma.folder.findMany({
            where: { projectId },
            take: limitNum,
            skip: (pageNum - 1) * limitNum
        });

        successResponse(res, { folders });
    } catch (error) {
        errorResponse(res, 500, "Something went wrong");
    }
});

export default folderRouter;
