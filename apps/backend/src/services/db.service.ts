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

    if (!user) {
        throw new NotFoundError(`User with email ${email} not found`);
    }

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

    if (!user) {
        throw new NotFoundError(`User with reset token ${resetToken} not found`);
    }

    return user;
}
