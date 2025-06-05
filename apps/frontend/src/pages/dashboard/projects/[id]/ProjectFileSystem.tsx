import { useState } from "react";
import { useFileSystem } from "../../../../hooks/useFileSystem";
import { useFolders, type ISonexFolder } from "../../../../hooks/useFolders";
import type { SonexFile } from "../../../../types/files";
import { formatFileSize } from "../../../../utils/files";
import { AudioWaveformIcon, ChevronRightIcon, FolderIcon } from "lucide-react";
import DraggableItem from "../../../../components/DraggableItem";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";


const FileNode = ({ file }: { file: SonexFile; }) => {
    return (
        <DraggableItem
            id={file.id}
            itemType="file"
        >
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-violet-600 text-white w-full text-sm cursor-grab active:cursor-grabbing">
                <AudioWaveformIcon className="size-4" /> {file.name} - {formatFileSize(file.size)}
            </div>
        </DraggableItem>
    );
};

const FolderNode = ({ folder }: { folder: ISonexFolder; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { setNodeRef, isOver } = useDroppable({
        id: folder.id,
        data: {
            type: "folder"
        }
    });
    const hasFolders = folder.subfolders && folder.subfolders.length > 0;
    const hasFiles = folder.files && folder.files.length > 0;

    return (
        <div className="mb-2">
            <DraggableItem id={folder.id} itemType="folder">
                <div
                    ref={setNodeRef}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded font-medium transition-all cursor-grab active:cursor-grabbing
            ${isOver ? "bg-zinc-700 scale-[1.01]" : "bg-zinc-900"} text-white`}>
                    <div className="flex items-center gap-2">
                        <FolderIcon className="size-5 text-white" />
                        {folder.name}
                    </div>
                    {(hasFolders || hasFiles) && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen((prev) => !prev);
                            }}
                        >
                            <ChevronRightIcon
                                className={`transition-transform duration-100 size-5 text-white ${isOpen ? "rotate-90" : ""}`}
                            />
                        </button>
                    )}
                </div>
            </DraggableItem>
            {/* Folder Children */}
            {isOpen && (
                <div className="pl-6">
                    <div>
                        {folder.files?.map((file) => (
                            <FileNode key={file.id} file={file} />
                        ))}
                    </div>
                    {/* Recurse into subfolders */}
                    <div>
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
    const { setNodeRef: rootSetNodeRef, isOver: rootIsOver } = useDroppable({
        id: "ROOT",
        data: { type: "root" },
    });

    const { moveItemIntoFolder } = useFolders();

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
        <DndContext onDragEnd={handleDragEnd}>
            <div ref={rootSetNodeRef} className={`p-6 border my-6 rounded-md transition-colors
          ${rootIsOver ? "bg-zinc-800" : "scale-[1.1]"}`}>
                <div>
                    <h3 className="text-lg font-semibold">Files</h3>
                    <hr className="mb-4" />
                </div>

                {/* Top level folders */}
                <div>
                    {fileTree.map((folder) => (
                        <FolderNode key={folder.id} folder={folder} />
                    ))}
                </div>
                {/* Root Level Files */}
                {rootFiles
                    .filter((f) => !f.folderId)
                    .map((file) => (
                        <FileNode key={file.id} file={file} />
                    ))}
            </div>
        </DndContext>
    );
};

export default ProjectFileSystem;
