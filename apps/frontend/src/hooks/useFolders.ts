import {
    createFolder,
    deleteFolder,
    fetchFolders,
    moveItemIntoFolder,
    updateFolder,
    type ISonexFolder,
} from "./query-functions/folders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";

export type CreateFolderParams = {
    name: string;
    parentId?: string | null;
    projectId: string;
    folderId?: string;
};

export function useFolders() {
    const queryClient = useQueryClient();
    const { id: projectId } = useParams();

    const foldersQuery = useQuery({
        queryKey: ["folders", projectId, "all"],
        queryFn: ({ queryKey }) => {
            const [, projectId] = queryKey;
            return fetchFolders({ projectId });
        },
        enabled: !!projectId,
    });

    const create = useMutation({
        mutationFn: (newFolderData: CreateFolderParams) =>
            createFolder(newFolderData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["folders", projectId as string, "all"],
            });
        },
    });

    const update = useMutation({
        mutationFn: (updatedFolderData: Partial<CreateFolderParams>) =>
            updateFolder(updatedFolderData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["folders", projectId as string, "all"],
            });
        },
    });

    const move = useMutation({
        mutationFn: (moveFolderData: {
            itemId: string;
            targetFolderId: string | null;
            itemType: "folder" | "file";
        }) =>
            moveItemIntoFolder(
                moveFolderData.itemId,
                moveFolderData.targetFolderId,
                moveFolderData.itemType,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["folders", projectId as string, "all"],
            });
        },
    });

    const deleteSingle = useMutation({
        mutationFn: (folderId: string) => deleteFolder(folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["folders", projectId as string, "all"],
            });
        },
    });

    const isLoading =
        foldersQuery.isLoading ||
        create.isPending ||
        update.isPending ||
        move.isPending ||
        deleteSingle.isPending;

    const error =
        foldersQuery.error ||
        create.error ||
        update.error ||
        move.error ||
        deleteSingle.error

    return {
        folders: (foldersQuery.data as ISonexFolder[]) || [],
        isLoading,
        error,
        createFolder: create.mutateAsync,
        updateFolder: update.mutateAsync,
        deleteFolder: deleteSingle.mutateAsync,
        moveItemIntoFolder: move.mutateAsync,
    };
}
