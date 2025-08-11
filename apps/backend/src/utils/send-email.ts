import config from "../config";
import { createTransporter, transporter } from "../lib/mailer";
import nodemailer from "nodemailer";

const styles = {
    container: "max-width:500px;margin:0 auto;padding:20px;border1px solid #000;border-radius:6px",
    header: "font-size:20px;font-weight:bold;margin-bottom:10px;color:#333",
    body: "font-size:16px;line-height:1.5",
    footer: "display:inline-block;font-size:12px;color:#999;margin-top:15px;padding:10px 15px;",
};

export async function sendEmail({
    to,
    subject,
    meta,
}: {
    to: string;
    subject: string;
    meta: {
        description: string;
        link: string;
    };
}) {
    try {
        const info = await transporter?.sendMail({
            from: `"Izzy from Sonex" <no-reply@sonex.app>`,
            to,
            subject,
            html: `
            <div style="${styles.container}">
                <h1 style="${styles.header}">${subject}</h1>
                <div style="${styles.body}">
                    <p>${meta.description}</p>
                    <a href="${meta.link}">Learn more</a>
                </div>
                <div style="${styles.footer}">Sent with ❤️ by Sonex</div>
            </div>
        `,
        });

        if (config.environment !== "production") {
            console.log("Preview email:", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "Failed to send email" };
    }
}
