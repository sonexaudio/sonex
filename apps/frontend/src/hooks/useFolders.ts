import api from "../lib/axios";
import type { SonexFile } from "../types/files";
import { useState } from "react";

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

export function useFolders() {
    const [folders, setFolders] = useState<ISonexFolder[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchFolders({ projectId, limit, page, sortBy }: { projectId?: string; limit?: string; page?: string; sortBy?: { name?: "asc" | "desc"; createdAt?: "asc" | "desc"; }; }) {
        const params: Record<string, string> = {};

        if (projectId) {
            params.projectId = projectId;
        }

        if (limit) {
            params.limit = limit;
        }

        if (page) {
            params.page = page;
        }

        if (sortBy) {
            params.sortBy = JSON.stringify(sortBy);
        }

        setLoading(true);
        try {
            const { data: { data } } = await api.get("/folders", { params });
            setFolders(data.folders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function createFolder(folderData: CreateFolderParams): Promise<void> {
        setLoading(true);
        try {
            await api.post("/folders", folderData);
            await fetchFolders({ projectId: folderData.projectId });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function updateFolder(folderData: Partial<CreateFolderParams>): Promise<void> {
        try {
            await api.put(`/folders/${folderData.folderId}`);
            await fetchFolders({ projectId: folderData.projectId });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function moveItemIntoFolder(itemId: string, targetFolderId: string | null, itemType: "folder" | "file") {
        try {
            const { data: { data } } = await api.put("/folders/move", { itemId, targetFolderId: targetFolderId ?? null, itemType });

            if (data.success) {
                // TODO: Find a way to update the folder structure in the state
                return true;
            }

            return false;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function deleteFolder(id: string): Promise<boolean> {
        try {
            await api.delete(`/folders/${id}`);
            setFolders(folders.filter(folder => folder.id !== id));
            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        folders,
        loading,
        fetchFolders,
        createFolder,
        updateFolder,
        deleteFolder,
        moveItemIntoFolder
    };
}
