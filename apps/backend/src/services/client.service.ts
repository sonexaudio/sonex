import { prisma } from "../lib/prisma";

export type NewClientParams = {
    email: string;
    name: string;
    userId: string;
};

// Being that a client can belong to other users,
// Will upsert client just in case
export async function addClient({ email, name, userId }: NewClientParams) {
    const client = await prisma.client.upsert({
        where: { email_userId: { email, userId } },
        update: { name },
        create: { email, name, userId },
    });

    return client;
}

export async function addClientToProject(
    { clientId, projectId }:
        { clientId: string; projectId: string; }
) {
    await prisma.clientProject.upsert({
        where: {
            clientId_projectId: {
                clientId,
                projectId
            }
        },
        update: {},
        create: { clientId, projectId }
    });
}