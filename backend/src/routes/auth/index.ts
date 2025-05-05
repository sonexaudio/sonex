import { type Request, type Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { parseUserName } from "../../utils";
import passport from "passport";
import type { User } from "../../generated/prisma";
import config from "../../config";
import "../../lib/passport/local";
import "../../lib/passport/google";

const authRouter = Router();

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
			res.status(401).json(info);
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

export default authRouter;
