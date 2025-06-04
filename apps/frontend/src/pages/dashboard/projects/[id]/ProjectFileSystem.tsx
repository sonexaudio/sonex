import { useState } from "react";
import { useFileSystem } from "../../../../hooks/useFileSystem";
import type { ISonexFolder } from "../../../../hooks/useFolders";
import type { SonexFile } from "../../../../types/files";
import { formatFileSize } from "../../../../utils/files";
import { ChevronRightIcon, FolderIcon } from "lucide-react";

const FileNode = ({ file }: { file: SonexFile; }) => {
    return (
        <div className="py-1 pl-2 border-l text-sm">
            📄 {file.name} ({formatFileSize(file.size)})
        </div>
    );
};

const FolderNode = ({ folder }: { folder: ISonexFolder; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasFolders = folder.subfolders && folder.subfolders.length > 0;
    const hasFiles = folder.files && folder.files.length > 0;

    return (
        <div className="my-2 border py-4 px-2 rounded-lg">
            <span className="font-bold flex items-center gap-1.5">
                {hasFolders ||
                    (hasFiles && (
                        <button type="button" onClick={() => setIsOpen(!isOpen)}>
                            <ChevronRightIcon
                                className={`size-6 text-gray-500 cursor-pointer transition duration-75 ${isOpen ? "rotate-90" : ""}`}
                            />
                        </button>
                    ))}

                <FolderIcon
                    className={`size-6 text-sky-500 ${!hasFolders && !hasFiles ? "ml-8" : ""}`}
                />

                {folder.name}
            </span>

            {/* Render files */}
            {isOpen && (
                <div>
                    <div className="pl-16">
                        {folder.files?.map((file) => (
                            <FileNode key={file.id} file={file} />
                        ))}
                    </div>
                    {/* Recurse into subfolders */}
                    <div className="pl-6">
                        {folder.subfolders?.map((subfolder) => (
                            <FolderNode key={subfolder.id} folder={subfolder} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectFileSystem = () => {
    const { tree: fileTree, rootFiles } = useFileSystem();

    return (
        <div className="p-6 border my-6 rounded-md">
            <div>
                <h3 className="text-lg font-semibold">Files</h3>
                <hr className="mb-4" />
            </div>
            <div>
                {fileTree.map((folder) => (
                    <FolderNode key={folder.id} folder={folder} />
                ))}
            </div>
            {/* Root Level Files */}
            {rootFiles
                .filter((f) => !f.folderId)
                .map((file) => (
                    <div key={file.id} className="px-8 border py-2">
                        📄 {file.name} ({formatFileSize(file.size)})
                    </div>
                ))}
        </div>
    );
};

export default ProjectFileSystem;
