import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../../config";
import { prisma } from "../prisma";
import { parseUserName } from "../../utils";
import type { User } from "../../generated/prisma";
const {
	auth: { google },
} = config;

passport.use(
	new GoogleStrategy(
		{
			clientID: google.clientId,
			clientSecret: google.clientSecret,
			callbackURL: google.callbackUrl,
		},
		async (_accessToken, _refreshToken, profile, done) => {
			try {
				const user = await prisma.user.findUnique({
					where: {
						googleId: profile.id,
					},
				});

				if (user) {
					return done(null, user as User);
				}

				const parsedName = parseUserName(profile.displayName);

				const newUser = await prisma.user.create({
					data: {
						googleId: profile.id,
						firstName: parsedName?.firstName ?? null,
						lastName: parsedName?.lastName ?? null,
						email: profile.emails?.[0].value as string,
						avatarUrl: profile.profileUrl ?? null,
					},
				});

				done(null, newUser as User);
			} catch (error) {
				done(error);
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
		});

		if (!user) {
			return done(new Error("User not found"));
		}

		done(null, user as User);
	} catch (error) {
		done(error);
	}
});
