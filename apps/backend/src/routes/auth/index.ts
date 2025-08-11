import { Router } from "express";
import bcrypt from "bcryptjs";
import {
	createResetPasswordToken,
	encryptResetPasswordToken,
} from "../../utils";
import config from "../../config";
import { requireAuth } from "../../middleware/auth";
import { sendSuccessResponse } from "../../utils/responses";
import { findUserByEmail, findUserByResetToken } from "../../services/db.service";
import { BadRequestError, NotFoundError } from "../../errors";
import { updateUserById } from "../../services/user.service";

const authRouter = Router();

// Verify email
// TODO: add a token to the email and use email api to send
authRouter.post("/send-verification-email", requireAuth, async (req, res, next) => {
	const { email } = req.body;
	if (!email) {
		throw new BadRequestError("Email is required to verify")
	}

	try {
		const user = await findUserByEmail(email);
		await updateUserById(user?.id!, { isVerified: true }, req.user?.id); //TODO - for now, the user is verified without email confirmation.
	} catch (error) {
		next(error);
	}
});

// Request to generate new token for forgotten password
authRouter.post("/forgot-password", async (req, res, next) => {
	const { email } = req.body;
	if (!email) {
		res.status(400).json({ error: "Email is required to update password" });
		return;
	}

	try {
		const user = await findUserByEmail(email)

		const { token, hashedToken, expiresAt } = createResetPasswordToken();
		const resetTokenLink = `${config.frontendUrl}/reset-password?code=${token}`;

		await updateUserById(user?.id!, { resetPasswordToken: hashedToken, resetTokenExpiresAt: expiresAt })

		// TODO send straight to email and only return 201
		sendSuccessResponse(res, { resetTokenLink, expiresAt, hashedToken })
	} catch (error) {
		console.error(error);
		next(error);
	}
});

// Request to reset password given token and valid params
authRouter.patch("/reset-password", async (req, res, next) => {
	const { token } = req.query;
	const { password } = req.body;

	if (!token) {
		res.status(400).json({ error: "Missing required token in query params" });
		return;
	}

	try {
		// Hash the incoming token to match what's in the database
		const hashedToken = encryptResetPasswordToken(token as string);

		const user = await findUserByResetToken(hashedToken);

		if (!user) {
			throw new NotFoundError(`User with reset token ${hashedToken} not found`);
		}

		// Now the magic happens
		const hashedPassword = await bcrypt.hash(password, 10);

		await updateUserById(user.id, { hashedPassword, passwordLastChangedAt: new Date(), resetPasswordToken: null, resetTokenExpiresAt: null });

		sendSuccessResponse(res, { message: "Password reset successfully!" });

	} catch (error) {
		next(error);
	}
});

export default authRouter;
