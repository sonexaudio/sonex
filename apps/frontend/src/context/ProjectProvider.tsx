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
import { useFolders, type ISonexFolder } from "../hooks/useFolders";
import { useParams } from "react-router";
import useProjects from "../hooks/useProjects";
import { useClients, type Client } from "../hooks/useClients";
import useFiles from "../hooks/useFiles";
import { useComments } from "../hooks/useComments";

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

// The ProjectProvider provides all data and functions pertaining to the current project
// It is used to fetch and store all data pertaining to the current project
// It uses all of the necessary hooks to fetch and store the data collectively in itself
// This prevents having to call the same functions from different hooks repeatedly in different places
// My aim is to prevent multiple calls to the api just to get the same data
// This Context is ONLY provided around components that need the data of a single project

export const ProjectProvider = ({ children }: { children: ReactNode; }) => {
    const { id } = useParams();

    const projectValues = useProjects();
    const clientValues = useClients();
    const fileValues = useFiles();
    const folderValues = useFolders();
    const commentValues = useComments();

    const [hasFetched, setHasFetched] = useState(false);

    // Get the details of the current project
    useEffect(() => {
        if (id && !hasFetched) {
            projectValues.fetchSingleProject(id);
        }
    }, [id, hasFetched, projectValues.currentProject?.id]);

    // Fetch all details if their is a project
    // Once this is done, set hasFetched to true
    useEffect(() => {
        if (projectValues.currentProject && !hasFetched) {
            clientValues.fetchClients();
            fileValues.fetchFiles();
            folderValues.fetchFolders({});
            commentValues.fetchComments();
            setHasFetched(true);
        }
    }, [id, hasFetched, projectValues.currentProject?.id]);


    // Manipulate data to only provide project specific data
    // This may be expensive, so I'll use useMemo to prevent unnecessary re-renders
    const projectClients = useMemo(() => {
        return clientValues.clients.filter(client => client.projectId === id);
    }, [id, clientValues.clients]);

    const projectFiles = useMemo(() => {
        return fileValues.files.filter(file => file.projectId === id);
    }, [id, fileValues.files]);

    const projectFolders = useMemo(() => {
        return folderValues.folders.filter(folder => folder.projectId === id);
    }, [id, folderValues.folders]);

    const projectComments = useMemo(() => {
        return commentValues.comments.filter(comment => comment.fileId === fileValues.currentFile?.id);
    }, [id, fileValues.currentFile?.id]);

    // Functions to keep state up to date
    const refreshProject = useCallback(async () => {
        if (id) {
            await projectValues.fetchSingleProject(id);
        }
    }, []);

    const refreshFiles = useCallback(async () => {
        if (id) {
            await fileValues.fetchFiles();
        }
    }, []);

    const values = useMemo(() => ({
        // project data
        project: projectValues.currentProject,
        clients: projectClients,
        files: projectFiles,
        folders: projectFolders,
        comments: projectComments,

        // functions
        refreshProject,
        refreshFiles,

        // loading states
        projectLoading: projectValues.loading,
        filesLoading: fileValues.loading,

    }), [
        projectValues.currentProject,
        projectClients,
        projectFiles,
        projectFolders,
        projectComments,
        refreshProject,
        refreshFiles,
        projectValues.loading,
        fileValues.loading,
    ]);

    return (
        <ProjectContext.Provider value={values}>
            {children}
        </ProjectContext.Provider>
    );
};
