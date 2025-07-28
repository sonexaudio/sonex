import { addDays } from "date-fns";
import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import config from "../../../config";
import { generateClientAccessToken, generateTokenHash } from "../../../utils/token";
import { errorResponse, successResponse } from "../../../utils/responses";

export async function sendClientAccess(email: string, projectId: string): Promise<{ token: string; url: string; } | null> {
    try {
        const token = generateClientAccessToken();
        const hashedToken = generateTokenHash(token);
        const expires = addDays(new Date(), 3); // expires in 3 days

        await prisma.clientAccess.upsert({
            where: { email_projectId: { email, projectId } },
            update: {
                token: hashedToken,
                expires
            },
            create: {
                email,
                projectId,
                token: hashedToken,
                expires
            }
        });

        const url = `${process.env.FRONTEND_URL}/projects/${projectId}?code=${token}`;

        // TODO: Send email to client

        return { token, url };
    } catch (error) {
        console.error(error);
        return null;
    }
}


export async function validateClientCode(code: string, projectId: string) {
    const hashedToken = generateTokenHash(code);
    const access = await prisma.clientAccess.findUnique({ where: { token: hashedToken, projectId } });

    if (!access || access.projectId !== projectId || access.acceptedAt || access.expires < new Date()) {
        return null;
    }

    // Mark code as accepted once validated and create a JWT token
    await prisma.clientAccess.update({ where: { token: hashedToken }, data: { acceptedAt: new Date() } });

    const clientToken = jwt.sign({
        projectId, email: access.email
    }, config.auth.clientTokenSecret);

    return clientToken;
}