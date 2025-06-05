import { useEffect, useMemo, useState } from "react";
import type { ISonexFolder } from "./useFolders";
import type { SonexFile } from "../types/files";
import { useParams } from "react-router";
import api from "../lib/axios";
import { buildFolderTree } from "../utils/fileTree";

export function useFileSystem() {
    const [folders, setFolders] = useState<ISonexFolder[]>([]);
    const [files, setFiles] = useState<SonexFile[]>([]);

    const { id: projectId } = useParams();

    useEffect(() => {
        async function fetchData() {
            try {
                const [folderRes, fileRes] = await Promise.all([
                    api.get("/folders", { params: { projectId } }),
                    api.get("/files", { params: { projectId } })
                ]);
                setFolders(folderRes.data.data.folders);
                setFiles(fileRes.data.data.files);
            } catch (error) {
                console.error("Failed to get filesystem", error);
            }
        }
        if (projectId) fetchData();
    }, [projectId]);

    const { tree: folderTree, rootFiles } = useMemo(() => {
        const rootFiles = files.filter(file => !file.folderId);
        const tree = buildFolderTree(folders, files);

        return { tree, rootFiles };
    }, [folders, files]);

    return {
        tree: folderTree,
        rootFiles,
    };
}
