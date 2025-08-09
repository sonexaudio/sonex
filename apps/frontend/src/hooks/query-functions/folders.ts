import api from "../../lib/axios";
import type { SonexFile } from "../../types/files";

export type ISonexFolder = {
    id: string;
    name: string;
    parentId?: string | null;
    projectId: string;
    subfolders?: ISonexFolder[];
    files?: SonexFile[];
    createdAt: Date | string;
    lastModified: Date | string;
};

type CreateFolderParams = {
    name: string;
    parentId?: string | null;
    projectId: string;
    folderId?: string;
};


export async function fetchFolders(options: {
    projectId?: string;
    limit?: string;
    page?: string;
    sortBy?: { name?: "asc" | "desc"; createdAt?: "asc" | "desc"; };
}) {
    const params: Record<string, string> = {};

    if (options.projectId) {
        params.projectId = options.projectId;
    }

    if (options.limit) {
        params.limit = options.limit;
    }

    if (options.page) {
        params.page = options.page;
    }

    if (options.sortBy) {
        params.sortBy = JSON.stringify(options.sortBy);
    }

    try {
        const {
            data,
        } = await api.get("/folders", { params });
        return data.data.folders;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createFolder(folderData: CreateFolderParams): Promise<void> {
    try {
        const { data } = await api.post("/folders", folderData);
        return data.data.folder;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateFolder(folderData: Partial<CreateFolderParams>): Promise<void> {
    try {
        const { data } = await api.put(`/folders/${folderData.folderId}`, folderData);
        return data.data.folder;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function moveItemIntoFolder(itemId: string, targetFolderId: string | null, itemType: "folder" | "file"): Promise<boolean> {
    try {
        const { data } = await api.put("/folders/move", {
            itemId,
            targetFolderId: targetFolderId ?? null,
            itemType,
        });

        return data.success;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteFolder(id: string): Promise<string> {
    try {
        await api.delete(`/folders/${id}`);
        return id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
