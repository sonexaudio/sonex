import type { ISonexFolder } from "../hooks/useFolders";
import type { SonexFile } from "../types/files";


export function buildFolderTree(folders: ISonexFolder[], files: SonexFile[], parentId: string | null = null): ISonexFolder[] {

    return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => {
            const subfolders = buildFolderTree(folders, files, folder.id);
            const folderFiles = files.filter(file => file.folderId === folder.id);

            return {
                ...folder,
                files: folderFiles,
                subfolders
            };
        });
}