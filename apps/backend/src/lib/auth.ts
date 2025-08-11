import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import config from "../config";
import { sendEmail } from "../utils/send-email";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                meta: {
                    description: "Please click the link below to reset your password.",
                    link: url,
                }
            });
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 60, // 1 hour,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const link = new URL(url);

            link.searchParams.set("callbackURL", `${config.frontendUrl}/auth/verify`);

            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                meta: {
                    description: "Please click the link below to verify your email address.",
                    link: String(link),
                },
            });

        }
    },
    trustedOrigins: [
        config.frontendUrl
    ],
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                await sendEmail({
                    to: email,
                    subject: "Your magic link",
                    meta: {
                        description: "Please click the link below to sign in.",
                        link: url,
                    },
                });
            }
        })
    ]
});