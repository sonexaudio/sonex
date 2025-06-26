import { useState } from "react";
import { useFileSystem } from "../../../../hooks/useFileSystem";
import { useFolders, type ISonexFolder } from "../../../../hooks/useFolders";
import type { SonexFile } from "../../../../types/files";
import { formatFileSize } from "../../../../utils/files";
import { AudioWaveformIcon, ChevronRightIcon, FolderIcon } from "lucide-react";
import DraggableItem from "../../../../components/DraggableItem";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate } from "react-router";


const FileNode = ({ file, isInEditMode }: { file: SonexFile; isInEditMode: boolean; }) => {
    const navigate = useNavigate();
    const projectId = file.projectId;

    const handleClick = () => {
        if (!isInEditMode) {
            // Navigate to the file page
            return navigate(`/projects/${projectId}/files/${file.id}`);
        }
    };

    const content = (
        <div className={`flex items-center gap-2 px-3 py-2 rounded w-full text-sm
                ${isInEditMode ? "bg-violet-600 text-white cursor-grab active:cursor-grabbing" : "bg-zinc-800 text-white cursor-pointer hover:bg-zinc-700"}`} onClick={handleClick}>
            <AudioWaveformIcon className="size-4" /> {file.name} - {formatFileSize(file.size)}
        </div>
    );
    return isInEditMode ? (
        <DraggableItem id={file.id} itemType="file">{content}</DraggableItem>
    ) : (
        content
    );
};

const FolderNode = ({ folder, isInEditMode }: { folder: ISonexFolder; isInEditMode: boolean; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { setNodeRef, isOver } = useDroppable({
        id: folder.id,
        data: {
            type: "folder"
        }
    });

    const handleClick = () => {
        if (!isInEditMode) setIsOpen((prev) => !prev);
    };

    const content = (
        <div
            ref={setNodeRef}
            onClick={handleClick}
            className={`flex items-center justify-between w-full px-3 py-2 rounded font-medium transition-all
            ${isOver ? "bg-zinc-700 scale-[1.01]" : "bg-zinc-900"} text-white
            ${isInEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer hover:bg-zinc-800"}`}
        >
            <div className="flex items-center gap-2">
                <FolderIcon className="size-5 text-white" />
                {folder.name}
            </div>
            {(folder.subfolders?.length || folder.files?.length) && (
                <ChevronRightIcon
                    className={`transition-transform duration-100 size-5 text-white ${isOpen ? "rotate-90" : ""}`}
                />
            )}
        </div>
    );

    return (
        <div className="mb-2">
            {isInEditMode ? (
                <DraggableItem id={folder.id} itemType="folder">{content}</DraggableItem>
            ) : (
                content
            )}
            {isOpen && (
                <div className="pl-6">
                    {folder.files?.map((file) => (
                        <FileNode key={file.id} file={file} isInEditMode={isInEditMode} />
                    ))}
                    {folder.subfolders?.map((subfolder) => (
                        <FolderNode key={subfolder.id} folder={subfolder} isInEditMode={isInEditMode} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectFileSystem = () => {
    const { tree: fileTree, rootFiles } = useFileSystem();
    const { setNodeRef: rootSetNodeRef, isOver: rootIsOver } = useDroppable({
        id: "ROOT",
        data: { type: "root" },
    });
    const { moveItemIntoFolder } = useFolders();

    const [isInEditMode, setIsInEditMode] = useState(false);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over?.id === active.id) return;

        // item to be moved details
        const itemType = active.data?.current?.type as "file" | "folder";
        const itemId = active.id as string;

        if (over?.data?.current?.type === "folder") {
            const targetFolderId = over.id as string;
            await moveItemIntoFolder(itemId, targetFolderId, itemType);
            return;
        }

        const isRootDrop = !over || over.data?.current?.type === "root";
        if (isRootDrop) {
            await moveItemIntoFolder(itemId, null, itemType);
            return;
        }

    };

    return (
        <div className="p-6 border my-6 rounded-lg flex flex-col">
            <button
                type="button"
                className="mb-4 self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                onClick={() => setIsInEditMode(prev => !prev)}
            >
                {isInEditMode ? "Done" : "Edit Mode"}
            </button>
            <div>
                <h3 className="text-lg font-semibold">Files</h3>
                <hr className="mb-4" />
            </div>
            {isInEditMode ? (
                <DndContext onDragEnd={handleDragEnd}>
                    <div ref={rootSetNodeRef}
                        className={`transition-colors
                      ${rootIsOver ? "bg-zinc-800 scale-[1.1]" : ""}`}
                    >
                        {/* Top level folders */}
                        <div>
                            {fileTree.map((folder) => (
                                <FolderNode key={folder.id} folder={folder} isInEditMode={isInEditMode} />
                            ))}
                        </div>
                        {/* Root Level Files */}
                        {rootFiles
                            .filter((f) => !f.folderId)
                            .map((file) => (
                                <FileNode key={file.id} file={file} isInEditMode={isInEditMode} />
                            ))}
                    </div>
                </DndContext>
            ) : (
                <div className={`transition-colors
          ${rootIsOver ? "bg-zinc-800 scale-[1.1" : ""}`}>
                    {/* Top level folders */}
                    <div>
                        {fileTree.map((folder) => (
                            <FolderNode key={folder.id} folder={folder} isInEditMode={isInEditMode} />
                        ))}
                    </div>
                    {/* Root Level Files */}
                    {rootFiles
                        .filter((f) => !f.folderId)
                        .map((file) => (
                            <FileNode key={file.id} file={file} isInEditMode={isInEditMode} />
                        ))}
                </div>
            )}
        </div>

    );
};

export default ProjectFileSystem;
