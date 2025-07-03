import { Router } from "express";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
    const { fileId } = req.query;
    let comments: unknown;

    if (fileId) {
        comments = await prisma.comment.findMany({
            where: { fileId: fileId as string },
            include: {
                client: true,
                user: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    } else {
        comments = await prisma.comment.findMany({
            include: {
                client: true,
                user: true,
            },
        });
    }

    successResponse(res, { comments });
});

router.post("/", async (req, res) => {
    const { content, timestamp, parentId, userId, clientId, fileId } = req.body;

    const comment = await prisma.comment.create({
        data: {
            content: content as string,
            parentId: parentId ? parentId as string : null,
            userId: userId ? userId as string : null,
            clientId: clientId ? clientId as string : null,
            timestamp: timestamp ? timestamp as number : null,
            fileId: fileId as string
        }
    });

    successResponse(res, { comment }, null, 201);
    return;
});

router.post("/reply", async (req, res) => {
    const { content, timestamp, parentId, userId, clientId, fileId } = req.body;

    const comment = await prisma.comment.create({
        data: {
            content: content as string,
            parentId: parentId as string,
            userId: userId ? userId as string : null,
            clientId: clientId ? clientId as string : null,
            timestamp: timestamp ? timestamp as number : null,
            fileId: fileId as string
        }
    });

    successResponse(res, { comment }, null, 201);
    return;
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            errorResponse(res, 404, "Comment does not exist");
            return;
        }

        await prisma.comment.delete({
            where: { id }
        });

        successResponse(res, null, null, 204);
    } catch (error) {
        console.error(error);
        errorResponse(res, 500, "Something went wrong");
    }
});

export default router;
