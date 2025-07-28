import type React from "react";
import {
    createContext,
    useContext,
    useCallback,
    useEffect,
} from "react";
import type { DetailedProject } from "../types/projects";
import { useParams } from "react-router";
import { useClients, type Client } from "../hooks/useClients";
import { useAuth } from "../hooks/useAuth";
import useClientAuth from "../hooks/useClientAuth";
import { useProjectData, type SingleProjectViewData } from "../hooks/projects/useProjectData";
import { useProjectAccess } from "../hooks/projects/useProjectAccess";
import { useBuildFileTree } from "../hooks/projects/useBuildFileTree";
import type { SonexFile } from "../types/files";
import type { ISonexFolder } from "../hooks/useFolders";

interface ProjectContextType {
    projectData: SingleProjectViewData;
    files: SonexFile[];
    folders: ISonexFolder[];
    fileTree: ReturnType<typeof useBuildFileTree>;
    accessLevel: string;
    addClient: (projectId: string, clientData: Partial<Client>) => Promise<Client | null>;
    removeClient: (projectId: string, clientId: string) => Promise<void>;
    isOwner: boolean;
    isClient: boolean;
    isUnauthorized: boolean;
    isUnknown: boolean;
    currentUser: ReturnType<typeof useAuth>["user"];
    currentClient: ReturnType<typeof useClientAuth>["client"];
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const PROJECT_ACCESS_LEVELS = {
    OWNER: "owner",
    CLIENT: "client",
    UNAUTHORIZED: "unauthorized",
    UNKNOWN: "unknown",
};

// The ProjectProvider provides all data and functions pertaining to the current project
// It is used to fetch and store all data pertaining to the current project
// It uses all of the necessary hooks to fetch and store the data collectively in itself
// This prevents having to call the same functions from different hooks repeatedly in different places
// My aim is to prevent multiple calls to the api just to get the same data
// This Context is ONLY provided around components that need the data of a single project
export const ProjectProvider: React.FC<{ children: React.ReactNode; }> = ({
    children,
}) => {
    const { user } = useAuth();
    const { client } = useClientAuth();
    const { id: projectId } = useParams();
    const projectData = useProjectData(projectId);
    const accessLevel = useProjectAccess({ userId: user?.id, clientEmail: client?.email, project: projectData?.project as DetailedProject | null });
    const fileTree = useBuildFileTree(projectData?.files || [], projectData?.folders || []);
    const { addClientToProject, removeClientFromProject } = useClients();

    // Project management functions
    const addClient = useCallback(
        async (projectId: string, clientData: Partial<Client>) => {
            try {
                const result = await addClientToProject(projectId, clientData);
                if (!result) {
                    console.error("Failed to add client to project");
                    throw new Error("Failed to add client to project");
                }
                await projectData?.refetchProject();
                return result;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [addClientToProject, projectData?.refetchProject],
    );
    const removeClient = useCallback(async (projectId: string, clientId: string) => {
        try {
            await removeClientFromProject(projectId, clientId);
            await projectData?.refetchProject();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [removeClientFromProject, projectData?.refetchProject]);

    // Computed values
    const isOwner = accessLevel === PROJECT_ACCESS_LEVELS.OWNER;
    const isClient = accessLevel === PROJECT_ACCESS_LEVELS.CLIENT;
    const isUnauthorized = accessLevel === PROJECT_ACCESS_LEVELS.UNAUTHORIZED;
    const isUnknown = accessLevel === PROJECT_ACCESS_LEVELS.UNKNOWN;

    // Load initial data
    useEffect(() => {
        if (!projectId || projectData?.isLoading) return;

        projectData?.fetchAllProjectData().then(() => console.log("Fetched all project data"));
    }, [projectId]);

    const contextValues = {
        ...projectData,
        currentUser: user,
        currentClient: client,
        fileTree,
        accessLevel,
        addClient,
        removeClient,
        isOwner,
        isClient,
        isUnauthorized,
        isUnknown
    };

    return (
        <ProjectContext.Provider value={contextValues}>
            {children}
        </ProjectContext.Provider>
    );
};
