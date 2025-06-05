import { Router } from "express";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../lib/prisma";
import type { File, Folder } from "../../generated/prisma";

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
    let { projectId, limit, page, sortBy }: { projectId?: string, limit?: string | undefined, page?: string | undefined, sortBy?: { name?: "asc" | "desc"; createdAt?: "asc" | "desc"; }; } = req.query;

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
            skip: (pageNum - 1) * limitNum,
            orderBy: [
                { name: sortBy?.name ?? "asc" },
                { createdAt: sortBy?.name ?? "desc" },
            ]
        });

        successResponse(res, { folders });
    } catch (error) {
        errorResponse(res, 500, "Something went wrong");
    }
});

folderRouter.put("/move", async (req, res) => {
    const { itemId, targetFolderId, itemType } = req.body;

    // allow targetFolderId to be null (root)
    if (!itemId || itemType === undefined) {
        errorResponse(res, 400, "Missing itemId or itemType");
        return;
    }
    if (itemType !== "file" && itemType !== "folder") {
        errorResponse(res, 400, "itemType must be 'file' or 'folder'");
        return;
    }

    try {
        // First check that the target folder exists
        if (targetFolderId !== null) {
            const existingFolder = await prisma.folder.findUnique({
                where: { id: targetFolderId as string },
            });
            if (!existingFolder) {
                errorResponse(res, 404, "Target folder does not exist");
                return;
            }
        }


        // Check to see if file or folder exists
        let existingItem: File | Folder | null;
        if (itemType === "file") {
            existingItem = await prisma.file.findUnique({
                where: { id: itemId }
            });
        } else {
            existingItem = await prisma.folder.findUnique({
                where: { id: itemId }
            });
        }
        if (!existingItem) {
            errorResponse(res, 404, "Item not found");
            return;
        }

        if (itemType === "file") {
            await prisma.file.update({
                where: { id: itemId },
                data: { folderId: targetFolderId }
            });
        } else {
            await prisma.folder.update({
                where: { id: itemId },
                data: { parentId: targetFolderId }
            });
        }

        successResponse(res, { folderId: targetFolderId?.id });
    } catch (error) {
        console.error(error);
        errorResponse(res, 500, "Something went wrong");
    }
});

export default folderRouter;
