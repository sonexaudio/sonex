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
			passReqToCallback: true,
		},
		async (req, _accessToken, _refreshToken, profile, done) => {
			const googleEmail = profile.emails?.[0].value;

			// is there a user already logged in who wants to link Google?
			if (req.user) {
				if (req.user.email !== googleEmail) {
					return done(null, false, {
						message: "Google account email does not match your account email.",
					});
				}

				const updatedUser = await prisma.user.update({
					where: { id: req.user?.id },
					data: {
						googleId: profile.id,
						avatarUrl: req.user?.avatarUrl || profile.photos?.[0].value,
					},
				});

				return done(null, updatedUser as User);
			}

			// Or just find or create the user to log them in
			try {
				const user = await prisma.user.findUnique({
					where: {
						email: googleEmail,
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
						avatarUrl: profile.photos?.[0].value ?? null,
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
			return done(null, false);
		}

		done(null, user as User);
	} catch (error) {
		done(error);
	}
});
