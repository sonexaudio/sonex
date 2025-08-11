import type { ClientAccess, } from "../generated/prisma";
import { prisma } from "../lib/prisma";

export type SignupData = {
    email: string;
    password: string;
    name: string;
};

export type ClientAccessData = {
    email: string;
    projectId: string;
    token: string;
    expires: Date | string;
}

// Client auth
export async function addClientAccessDataToDatabase({
    email,
    projectId,
    token,
    expires
}: ClientAccessData) {
    await prisma.clientAccess.upsert({
        where: {
            email_projectId: {
                email,
                projectId
            }
        },
        update: {
            token,
            expires
        },
        create: {
            email,
            projectId,
            token,
            expires
        }
    });
}

export async function updateClientAccessData({ token, data }: { token: string, data: Partial<ClientAccess>; }) {
    await prisma.clientAccess.update({
        where: { token },
        data
    });
}