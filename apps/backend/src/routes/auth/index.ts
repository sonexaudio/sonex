import { Router } from "express";
import bcrypt from "bcryptjs";
import {
	createResetPasswordToken,
	encryptResetPasswordToken,
} from "../../utils";
import passport from "passport";
import config from "../../config";
import "../../lib/passport/local";
import "../../lib/passport/google";
import { requireAuth } from "../../middleware/auth";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responses";
import { validate } from "../../middleware/validate";
import { SignupSchema, LoginSchema } from "@sonex/schemas/user";
import { findUserByEmail, findUserByResetToken } from "../../services/db.service";
import { ConflictError, NotFoundError } from "../../errors";
import { getCurrentSessionUser, loginAndAuthenticateUser, registerNewUser } from "../../services/auth.service";
import { updateUserById } from "../../services/user.service";

const authRouter = Router();

// Get currently authenticated user
authRouter.get("/me", (req, res, next) => {
	try {
		const currentUser = getCurrentSessionUser(req);
		sendSuccessResponse(res, currentUser);
	} catch (error) {
		next(error);
	}
});

authRouter.post("/register", validate(SignupSchema), async (req, res, next) => {
	const { email, name, password } = req.body;
	try {
		if (!email || !name || !password) {
			res.status(422).json({ error: "email, name, and password required" });
			return;
		}

		const existingUser = await findUserByEmail(email);

		if (existingUser) {
			throw new ConflictError(`User with email ${email} already exists`);
		}

		const newUser = await registerNewUser({ name, email, password });

		sendSuccessResponse(res, newUser, null, 201);
	} catch (error) {
		next(error);
	}
});

authRouter.post("/login", validate(LoginSchema), async (req, res, next) => {
	await loginAndAuthenticateUser(req, res, next);
});

// Handle google authentication
authRouter.get("/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get("/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${config.frontendUrl}/account?error=google-email-mismatch`,
	}),
	(req, res) => {
		res.redirect(config.frontendUrl);
	},
);

authRouter.put("/google/unlink", requireAuth, async (req, res, next) => {
	try {
		await updateUserById(req.user?.id!, { googleId: null });
		sendSuccessResponse(res, null, "Google account unlinked.");
	} catch (error) {
		next(error);
	}
});

authRouter.get("/logout", (req, res) => {
	req.logout((error) => {
		if (error) {
			res.status(500).json({ error: "Something went wrong" });
			return;
		}

		req.session.destroy((err) => {
			if (err) {
				res.status(500).json({ error: "Something went wrong" });
				return;
			}

			res.status(204).send();
		});
	});
});

// Verify email
// TODO: add a token to the email and use email api to send
authRouter.post("/send-verification-email", requireAuth, async (req, res, next) => {
	const { email } = req.body;
	if (!email) {
		sendErrorResponse(res, 400, "Email is required to verify");
		return;
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
