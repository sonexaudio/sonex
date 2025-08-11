import nodemailer from "nodemailer";
import config from "../config";

let transporter: nodemailer.Transporter | undefined = undefined;

export async function createTransporter() {
    if (config.environment === "production") {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    const testAccount = await nodemailer.createTestAccount();
    console.log("Test account created:", testAccount.user, testAccount.pass);

    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

(async () => {
    if (!transporter) {
        transporter = await createTransporter();
    }
})();


export { transporter };