import { type Request, type Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import {
	createResetPasswordToken,
	encryptResetPasswordToken,
	parseUserName,
} from "../../utils";
import passport from "passport";
import type { User } from "../../generated/prisma";
import config from "../../config";
import "../../lib/passport/local";
import "../../lib/passport/google";
import { requireAuth } from "../../middleware/auth";
import { errorResponse, successResponse } from "../../utils/responses";
import { validate } from "../../middleware/validate";
import { SignupSchema, LoginSchema } from "@sonex/schemas/user";

const authRouter = Router();

// Get currently authenticated user
authRouter.get("/me", (req, res, next) => {
	try {
		if (
			!req.user ||
			typeof req.isAuthenticated !== "function" ||
			!req.isAuthenticated()
		) {
			res.status(200).json({ data: null });
			return;
		}

		successResponse(res, req.user);
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

		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (existingUser) {
			errorResponse(res, 409, "User with that email already exists");
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const displayName = parseUserName(name);

		const newUser = await prisma.user.create({
			data: {
				email,
				firstName: displayName?.firstName,
				lastName: displayName?.lastName ?? null,
				hashedPassword,
			},
		});

		successResponse(res, newUser, null, 201);
	} catch (error) {
		next(error);
	}
});

authRouter.post("/login", validate(LoginSchema), async (req, res, next) => {
	passport.authenticate("local", (err: unknown, user: User, info: unknown) => {
		if (err) {
			next(err);
			return;
		}

		if (!user) {
			errorResponse(res, 400, info as string);
			return;
		}

		req.login(user, (err) => {
			if (err) {
				next(err);
				return;
			}

			successResponse(res, user, null);
		});
	})(req, res);
});

// Handle google authentication
authRouter.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${config.frontendUrl}/account?error=google-email-mismatch`,
	}),
	(req, res) => {
		res.redirect(config.frontendUrl);
	},
);

authRouter.put("/google/unlink", requireAuth, async (req, res) => {
	try {
		await prisma.user.update({
			where: { id: req.user?.id },
			data: {
				googleId: null,
			},
		});

		res
			.status(200)
			.json({ success: true, message: "Google account unlinked." });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, message: "Failed to unlink Google account." });
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
authRouter.post("/send-verification-email", requireAuth, async (req, res) => {
	const { email } = req.body;
	if (!email) {
		res.status(400).json({ error: "Email is required to verify" });
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			res.status(404).json({ error: "User with that email does not exist" });
			return;
		}

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				isVerified: true,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// Request to generate new token for forgotten password
authRouter.post("/forgot-password", async (req, res) => {
	const { email } = req.body;
	if (!email) {
		res.status(400).json({ error: "Email is required to update password" });
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			res.status(404).json({ error: "User with that email does not exist" });
			return;
		}

		const { token, hashedToken, expiresAt } = createResetPasswordToken();
		const resetTokenLink = `${config.frontendUrl}/reset-password?code=${token}`;

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				resetPasswordToken: hashedToken,
				resetTokenExpiresAt: expiresAt,
			},
		});

		// TODO send straight to email and only return 201
		res.json({ data: { resetTokenLink, expiresAt, hashedToken } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

// Request to reset password given token and valid params
authRouter.patch("/reset-password", async (req, res) => {
	const { token } = req.query;
	const { password } = req.body;

	if (!token) {
		res.status(400).json({ error: "Missing required token in query params" });
		return;
	}

	try {
		const hashedToken = encryptResetPasswordToken(token as string);

		const user = await prisma.user.findFirst({
			where: {
				resetPasswordToken: hashedToken,
				resetTokenExpiresAt: {
					gt: new Date(), // expiration can not be anywhere at or less than this current moment
				},
			},
		});

		if (!user) {
			res.status(404).json({ error: "Token is invalid or expired" });
			return;
		}

		// Now the magic happens
		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				hashedPassword,
				passwordLastChangedAt: new Date(),
				resetPasswordToken: null,
				resetTokenExpiresAt: null,
			},
		});

		res.json({ data: { message: "User updated successfully!" } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

export default authRouter;
