/* 
   
*/

import { useCallback, useMemo } from "react";
import type { SonexFile } from "../../types/files";
import type { ISonexFolder } from "../useFolders";

type FolderNode = ISonexFolder & { subfolders: FolderNode[]; files: SonexFile[]; };
type FileTree = { _rootFolders?: FolderNode[]; _rootFiles?: SonexFile[]; };

/**
 * Builds a memoized file tree from flat files and folders.
 * Returns an object with _rootFolders and _rootFiles.
 */
export function useBuildFileTree(files: SonexFile[], folders: ISonexFolder[]): FileTree {
    const buildFileTree = useCallback((folders: ISonexFolder[], files: SonexFile[]) => {
        const folderMap: Record<string, FolderNode> = {};
        const tree: FileTree = {};

        // Build out the folder structure
        folders.forEach((folder) => {
            folderMap[folder.id] = {
                ...folder,
                subfolders: [],
                files: [],
            };
        });

        // Organize folders into the tree
        folders.forEach((folder) => {
            if (folder.parentId) {
                if (folderMap[folder.parentId]) {
                    folderMap[folder.parentId].subfolders.push(folderMap[folder.id]);
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

    // Memoize the file tree so that it only rebuilds when files or folders completely change
    const fileTree = useMemo(() => buildFileTree(folders, files),
        [files, folders]);

    return fileTree;
}
