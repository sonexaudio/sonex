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
            const template = fs.readFileSync(path.join(__dirname, "../../emails/ResetPasswordEmail.mjml"), "utf-8");

            const firstName = user.name.split(" ")[0];
            const email = user.email

            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                template,
                variables: {
                    firstName,
                    url,
                    email
                }
            });
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 5, // 5 min,
        autoSignInAfterVerification: true,
    },
    trustedOrigins: [
        config.frontendUrl
    ],
    plugins: [
        magicLink({
            expiresIn: 60 * 60 * 12, // 12 hours
            sendMagicLink: async ({ email, url }) => {
                const template = fs.readFileSync(path.join(__dirname, "../../emails/LoginViaMagicLink.mjml"), "utf-8");

                const resetPasswordUrl = `${config.frontendUrl}/forgot-password`;

                await sendEmail({
                    to: email,
                    subject: "Your magic link",
                    template,
                    variables: {
                        url,
                        email,
                        resetPasswordUrl
                    }
                });
            }
        }),

        emailOTP({
            overrideDefaultEmailVerification: true,
            expiresIn: 60 * 5, // 5 min
            sendVerificationOnSignUp: true,
            allowedAttempts: 5, // allow 5 attempts before invalidating
            sendVerificationOTP: async ({ email, otp, type }) => {
                switch (type) {
                    case "email-verification": {
                        const template = fs.readFileSync(path.join(__dirname, "../../emails/VerificationEmail.mjml"), "utf-8");

                        const verificationLink = `${config.frontendUrl}/forgot-password`;

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
                }
            }
        })
    ]
});