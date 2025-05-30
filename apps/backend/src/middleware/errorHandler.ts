import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { errorResponse } from "../utils/responses";

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	logger.error((err as Error).message);
	errorResponse(res, 500, err);
}
