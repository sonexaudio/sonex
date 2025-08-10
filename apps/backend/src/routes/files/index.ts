import { type Request, Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma";
import path from "path";
import fs from "fs";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responses";
import { requireAuth } from "../../middleware/auth";
import type { Client, File } from "../../generated/prisma";
import multerS3 from "multer-s3";
import s3Client from "../../lib/s3-client";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = Router();
interface MulterRequest extends Express.Request {
	query: {
		projectId: string;
		uploaderId: string;
		uploaderType: "CLIENT" | "USER";
	};
	fileIdMap: Record<string, string>;
}

interface FileIdRequest extends Request {
	fileIdMap?: Record<string, string>;
}

const SIGNED_EXPIRATION_SECONDS = 45;

const storage = multerS3({
	s3: s3Client,
	bucket: "sonex",
	key: async (req: MulterRequest, file, cb) => {
		try {
			const { projectId, uploaderId, uploaderType } = req.query;

			if (!projectId || !uploaderId || !uploaderType) {
				cb(new Error("Missing upload parameters"), "");
				return;
			}

			const project = await prisma.project.findUnique({
				where: { id: projectId },
			});

			if (!project) {
				cb(new Error("Project does not exist"), "");
				return;
			}

			const extension = path.extname(file.originalname);
			const basename = path.basename(file.originalname, extension);
			const fileId = crypto.randomUUID();
			const projectSlug = `${project.title.replace(/[^\w/-]/g, "_").toLowerCase()}_${project.id}`;
			const ownerId = uploaderType === "CLIENT" ? project.userId : uploaderId;

			const key = `${ownerId}/${projectSlug}/${fileId}__${basename}${extension}`;

			// storing fileId to be used as file id when creating in database
			req.fileIdMap = req.fileIdMap || {};
			req.fileIdMap[file.originalname] = fileId;

			cb(null, key);
		} catch (error) {
			cb(new Error(`Invalid upload parameters: ${error}`), "");
		}
	},
	metadata: async (req: MulterRequest, _file, cb) => {
		const { projectId, uploaderId, uploaderType } = req.query;

		let client: Client | null;

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			cb(new Error("Project does not exist"), "");
			return;
		}

		if (uploaderType === "CLIENT") {
			client = await prisma.client.findUnique({
				where: { id: uploaderId as string },
			});
		} else {
			client = null;
		}

		const md = {
			projectTitle: project.title,
			uploadedBy: uploaderType === "CLIENT" ? client?.email : "User",
		};

		cb(null, md);
	},
});

const upload = multer({ storage: storage });

router.post(
	"/upload",
	upload.array("files"),
	async (req: FileIdRequest, res) => {
		const { projectId, uploaderId, uploaderType } = req.body;

		// Additional validation: ensure project exists and user has permission
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			select: {
				id: true,
				userId: true,
				paymentStatus: true,
				status: true
			},
		});

		if (!project) {
			sendErrorResponse(res, 404, "Project not found");
			return;
		}

		// Permission check
		if (uploaderType === "USER" && project.userId !== uploaderId) {
			sendErrorResponse(res, 403, "Insufficient permissions");
			return;
		}

		const files = req.files as Express.MulterS3.File[];
		if (!files || files.length === 0) {
			sendErrorResponse(res, 400, "No files uploaded");
			return;
		}

		try {
			const savedFiles = await Promise.all(
				files.map((file) => {
					const fileId = req.fileIdMap?.[file.originalname];
					return prisma.file.create({
						data: {
							id: fileId,
							name: file.originalname,
							size: file.size,
							mimeType: file.mimetype,
							path: file.key || file.path,
							projectId,
							uploaderId,
							uploaderType,
							isDownloadable: project?.paymentStatus !== "Unpaid" && project.status !== "Archived"
						},
					});
				}),
			);
			sendSuccessResponse(res, { files: savedFiles }, null, 201);
		} catch (error) {
			console.error(error);
			sendErrorResponse(res, 500, "Something went wrong");
		}
	},
);

// Get all files pertaining to user/project
// TODO: will add metadata so that I can add projectId, metadata, and getting files pertaining to project
router.get("/", async (req, res) => {
	const projectAccess = req.session.projectAccess;
	const projectId = projectAccess?.projectId || (req.query.projectId as string);
	const userId = req.user?.id;

	try {
		let files: File[];
		if (projectId && req.url.includes(projectId)) {
			files = await prisma.file.findMany({
				where: { OR: [{ projectId }, { uploaderId: req.user?.id }] },
				orderBy: { createdAt: "desc" },
			});
		} else if (userId) {
			files = await prisma.file.findMany({
				where: {
					project: {
						userId,
					},
				},
			});
		} else {
			sendErrorResponse(res, 401, "Unauthorized");
			return;
		}

		sendSuccessResponse(res, { files });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const file = await prisma.file.findUnique({
			where: { id },
		});

		if (!file) {
			sendErrorResponse(res, 404, "File not found");
			return;
		}

		sendSuccessResponse(res, { file });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

// get file and stream (including versions)
router.get("/:id/stream-url", async (req, res) => {
	const fileId = req.params.id as string;
	try {
		const fileInfo = await prisma.file.findUnique({
			where: { id: fileId },
		});

		if (!fileInfo) {
			sendErrorResponse(res, 404, "File not found");
			return;
		}

		const streamableTypes = ["video/", "audio/", "image/"];
		const isStreamable = streamableTypes.some(type => fileInfo.mimeType.startsWith(type));

		if (!isStreamable) {
			sendErrorResponse(res, 400, "File type not streamable");
			return;
		}

		const params = {
			Bucket: "sonex",
			Key: fileInfo.path,
			ResponseContentType: fileInfo.mimeType,
		};

		const command = new GetObjectCommand(params);

		const url = await getSignedUrl(s3Client, command, { expiresIn: SIGNED_EXPIRATION_SECONDS });

		const file = {
			...fileInfo,
			streamUrl: url
		};

		sendSuccessResponse(res, { file });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

// download file
router.get("/:id/download-url", async (req, res) => {
	const fileId = req.params.id as string;

	try {
		const fileInfo = await prisma.file.findUnique({
			where: { id: fileId },
		});

		if (!fileInfo) {
			sendErrorResponse(res, 404, "File not found");
			return;
		}

		const params = {
			Bucket: "sonex",
			Key: fileInfo.path,
			ResponseContentType: fileInfo.mimeType,
			ResponseContentDisposition: `attachment; filename="${fileInfo.name}"`
		};

		const command = new GetObjectCommand(params);

		const url = await getSignedUrl(s3Client, command, { expiresIn: SIGNED_EXPIRATION_SECONDS });

		sendSuccessResponse(res, { url });
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

// Delete all files
router.post("/delete-all", requireAuth, async (req, res) => {
	const fileIds = JSON.parse(req.body.fileIds);
	try {
		const files = await prisma.file.findMany({
			where: { id: { in: fileIds } },
			select: { path: true }
		});

		// Delete files from R2 (parallel)
		const deletePromises = files.map((file) =>
			s3Client.send(
				new DeleteObjectCommand({
					Bucket: "sonex",
					Key: file.path,
				})
			)
		);
		await Promise.all(deletePromises);


		await prisma.file.deleteMany({
			where: { id: { in: fileIds } },
		});

		res.sendStatus(204);
	} catch (error) {
		console.error(error);
		sendErrorResponse(res, 500, "Something went wrong");
	}

});

router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const existingFile = await prisma.file.findUnique({
			where: { id },
			include: {
				project: {
					select: {
						userId: true,
					},
				},
			},
		});

		if (!existingFile) {
			sendErrorResponse(res, 404, "File not found");
			return;
		}

		const params = {
			Bucket: "sonex",
			Key: existingFile.path,
		};

		const command = new DeleteObjectCommand(params);
		await s3Client.send(command);

		await prisma.file.delete({
			where: { id },
		});

		res.sendStatus(204);
	} catch (error) {
		sendErrorResponse(res, 500, "Something went wrong");
	}
});

export default router;