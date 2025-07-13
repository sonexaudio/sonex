import { useMemo } from "react";
import type { ISonexFolder } from "./useFolders";
import type { SonexFile } from "../types/files";
import { buildFolderTree } from "../utils/fileTree";
import { useProjectContext } from "../context/ProjectProvider";

export function useFileSystem() {
    const { files, folders, filesLoading, foldersLoading } = useProjectContext();

    const { tree: folderTree, rootFiles } = useMemo(() => {
        const rootFiles = files.filter(file => !file.folderId);
        const tree = buildFolderTree(folders, files);

        return { tree, rootFiles };
    }, [folders, files]);

    return {
        tree: folderTree,
        rootFiles,
        loading: filesLoading || foldersLoading,
    };
}
