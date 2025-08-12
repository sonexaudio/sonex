import { betterAuth } from "better-auth";
import { magicLink, emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import config from "../config";
import { sendEmail } from "../utils/send-email";
import fs from "fs";
import path from "path"

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
                template: "",
                variables: {}
            });
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 60, // 1 hour,
        autoSignInAfterVerification: true,
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
                    template: "",
                    variables: {}
                });
            }
        }),

        emailOTP({
            overrideDefaultEmailVerification: true,
            sendVerificationOnSignUp: true,
            allowedAttempts: 5, // allow 5 attempts before invalidating
            sendVerificationOTP: async ({ email, otp, type }) => {
                switch (type) {
                    case "email-verification": {
                        const template = fs.readFileSync(path.join(__dirname, "../../emails/VerificationEmail.mjml"), "utf-8");

                        const verificationLink = `${config.frontendUrl}/auth/verify?otp=${otp}`

                        await sendEmail({
                            to: email,
                            subject: "Verify your email",
                            template,
                            variables: {
                                otp,
                                email,
                                verificationLink
                            }
                        });
                        return;
                    }

                    case "forget-password":
                        await sendEmail({
                            to: email,
                            subject: "Reset your password",
                            template: "",
                            variables: {}
                        });
                }
            }
        })
    ]
});