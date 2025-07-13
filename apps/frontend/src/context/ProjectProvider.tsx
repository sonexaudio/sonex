import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { ProjectWithUserInfo } from "../types/projects";
import type { SonexFile } from "../types/files";
import type { ISonexFolder } from "../hooks/useFolders";
import { useParams } from "react-router";
import useProjects from "../hooks/useProjects";
import api from "../lib/axios";
import type { Client } from "../hooks/useClients";

type ProjectContextValue = {
    project: ProjectWithUserInfo | null;
    loading: boolean;
    refreshProject: () => void;
    // File management
    files: SonexFile[];
    filesLoading: boolean;
    refreshFiles: () => Promise<void>;
    addFileToState: (file: SonexFile) => void;
    deleteFileFromState: (id: string) => void;
    // Client management
    clients: Client[];
    clientsLoading: boolean;
    refreshClients: () => Promise<void>;
    addClientToState: (client: Client) => void;
    updateClientInState: (id: string, clientData: Partial<Client>) => void;
    deleteClientFromState: (id: string) => void;
    // Folder management
    folders: ISonexFolder[];
    foldersLoading: boolean;
    refreshFolders: () => Promise<void>;
    addFolderToState: (folder: ISonexFolder) => void;
    updateFolderInState: (id: string, folderData: Partial<ISonexFolder>) => void;
    deleteFolderFromState: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(
    undefined,
);

export const useProjectContext = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx)
        throw new Error("useProjectContext must be used within ProjectProvider");
    return ctx;
};

export const ProjectProvider = ({ children }: { children: ReactNode; }) => {
    const { id } = useParams();
    const {
        getSingleProject,
        state: { currentProject },
        loading,
    } = useProjects();

    const [hasFetched, setHasFetched] = useState(false);

    // File state
    const [files, setFiles] = useState<SonexFile[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);

    // Client state
    const [clients, setClients] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);

    // Folder state
    const [folders, setFolders] = useState<ISonexFolder[]>([]);
    const [foldersLoading, setFoldersLoading] = useState(false);

    const refreshProject = useCallback(async () => {
        if (id) {
            getSingleProject(id);
        }
    }, [id, getSingleProject]);

    const refreshFiles = useCallback(async () => {
        if (!id) return;

        setFilesLoading(true);
        try {
            const {
                data: { data },
            } = await api.get("/files", { params: { projectId: id } });
            setFiles(data.files);
        } catch (error) {
            console.error("Failed to fetch files:", error);
        } finally {
            setFilesLoading(false);
        }
    }, [id]);

    const refreshClients = useCallback(async () => {
        setClientsLoading(true);
        try {
            const {
                data: { data },
            } = await api.get("/clients");
            if (data) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setClientsLoading(false);
        }
    }, []);

    const refreshFolders = useCallback(async () => {
        if (!id) return;

        setFoldersLoading(true);
        try {
            const {
                data: { data },
            } = await api.get("/folders", { params: { projectId: id } });
            setFolders(data.folders);
        } catch (error) {
            console.error("Failed to fetch folders:", error);
        } finally {
            setFoldersLoading(false);
        }
    }, [id]);

    const addFileToState = useCallback((file: SonexFile) => {
        setFiles((prev) => [...prev, file]);
    }, []);

    const deleteFileFromState = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
    }, []);

    const addClientToState = useCallback((client: Client) => {
        setClients((prev) => [...prev, client]);
    }, []);

    const updateClientInState = useCallback(
        (id: string, clientData: Partial<Client>) => {
            setClients((prev) =>
                prev.map((client) =>
                    client.id === id ? { ...client, ...clientData } : client,
                ),
            );
        },
        [],
    );

    const deleteClientFromState = useCallback((id: string) => {
        setClients((prev) => prev.filter((client) => client.id !== id));
    }, []);

    const addFolderToState = useCallback((folder: ISonexFolder) => {
        setFolders((prev) => [...prev, folder]);
    }, []);

    const updateFolderInState = useCallback(
        (id: string, folderData: Partial<ISonexFolder>) => {
            setFolders((prev) =>
                prev.map((folder) =>
                    folder.id === id ? { ...folder, ...folderData } : folder,
                ),
            );
        },
        [],
    );

    const deleteFolderFromState = useCallback((id: string) => {
        setFolders((prev) => prev.filter((folder) => folder.id !== id));
    }, []);

    useEffect(() => {
        if (id && !hasFetched) {
            refreshProject();
            setHasFetched(true);
        }
    }, [id, hasFetched, refreshProject]);

    // Fetch files, clients, and folders when project changes
    useEffect(() => {
        if (currentProject?.id) {
            refreshFiles();
            refreshClients();
            refreshFolders();
        }
    }, [currentProject?.id, refreshFiles, refreshClients, refreshFolders]);

    const value = useMemo(
        () => ({
            project: currentProject as ProjectWithUserInfo | null,
            loading,
            refreshProject,
            files,
            filesLoading,
            refreshFiles,
            addFileToState,
            deleteFileFromState,
            clients,
            clientsLoading,
            refreshClients,
            addClientToState,
            updateClientInState,
            deleteClientFromState,
            folders,
            foldersLoading,
            refreshFolders,
            addFolderToState,
            updateFolderInState,
            deleteFolderFromState,
        }),
        [
            currentProject,
            loading,
            refreshProject,
            files,
            filesLoading,
            refreshFiles,
            addFileToState,
            deleteFileFromState,
            clients,
            clientsLoading,
            refreshClients,
            addClientToState,
            updateClientInState,
            deleteClientFromState,
            folders,
            foldersLoading,
            refreshFolders,
            addFolderToState,
            updateFolderInState,
            deleteFolderFromState,
        ],
    );

    return (
        <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
    );
};
