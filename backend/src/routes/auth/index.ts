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

const authRouter = Router();

// Get currently authenticated user
authRouter.get("/me", (req, res) => {
	try {
		if (
			!req.user ||
			typeof req.isAuthenticated !== "function" ||
			!req.isAuthenticated()
		) {
			res.status(401).json({ data: null });
			return;
		}

		res.json({ data: { user: req.user } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

authRouter.post("/register", async (req: Request, res: Response) => {
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
			res.status(409).json({ error: "Email already exists" });
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

		res.status(201).json({ error: null, data: newUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

authRouter.post("/login", async (req, res) => {
	passport.authenticate("local", (err: unknown, user: User, info: unknown) => {
		if (err) {
			console.error(err);
			res.status(500).json({ error: "Something went wrong" });
			return;
		}

		if (!user) {
			console.error(info);
			res.status(400).json(info);
			return;
		}

		req.login(user, (err) => {
			if (err) {
				console.error(err);
				res.status(500).json({ error: "Something went wrong" });
				return;
			}

			res.status(200).json({ data: { user } });
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
	passport.authenticate("google"),
	(req, res) => {
		res.redirect(config.frontendUrl);
	},
);

authRouter.get("/logout", (req, res) => {
	req.logout((error) => {
		if (error) {
			res.status(500).json({ error: "Something went wrong" });
			return;
		}

		res.status(204).send();
	});
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
			res.status(404).send({ error: "User with that email does not exist" });
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
