import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma";
import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../../utils/responses";
import { requireAuth } from "../../middleware/auth";

const router = Router();
const storage = multer.diskStorage({
	destination: (req, _file, cb) => {
		let { projectId, uploaderId } = req.query;

		const folderPath = path.join(
			__dirname,
			"uploads",
			uploaderId as string,
			projectId as string,
		);
		fs.mkdirSync(folderPath, { recursive: true });
		cb(null, folderPath);
	},
	filename: (_req, file, cb) => {
		const extension = path.extname(file.originalname);
		const filename = path.basename(file.originalname, extension);
		cb(null, `${filename}${extension}`);
	},
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files"), async (req, res) => {
	const { projectId, uploaderId, uploaderType } = req.body;

	try {
		const savedFiles = await Promise.all(
			(req.files as Express.Multer.File[]).map((file) =>
				prisma.file.create({
					data: {
						name: file.originalname,
						size: file.size,
						mimeType: file.mimetype,
						path: file.path,
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

// Get all files pertaining to user
// TODO: will add metadata so that I can add projectId, metadata, and getting files pertaining to project
router.get("/", requireAuth, async (req, res) => {
	const userId = req.user?.id;
	try {
		const files = await prisma.file.findMany({
			where: {
				uploaderId: userId,
			},
		});

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

router.delete("/:id", requireAuth, async (req, res) => {
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
