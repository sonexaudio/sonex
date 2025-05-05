import { type Request, type Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { parseUserName } from "../../utils";

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

export default authRouter;
