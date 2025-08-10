import { NotFoundError } from "../errors";
import { prisma } from "../lib/prisma";
// Utility database functions

// ===== User-Specific ====
export async function findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    return user;
}

export async function findUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    return user;
}

export async function findUserByResetToken(resetToken: string) {
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: resetToken,
            resetTokenExpiresAt: {
                gt: new Date(), // expiration can not be anywhere at or less than this current moment
            },
        },
    });

    return user;
}

// ===== Client-Specific ====
export async function findClientByEmail(email: string) {
    const client = await prisma.client.findFirst({
        where: { email }
    });

    return client;
}

export async function findClientAccessByToken(token: string, projectId: string) {
    const clientAccess = await prisma.clientAccess.findUnique({
        where: { token, projectId }
    });

    return clientAccess;
}

// ===== Project-Specific ====
export async function findProjectById(id: string) {
    const project = await prisma.project.findUnique({
        where: { id }
    });

    return project;
}