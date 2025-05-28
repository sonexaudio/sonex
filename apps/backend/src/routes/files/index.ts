import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma";
import path from "path";
import { errorResponse, successResponse } from "../../utils/responses";

const router = Router();
const storage = multer.diskStorage({ destination: (_req, _file, cb) => {
	cb(null, path.join(__dirname, "uploads"))
}, filename: (_req, file, cb) => {
	const extension = path.extname(file.originalname);
	const filename = path.basename(file.originalname, extension)
	cb(null, `${filename}${extension}`)
}} );

const upload = multer({storage: storage})

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
		console.error(error)
		errorResponse(res, 500, "Something went wrong");
	}
});

export default router;
