import { ForbiddenError, NotFoundError } from "../errors";
import type { User } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { findUserById } from "./db.service";

export type NewUserData = {
    email: string;
    firstName?: string;
    lastName?: string | undefined;
    hashedPassword: string;
};

export async function getFullUserInfo(userId: string | undefined) {
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            activities: true,
            transactions: true,
            subscriptions: true,
        }
    });

    return user;
}

export async function createNewUser(userData: NewUserData) {
    const { email, firstName, lastName, hashedPassword } = userData;

    // try to create a new user
    // or send error to route if there's a problem
    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                hashedPassword,
                name: `${firstName} ${lastName}`,   
            },
        });

        return newUser;
    } catch (error) {
        throw new Error("Error creating user", error as Error);
    }
}

export async function updateUserById(
    userId: string,
    data: Partial<User>,
    currentUserId?: string,
) {
    const user = await findUserById(userId);

    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }

    if (currentUserId && user.id !== currentUserId) {
        throw new ForbiddenError("You do not have permission to update this user");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
    });

    return updatedUser;
}

export async function deleteUserById(userId: string, currentUserId?: string) {
    const user = await findUserById(userId);

    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }

    if (currentUserId && user.id !== currentUserId) {
        throw new ForbiddenError("You do not have permission to delete this user");
    }

    await prisma.user.delete({
        where: { id: userId },
    });
}
