import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma";
import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../../utils/responses";
import { requireAuth } from "../../middleware/auth";
import type { File } from "../../generated/prisma";
import multerS3 from "multer-s3";
import s3Client from "../../lib/s3-client";

const router = Router();
interface MulterRequest extends Express.Request {
	query: {
		projectId: string;
		uploaderId: string;
		uploaderType: 'CLIENT' | 'USER';
	};
}

const storage = multerS3({
	s3: s3Client,
	bucket: "sonex",
	key: async (req: MulterRequest, file, cb) => {
		try {
			const { projectId, uploaderId, uploaderType } = req.query;
			const extension = path.extname(file.originalname);
			const filename = path.basename(file.originalname, extension);
			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project) {
				cb(new Error("Project does not exist"), "");
				return;
			}

			if (uploaderType === "CLIENT") {
				cb(null, `${project.userId}/${project.title}_${projectId}/${filename}${extension}`);
			} else {
				cb(null, `${uploaderId}/${project.title}_${projectId}/${filename}${extension}`);
			}
		} catch (error) {
			cb(new Error(`Invalid upload parameters: ${error}`), "");
		}

	}
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files"), async (req, res) => {
	const { projectId, uploaderId, uploaderType } = req.body;

	// Additional validation: ensure project exists and user has permission
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			id: true,
			userId: true,
		}
	});

	if (!project) {
		errorResponse(res, 404, "Project not found");
		return;
	}

	// Permission check
	if (uploaderType === "USER" && project.userId !== uploaderId) {
		errorResponse(res, 403, "Insufficient permissions");
		return;
	}

	const files = req.files as Express.MulterS3.File[];
	if (!files || files.length === 0) {
		errorResponse(res, 400, "No files uploaded");
		return;
	}

	try {
		const savedFiles = await Promise.all(
			files.map((file) =>
				prisma.file.create({
					data: {
						name: file.originalname,
						size: file.size,
						mimeType: file.mimetype,
						path: file.key || file.path,
						projectId,
						uploaderId,
						uploaderType,
					},
				}),
			),
		);
		successResponse(res, { files: savedFiles }, null, 201);
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, "Something went wrong");
	}
});

// Get all files pertaining to user/project
// TODO: will add metadata so that I can add projectId, metadata, and getting files pertaining to project
router.get("/", async (req, res) => {
	const projectAccess = req.session.projectAccess;
	const projectId = projectAccess?.projectId || req.query.projectId as string;
	const userId = req.user?.id;

	try {
		let files: File[];
		if (projectId && req.url.includes(projectId)) {
			files = await prisma.file.findMany({
				where: { OR: [{ projectId }, { uploaderId: req.user?.id }] },
				orderBy: { createdAt: "desc" }
			});
		} else if (userId) {
			files = await prisma.file.findMany({
				where: {
					project: {
						userId
					}
				}
			});
		} else {
			errorResponse(res, 401, "Unauthorized");
			return;
		}

		successResponse(res, files);
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, "Something went wrong");
	}
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const file = await prisma.file.findUnique({
			where: { id },
		});

		if (!file) {
			errorResponse(res, 404, "File not found");
			return;
		}

		successResponse(res, file);
	} catch (error) {
		console.error(error);
		errorResponse(res, 500, "Something went wrong");
	}
});

// Delete all files
router.post("/delete-all", requireAuth, async (req, res) => {
	const fileIds = req.body.fileIds; // expecting array of file ids
	await prisma.file.deleteMany({
		where: {
			id: {
				in: fileIds,
			},
		},
	});

	res.sendStatus(204);
});

router.delete("/:id", async (req, res) => {
	const { id } = req.params;

	const existingFile = await prisma.file.findUnique({
		where: { id },
	});

	if (!existingFile) {
		errorResponse(res, 404, "File not found");
		return;
	}

	await prisma.file.delete({
		where: { id },
	});

	res.sendStatus(204);
});

export default router;
