import type React from "react";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

import type { DetailedProject } from "../types/projects";
import type { SonexFile } from "../types/files";
import type { ISonexFolder } from "../hooks/useFolders";
import { useParams } from "react-router";

import type { Client } from "../hooks/useClients";

import { useAuth } from "../hooks/useAuth";
import useClientAuth from "../hooks/useClientAuth";
import type { User } from "../types/users";
import api from "../lib/axios";

// type ProjectContextValue = {
//     project: ProjectWithUserInfo | null;
//     loading: boolean;
//     refreshProject: () => void;
//     // File management
//     files: SonexFile[];
//     filesLoading: boolean;
//     refreshFiles: () => Promise<void>;
//     addFileToState: (file: SonexFile) => void;
//     deleteFileFromState: (id: string) => void;
//     // Client management
//     clients: Client[];
//     clientsLoading: boolean;
//     refreshClients: () => Promise<void>;
//     addClientToState: (client: Client) => void;
//     updateClientInState: (id: string, clientData: Partial<Client>) => void;
//     deleteClientFromState: (id: string) => void;
//     // Folder management
//     folders: ISonexFolder[];
//     foldersLoading: boolean;
//     refreshFolders: () => Promise<void>;
//     addFolderToState: (folder: ISonexFolder) => void;
//     updateFolderInState: (id: string, folderData: Partial<ISonexFolder>) => void;
//     deleteFolderFromState: (id: string) => void;
// };

// const ProjectContext = createContext<ProjectContextValue | undefined>(
//     undefined,
// );

type FolderNode = ISonexFolder & { children: FolderNode[]; files: SonexFile[]; };
type FileTree = { _rootFiles?: SonexFile[]; _rootFolders?: FolderNode[]; };

const ProjectContext = createContext(null);

export const PROJECT_ACCESS_LEVELS = {
    OWNER: "owner",
    CLIENT: "client",
    UNAUTHORIZED: "unauthorized",
    UNKNOWN: "unknown",
};

// loading states
const LOADING_STATES = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error",
};

export const useProjectContext = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx)
        throw new Error("useProjectContext must be used within ProjectProvider");
    return ctx;
};

// The ProjectProvider provides all data and functions pertaining to the current project
// It is used to fetch and store all data pertaining to the current project
// It uses all of the necessary hooks to fetch and store the data collectively in itself
// This prevents having to call the same functions from different hooks repeatedly in different places
// My aim is to prevent multiple calls to the api just to get the same data
// This Context is ONLY provided around components that need the data of a single project

// export const ProjectProvider = ({ children }: { children: ReactNode; }) => {
//     const { id } = useParams();

//     const projectValues = useProjects();
//     const clientValues = useClients();
//     const fileValues = useFiles();
//     const folderValues = useFolders();
//     const commentValues = useComments();

//     const [hasFetched, setHasFetched] = useState(false);

//     // Get the details of the current project
//     useEffect(() => {
//         if (id && !hasFetched) {
//             projectValues.fetchSingleProject(id);
//         }
//     }, [id, hasFetched, projectValues.currentProject?.id]);

//     // Fetch all details if their is a project
//     // Once this is done, set hasFetched to true
//     useEffect(() => {
//         if (projectValues.currentProject && !hasFetched) {
//             clientValues.fetchClients();
//             fileValues.fetchFiles();
//             folderValues.fetchFolders({});
//             commentValues.fetchComments();
//             setHasFetched(true);
//         }
//     }, [id, hasFetched, projectValues.currentProject?.id]);

//     // Manipulate data to only provide project specific data
//     // This may be expensive, so I'll use useMemo to prevent unnecessary re-renders
//     const projectClients = useMemo(() => {
//         return clientValues.clients.filter(client => client.projectId === id);
//     }, [id, clientValues.clients]);

//     const projectFiles = useMemo(() => {
//         return fileValues.files.filter(file => file.projectId === id);
//     }, [id, fileValues.files]);

//     const projectFolders = useMemo(() => {
//         return folderValues.folders.filter(folder => folder.projectId === id);
//     }, [id, folderValues.folders]);

//     const projectComments = useMemo(() => {
//         return commentValues.comments.filter(comment => comment.fileId === fileValues.currentFile?.id);
//     }, [id, fileValues.currentFile?.id]);

//     // Functions to keep state up to date
//     const refreshProject = useCallback(async () => {
//         if (id) {
//             await projectValues.fetchSingleProject(id);
//         }
//     }, []);

//     const refreshFiles = useCallback(async () => {
//         if (id) {
//             await fileValues.fetchFiles();
//         }
//     }, []);

//     const values = useMemo(() => ({
//         // project data
//         project: projectValues.currentProject,
//         clients: projectClients,
//         files: projectFiles,
//         folders: projectFolders,
//         comments: projectComments,

//         // functions
//         refreshProject,
//         refreshFiles,

//         // loading states
//         projectLoading: projectValues.loading,
//         filesLoading: fileValues.loading,

//     }), [
//         projectValues.currentProject,
//         projectClients,
//         projectFiles,
//         projectFolders,
//         projectComments,
//         refreshProject,
//         refreshFiles,
//         projectValues.loading,
//         fileValues.loading,
//     ]);

//     return (
//         <ProjectContext.Provider value={values}>
//             {children}
//         </ProjectContext.Provider>
//     );
// };

export const ProjectProvider: React.FC<{ children: React.ReactNode; }> = ({
    children,
}) => {
    const { id: projectId } = useParams();

    // get current user or client auth data from hooks
    const { user: currentUser } = useAuth();
    const { client: currentClient, loading: clientAuthLoading } = useClientAuth();

    // Core project data
    const [project, setProject] = useState<DetailedProject | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [activities, setActivities] = useState([]);
    const [comments, setComments] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // User/client access data
    const [accessLevel, setAccessLevel] = useState(
        PROJECT_ACCESS_LEVELS.UNKNOWN,
    );
    const [authorizedClient, setAuthorizedClient] = useState<Client | null>(null);
    const [projectOwner, setProjectOwner] = useState<User | null>(null);
    const [ownerSubscriptionStatus, setOwnerSubscriptionStatus] = useState(null);

    // Loading and error states
    const [loadingStates, setLoadingStates] = useState({
        project: LOADING_STATES.IDLE,
        files: LOADING_STATES.IDLE,
        folders: LOADING_STATES.IDLE,
        fileTree: LOADING_STATES.IDLE,
        activities: LOADING_STATES.IDLE,
        comments: LOADING_STATES.IDLE,
        transactions: LOADING_STATES.IDLE,
        ownerSubscription: LOADING_STATES.IDLE,
    });

    const [errors, setErrors] = useState<Record<string, Error | null>>({});

    // Utility function to update loading state
    const updateLoadingState = useCallback(
        (
            key: keyof typeof loadingStates,
            state: (typeof LOADING_STATES)[keyof typeof LOADING_STATES],
        ): void => {
            setLoadingStates((prev) => ({ ...prev, [key]: state }));
        },
        [],
    );

    // Utility function to update error state
    const setError = useCallback(
        (key: keyof typeof errors, error: Error | null): void => {
            setErrors((prev) => ({ ...prev, [key]: error }));
        },
        [],
    );

    // Determine access level
    const determineAccessLevel = useCallback(
        (
            project: DetailedProject,
            currentUser: User | Client | null,
            currentUserEmail?: string,
        ): string => {
            if (!project) return PROJECT_ACCESS_LEVELS.UNAUTHORIZED;

            // is the current user the owner of the project?
            if (currentUser?.id === project.userId) {
                console.log("current user is the owner of the project");
                setProjectOwner(currentUser as User);
                return PROJECT_ACCESS_LEVELS.OWNER;
            }

            // is the current user an authorized client of the project?
            // TODO: Check if the client is authorized to view the project
            // TODO: Check if the client is blocked from the project
            // Will need to build a new model to store ProjectClients or ProjectPermissions
            if (currentUserEmail || (currentUser as Client)?.email) {
                const email = currentUserEmail || (currentUser as Client).email;
                const authorizedClient = project.clients?.find(
                    (client) => client.email === email && client.isBlocked === false,
                );

                if (authorizedClient) {
                    setAuthorizedClient(authorizedClient);
                    return PROJECT_ACCESS_LEVELS.CLIENT;
                }

                return PROJECT_ACCESS_LEVELS.UNAUTHORIZED;
            }

            return PROJECT_ACCESS_LEVELS.UNKNOWN;
        },
        [],
    );

    // API call functions
    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}`);
            console.log("PROJECT DATA", data);
            setProject(data.project);
            setClients(
                data.project.clients.map((client) => ({
                    ...client,
                    ...client.client,
                })) || [],
            );
            setFiles(data.project.files || []);

            // Determine access level
            const accessLevel = determineAccessLevel(
                data.project,
                currentUser,
                currentClient?.email,
            );
            setAccessLevel(accessLevel);

            updateLoadingState("project", LOADING_STATES.SUCCESS);
            return data.project;
        } catch (error) {
            setError("project", error as Error);
            updateLoadingState("project", LOADING_STATES.ERROR);
            throw error;
        }
    }, [
        projectId,
        currentUser,
        currentClient,
        determineAccessLevel,
        updateLoadingState,
        setError,
    ]);

    const fetchFolders = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("folders", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/folders`);
            setFolders(data.folders);
            updateLoadingState("folders", LOADING_STATES.SUCCESS);
            return data.folders;
        } catch (error) {
            setError("folders", error as Error);
            updateLoadingState("folders", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, setError]);

    const fetchActivities = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("activities", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/activities`);
            setActivities(data.activities);
            updateLoadingState("activities", LOADING_STATES.SUCCESS);
            return data.activities;
        } catch (error) {
            setError("activities", error as Error);
            updateLoadingState("activities", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, setError]);

    const fetchComments = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("comments", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/comments`);
            setComments(data.comments);
            updateLoadingState("comments", LOADING_STATES.SUCCESS);
            return data.comments;
        } catch (error) {
            setError("comments", error as Error);
            updateLoadingState("comments", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, setError]);

    const fetchTransactions = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("transactions", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/transactions`);
            setTransactions(data.transactions);
            updateLoadingState("transactions", LOADING_STATES.SUCCESS);
            return data.transactions;
        } catch (error) {
            setError("transactions", error as Error);
            updateLoadingState("transactions", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, setError]);

    const fetchOwnerSubscription = useCallback(async () => {
        if (!project?.userId) return;
        updateLoadingState("ownerSubscription", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/users/${project.userId}/subscription-status`);
            setOwnerSubscriptionStatus(data.subscriptionStatus);
            updateLoadingState("ownerSubscription", LOADING_STATES.SUCCESS);
            return data.subscriptionStatus;
        } catch (error) {
            setError("ownerSubscription", error as Error);
            updateLoadingState("ownerSubscription", LOADING_STATES.ERROR);
            throw error;
        }
    }, [project?.userId, updateLoadingState, setError]);

    // Project management functions
    const addClientToProject = useCallback(
        async (clientData: Partial<Client>) => {
            setErrors({});
            try {
                const {
                    data: { data },
                } = await api.post("/clients", clientData);
                if (data?.client) {
                    setProject((prev) => ({
                        ...prev,
                        clients: [...(prev?.clients || []), data.client],
                    }));
                }
                return data?.client;
            } catch (error) {
                throw error;
            }
        },
        [projectId],
    );

    const buildFileTree = useCallback(
        (folders: ISonexFolder[], files: SonexFile[]) => {
            const folderMap: Record<string, FolderNode> = {};
            const tree: FileTree = {};

            // Build out the folder structure
            folders.forEach((folder) => {
                folderMap[folder.id] = {
                    ...folder,
                    children: [],
                    files: [],
                };
            });

            // Organize folders into the tree
            folders.forEach((folder) => {
                if (folder.parentId) {
                    if (folderMap[folder.parentId]) {
                        folderMap[folder.parentId].children.push(folderMap[folder.id]);
                    }
                } else {
                    if (!tree._rootFolders) tree._rootFolders = [];
                    tree._rootFolders.push(folderMap[folder.id]);
                }
            });

            // Add root files and files in a folder to the tree
            files.forEach((file) => {
                if (file.folderId && folderMap[file.folderId]) {
                    folderMap[file.folderId].files.push(file);
                } else {
                    if (!tree._rootFiles) tree._rootFiles = [];
                    tree._rootFiles.push(file);
                }
            });

            return tree;
        },
        [],
    );

    // refetch functions
    const refetchProject = useCallback(() => fetchProject(), [fetchProject]);
    const refetchFolders = useCallback(() => fetchFolders(), [fetchFolders]);
    const refetchActivities = useCallback(
        () => fetchActivities(),
        [fetchActivities],
    );
    const refetchComments = useCallback(() => fetchComments(), [fetchComments]);
    const refetchTransactions = useCallback(
        () => fetchTransactions(),
        [fetchTransactions],
    );
    const refetchOwnerSubscription = useCallback(
        () => fetchOwnerSubscription(),
        [fetchOwnerSubscription],
    );

    const refetchAllProjectData = useCallback(async () => {
        const promises = [
            fetchProject(),
            fetchFolders(),
            fetchActivities(),
            fetchComments(),
            fetchTransactions(),
        ];
        if (project?.userId) {
            promises.push(fetchOwnerSubscription());
        }
        await Promise.allSettled(promises);
    }, [
        fetchProject,
        fetchFolders,
        fetchActivities,
        fetchComments,
        fetchTransactions,
        fetchOwnerSubscription,
        project?.userId,
    ]);

    // Build/update the file tree when the folders or files change
    useEffect(() => {
        if (folders.length > 0 || files.length > 0) {
            const tree = buildFileTree(folders, files);
            setFileTree(tree);
        }
    }, [folders, files, buildFileTree]);

    useEffect(() => {
        // If still loading client info, don't run access logic yet
        if (clientAuthLoading) return;

        console.log("CURRENT USER", currentUser);
        console.log("CURRENT CLIENT", currentClient);
        console.log("PROJECT", project);


        if (currentUser?.id === project?.userId) {
            setAccessLevel(PROJECT_ACCESS_LEVELS.OWNER);
        } else if (currentClient?.id && !currentClient.isBlocked) {
            setAccessLevel(PROJECT_ACCESS_LEVELS.CLIENT);
            setAuthorizedClient(currentClient);
        } else if (currentClient?.isBlocked) {
            setAccessLevel(PROJECT_ACCESS_LEVELS.UNAUTHORIZED);
        } else {
            setAccessLevel(PROJECT_ACCESS_LEVELS.UNKNOWN);
        }
    }, [currentUser, currentClient, clientAuthLoading, project?.userId]);

    // Let's load the data upon mounting
    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    // load additional data if the project is loaded
    useEffect(() => {
        if (project && accessLevel !== PROJECT_ACCESS_LEVELS.UNAUTHORIZED) {
            Promise.allSettled([
                fetchFolders(),
                fetchActivities(),
                fetchComments(),
                fetchTransactions(),
                fetchOwnerSubscription(),
            ]);
        }
    }, [
        project,
        accessLevel,
        fetchFolders,
        fetchActivities,
        fetchComments,
        fetchTransactions,
        fetchOwnerSubscription,
    ]);



    // Computed values
    const isLoading = Object.values(loadingStates).some(
        (state) => state === LOADING_STATES.LOADING,
    );
    const hasErrors = Object.values(errors).length > 0;
    const isOwner = accessLevel === PROJECT_ACCESS_LEVELS.OWNER;
    const isClient = accessLevel === PROJECT_ACCESS_LEVELS.CLIENT;
    const isUnauthorized = accessLevel === PROJECT_ACCESS_LEVELS.UNAUTHORIZED;

    const contextValue = {
        // Core project data
        project,
        clients,
        files,
        folders,
        fileTree,
        activities,
        comments,
        transactions,

        // Access control
        accessLevel,
        authorizedClient,
        projectOwner,
        ownerSubscriptionStatus,
        isOwner,
        isClient,
        isUnauthorized,

        // Loading and error states
        loadingStates,
        errors,
        isLoading,
        hasErrors,

        // TODO: permission checks for the authorized client

        // Project management functions
        addClientToProject,

        // Refetch functions
        refetchProject,
        refetchFolders,
        refetchActivities,
        refetchComments,
        refetchTransactions,
        refetchOwnerSubscription,
        refetchAllProjectData,

        // TODO: payment functions

        // Utility
        ACCESS_LEVELS: PROJECT_ACCESS_LEVELS,
        LOADING_STATES,
    };

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};
