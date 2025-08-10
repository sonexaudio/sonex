import { prisma } from "../lib/prisma";
import type { Prisma, Project, ProjectPaymentStatus, ProjectStatus } from "../generated/prisma";
import { generateClientAccessToken } from "../utils/token";
import { addClient } from "./client.service";

export async function getProjectsForUser(
    userId: string,
    { page = 1, limit = 10, search = "", status = "", paymentStatus = "", sortField = "createdAt", sortDirection = "desc" }
) {
    const offset = (page - 1) * limit;
    const where: Prisma.ProjectWhereInput = { userId };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (status && status !== "all") where.status = status as ProjectStatus;
    if (paymentStatus && paymentStatus !== "all") where.paymentStatus = paymentStatus as ProjectPaymentStatus;

    const allowedSortFields = [
        "title", "status", "paymentStatus", "amount", "dueDate", "createdAt", "updatedAt"
    ];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
    const validSortDirection = sortDirection === "asc" ? "asc" : "desc";

    const projects = await prisma.project.findMany({
        where,
        orderBy: { [validSortField]: validSortDirection },
        skip: offset,
        take: limit,
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            paymentStatus: true,
            amount: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { files: true, clients: true } },
        },
    });
    const totalCount = await prisma.project.count({ where });
    const transformedProjects = projects.map((project) => ({
        ...project,
        fileCount: project._count.files,
        clientCount: project._count.clients,
    }));
    return { projects: transformedProjects, totalCount };
}

export async function createProject(userId: string, projectData: Partial<Project>) {
    const shareCode = generateClientAccessToken();
    if (!projectData.title) {
        throw new Error("Project title is required");
    }
    // Add similar checks for other required fields if needed
    return prisma.project.create({
        data: {
            userId,
            title: projectData.title,
            description: projectData.description ?? "",
            status: projectData.status ?? "Active",
            paymentStatus: projectData.paymentStatus ?? "Unpaid",
            amount: projectData.amount ?? 0,
            dueDate: projectData.dueDate ?? undefined,
            shareCode,
        },
    });
}

export async function getProjectById(id: string) {
    return prisma.project.findUnique({
        where: { id },
        include: {
            clients: { include: { client: true } },
            files: true,
            user: { select: { email: true, firstName: true, lastName: true } },
        },
    });
}

export async function getProjectFolders(id: string) {
    return prisma.folder.findMany({ where: { projectId: id } });
}

export async function getProjectComments(id: string) {
    return prisma.comment.findMany({ where: { projectId: id } });
}

export async function getProjectTransactions(id: string) {
    return prisma.transaction.findMany({ where: { projectId: id } });
}

export async function getProjectActivities(id: string) {
    return prisma.activity.findMany({ where: { targetId: id } });
}

export async function createClientForProject(projectId: string, clientData: any) {
    const client = await addClient(clientData);
    await prisma.clientProject.create({ data: { projectId, clientId: client.id } });
    return client;
}

export async function updateProject(id: string, userId: string, data: any) {
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) throw new Error("Project does not exist");
    if (existingProject.userId !== userId) throw new Error("Forbidden");
    return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string, userId: string) {
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) throw new Error("Project does not exist");
    if (existingProject.userId !== userId) throw new Error("Forbidden");
    await prisma.project.delete({ where: { id } });
}