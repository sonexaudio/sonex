import { useMemo } from "react";
import { useProjectContext } from "../context/ProjectProvider";
import { useParams } from "react-router";

export function useProjectData() {
    const {
        project,
        files,
        clients,
        folders,
        filesLoading,
        clientsLoading,
        foldersLoading,
        loading: projectLoading
    } = useProjectContext();
    const { id: projectId } = useParams();

    // Filter files, clients, and folders for the current project
    const projectFiles = useMemo(() => {
        return files.filter(file => file.projectId === projectId);
    }, [files, projectId]);

    const projectClients = useMemo(() => {
        return clients.filter(client => client.projectId === projectId);
    }, [clients, projectId]);

    const projectFolders = useMemo(() => {
        return folders.filter(folder => folder.projectId === projectId);
    }, [folders, projectId]);

    return {
        project,
        files: projectFiles,
        clients: projectClients,
        folders: projectFolders,
        allFiles: files,
        allClients: clients,
        allFolders: folders,
        loading: projectLoading || filesLoading || clientsLoading || foldersLoading,
        filesLoading,
        clientsLoading,
        foldersLoading,
        projectLoading,
    };
} 