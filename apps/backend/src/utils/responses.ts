import type { Response } from "express";

export function successResponse(
	res: Response,
	data: any,
	message?: string | null,
	status = 200,
) {
	return res
		.status(status)
		.json({ success: true, message: message ?? null, data });
}

export function errorResponse(res: Response, status: number, error: string) {
	return res.status(status).json({ success: false, error });
}
