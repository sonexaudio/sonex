import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import type { User } from "../../generated/prisma";

passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const existingUser = await prisma.user.findUnique({
					where: {
						email,
					},
					omit: {
						hashedPassword: false,
					},
				});

				if (!existingUser || !existingUser.hashedPassword) {
					return done(null, false, { message: "Incorrect email or password" });
				}

				const isMatch = await bcrypt.compare(
					password,
					existingUser?.hashedPassword as string,
				);

				if (!isMatch) {
					return done(null, false, { message: "Incorrect email or password" });
				}

				const { hashedPassword, ...userData } = existingUser;

				done(null, userData as User);
			} catch (error) {
				done(error, false);
			}
		},
	),
);

passport.serializeUser((user, done) => {
	done(null, (user as User).id);
});

passport.deserializeUser(async (userId, done) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId as string,
			},
			omit: {
				passwordLastChangedAt: true,
				resetPasswordToken: true,
				resetTokenExpiresAt: true,
			},
		});

		if (!user) {
			return done(null, false);
		}

		done(null, user as User);
	} catch (error) {
		done(error, null);
	}
});
