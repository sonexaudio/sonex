import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma";
import path from "path";
import { errorResponse, successResponse } from "../../utils/responses";

const router = Router();
const upload = multer({ dest: path.join(__dirname, "uploads") });

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
		errorResponse(res, 500, "Something went wrong");
	}
});

export default router;
