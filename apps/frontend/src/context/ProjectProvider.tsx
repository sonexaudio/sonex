import type React from "react";
import {
    createContext,
    useCallback,
} from "react";
import { useParams } from "react-router";
import { useClients, type Client } from "../hooks/useClients";

import { useProjectData, type SingleProjectViewData } from "../hooks/projects/useProjectData";
import { useProjectAccess, type AccessLevel } from "../hooks/projects/useProjectAccess";
import { useBuildFileTree } from "../hooks/projects/useBuildFileTree";
import { useQueryClient } from "@tanstack/react-query";
import { useFolders, type CreateFolderParams } from "../hooks/useFolders";
import useFiles from "../hooks/useFiles";

export interface ProjectContextType extends SingleProjectViewData {
    // Auth & access
    isOwner: boolean;
    isClient: boolean;
    isUnauthorized: boolean;
    isUnknown: boolean;
    accessLevel: AccessLevel;
    changeAccessLevel: (level: AccessLevel) => void;

    // Project data
    projectId?: string;
    fileTree: ReturnType<typeof useBuildFileTree>;

    // Project actions
    addClientToProject: (projectId: string, clientData: Partial<Client>) => Promise<void>;
    removeClientFromProject: (projectId: string, clientId: string) => Promise<void>;
    createProjectFolder: (folderData: CreateFolderParams) => Promise<void>;
    moveItemIntoFolder: (data: { itemId: string; targetFolderId: string; itemType: "folder" | "file"; }) => Promise<void>;
    deleteProjectFolder: (folderId: string) => Promise<void>;
    deleteProjectFile: (fileId: string) => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const PROJECT_ACCESS_LEVELS = {
    OWNER: "OWNER",
    CLIENT: "CLIENT",
    UNAUTHORIZED: "UNAUTHORIZED",
    UNKNOWN: "UNKNOWN",
};

// The ProjectProvider provides all data and functions pertaining to the current project
// It is used to fetch and store all data pertaining to the current project
// It uses all of the necessary hooks to fetch and store the data collectively in itself
// This prevents having to call the same functions from different hooks repeatedly in different places
// My aim is to prevent multiple calls to the api just to get the same data
// This Context is ONLY provided around components that need the data of a single project
export const ProjectProvider: React.FC<{ children: React.ReactNode; }> = ({
    children
}) => {
    const queryClient = useQueryClient();
    const { id: projectId } = useParams();

    const projectData = useProjectData(projectId);
    const { accessLevel, changeAccessLevel } = useProjectAccess({
        project: projectData.project,
        clientEmail: projectData.client?.email,
        userId: projectData.user?.id
    });
    const { addToProject, removeFromProject } = useClients();
    const { createFolder, deleteFolder, moveItemIntoFolder: moveItemIntoFolderApi } = useFolders();
    const { deleteFile: deleteFileApi } = useFiles();

    const { files, folders } = projectData

    const fileTree = useBuildFileTree(files, folders);

    console.log("Project Data", projectData);
    console.log("FILE TREE", fileTree)

    // ======== Functions ======

    // Client-related
    const addClientToProject = useCallback(async (projectId: string, clientData: Partial<Client>) => {
        await addToProject({ projectId, clientData });
    }, [addToProject]);

    const removeClientFromProject = useCallback(async (projectId: string, clientId: string) => {
        await removeFromProject(clientId);
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }, [removeFromProject, queryClient]);

    // Folder-related
    const createProjectFolder = useCallback(async (folderData: CreateFolderParams) => {
        await createFolder(folderData);
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }, [createFolder, queryClient]);

    const moveItemIntoFolder = useCallback(async (data: {
        itemId: string;
        targetFolderId: string | null;
        itemType: "folder" | "file";
    }) => {
        await moveItemIntoFolderApi(data);
        // Invalidate files and folders queries so the file tree updates
        queryClient.invalidateQueries({ queryKey: ["files"] });
        queryClient.invalidateQueries({ queryKey: ["folders", projectId, "all"] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }, [moveItemIntoFolderApi, queryClient]);

    const deleteProjectFolder = useCallback(async (folderId: string) => {
        await deleteFolder(folderId);
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }, [deleteFolder, queryClient]);

    // File-related
    const deleteProjectFile = useCallback(async (fileId: string) => {
        await deleteFileApi(fileId);
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }, [deleteFileApi, queryClient]);

    // computed data
    const isOwner = accessLevel === PROJECT_ACCESS_LEVELS.OWNER;
    const isClient = accessLevel === PROJECT_ACCESS_LEVELS.CLIENT;
    const isUnauthorized = accessLevel === PROJECT_ACCESS_LEVELS.UNAUTHORIZED;
    const isUnknown = accessLevel === PROJECT_ACCESS_LEVELS.UNKNOWN;

    const contextValues = {
        // auth
        isOwner,
        isClient,
        isUnauthorized,
        isUnknown,
        accessLevel,
        changeAccessLevel,

        // project data
        // rest of project data
        ...projectData,
        fileTree,
        projectId,

        // functions
        addClientToProject,
        removeClientFromProject,
        createProjectFolder,
        moveItemIntoFolder,
        deleteProjectFolder,
        deleteProjectFile,
    };

    return <ProjectContext.Provider value={contextValues}>
        {children}
    </ProjectContext.Provider>;
};

