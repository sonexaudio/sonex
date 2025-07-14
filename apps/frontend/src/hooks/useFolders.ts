import api from "../lib/axios";
import type { SonexFile } from "../types/files";
import { useProjectContext } from "../context/ProjectProvider";

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
    const { addFolderToState, updateFolderInState, deleteFolderFromState, refreshFolders } = useProjectContext();

    async function createFolder(folderData: CreateFolderParams): Promise<ISonexFolder> {
        try {
            const { data: { data: folder } }: { data: { data: ISonexFolder; }; } = await api.post("/folders", folderData);

            // Add to centralized state
            addFolderToState(folder);

            return folder;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function updateFolder(folderData: Partial<CreateFolderParams>): Promise<ISonexFolder> {
        try {
            const { data: { data: folder } }: { data: { data: ISonexFolder; }; } = await api.put(`/folders/${folderData.folderId}`);

            // Update centralized state
            if (folderData.folderId) {
                updateFolderInState(folderData.folderId, folder);
            }

            return folder;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function moveItemIntoFolder(itemId: string, targetFolderId: string | null, itemType: "folder" | "file") {
        try {
            const { data: { data } } = await api.put("/folders/move", { itemId, targetFolderId: targetFolderId ?? null, itemType });

            if (data.success) {
                // Refresh folders to get updated structure
                await refreshFolders();
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

            // Remove from centralized state
            deleteFolderFromState(id);

            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        createFolder,
        updateFolder,
        deleteFolder,
        moveItemIntoFolder
    };
}
