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

export async function findUserById(id: string | undefined) {
    if (!id) return null;
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

// ==== Subscription-Specific ====
export async function findSubscriptionByUserInfo(userId: string) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            startDate: {
                // get the subscription that has started in the past 30 days
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                lt: new Date(),
            },
            isActive: true,
        }
    });

    return subscription;
}

// ===== Activity-Specific ====
export async function findActivitiesByUserId(userId: string) {
    const activities = await prisma.activity.findMany({
        where: {
            userId,
        },
    });

    return activities;
}

// ===== Transaction-Specific ====
export async function findTransactionsByUserId(userId: string) {
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
        },
    });

    return transactions;
}