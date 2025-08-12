import config from "../config";
import { transporter } from "../lib/mailer";
import nodemailer from "nodemailer";
import mjml2html from "mjml";

const styles = {
    container: "max-width:500px;margin:0 auto;padding:20px;border1px solid #000;border-radius:6px",
    header: "font-size:20px;font-weight:bold;margin-bottom:10px;color:#333",
    body: "font-size:16px;line-height:1.5",
    footer: "display:inline-block;font-size:12px;color:#999;margin-top:15px;padding:10px 15px;",
};

function replacePlaceholders(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce((acc, [key, value]) => {
        const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        return acc.replace(pattern, value);
    }, template);
}

export async function sendEmail({
    to,
    subject,
    template,
    variables
}: {
    to: string;
    subject: string;
        template: string;
        variables: Record<string, string>;
}) {
    try {
        // Inject current year if not provided
        if (!variables.currentYear) {
            variables.currentYear = new Date().getFullYear().toString();
        }

        // Replace placeholders with actual values
        const mjmlWithVariables = replacePlaceholders(template, variables);

        // Convert MJML to HTML
        const { html, errors } = mjml2html(mjmlWithVariables, { validationLevel: "soft" });

        if (errors.length) {
            console.warn("MJML Validation Warnings:", errors);
        }

        // Send email
        const info = await transporter?.sendMail({
            from: `"Izzy from Sonex" <no-reply@sonex.app>`,
            to,
            subject,
            html
        });

        if (config.environment !== "production") {
            console.log("Preview email:", nodemailer.getTestMessageUrl(info));
        }

        return { success: true, info }
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "Failed to send email" };
    }
}
