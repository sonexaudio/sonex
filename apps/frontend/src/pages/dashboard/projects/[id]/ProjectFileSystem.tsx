import { useEffect, useState } from "react";
import { useFolders, type ISonexFolder } from "../../../../hooks/useFolders";
import type { SonexFile } from "../../../../types/files";
import { formatFileSize } from "../../../../utils/files";
import { AudioWaveformIcon, ChevronRightIcon, Download, ExternalLink, FolderIcon, MoreVertical, Trash } from "lucide-react";
import DraggableItem from "../../../../components/DraggableItem";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import useFiles from "../../../../hooks/useFiles";
import { useProjectContext } from "../../../../hooks/projects/useProjectContext";


const FileNode = ({ file, isInEditMode }: { file: SonexFile; isInEditMode: boolean; }) => {
    const navigate = useNavigate();
    const { deleteFile } = useFiles();
    const projectId = file.projectId;

    const handleClick = () => {
        if (!isInEditMode) {
            // Navigate to the file page
            return navigate(`/projects/${projectId}/files/${file.id}`);
        }
    };

    const handleDeleteFile = async () => {
        await deleteFile(file.id);
    };

    const content = (
        <div
            className={` flex items-center justify-between p-2 rounded-md w-full ${isInEditMode ? " bg-primary text-background cursor-grab active:cursor-grabbing hover:bg-primary/80" : "  cursor-pointer hover:bg-muted"}`}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <AudioWaveformIcon className="size-4" />
                </div>
                <div className="overflow-hidden">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(file.createdAt)} ago</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">More options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" onClick={handleClick}>
                                <ExternalLink className="mr-2 size-4" />
                                Open in new tab
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={file.streamUrl} download={file.name}>
                                <Download className="mr-2 size-4" />
                                Download
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDeleteFile}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash className="mr-2 size-4 text-destructive" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
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

    const handleToggleFolder = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent drag from starting
        setIsOpen((prev) => !prev);
    };

    const handleFolderClick = () => {
        if (!isInEditMode) {
            setIsOpen((prev) => !prev);
        }
    };

    const hasContent = folder.subfolders?.length || folder.files?.length;

    const content = (
        <div
            ref={setNodeRef}
            onClick={handleFolderClick}
            className={`flex items-center justify-between w-full px-3 py-2 rounded font-medium transition-all
            ${isOver ? "bg-zinc-700 scale-[1.01]" : "bg-zinc-900"} text-white
            ${isInEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer hover:bg-zinc-800"}`}
        >
            <div className="flex items-center gap-2">
                <FolderIcon className="size-5 text-white" />
                {folder.name}
            </div>
            {hasContent && (
                <div className="flex items-center gap-2">
                    {isInEditMode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleFolder}
                            className="h-6 w-6 p-0 text-white hover:bg-zinc-700"
                        >
                            <ChevronRightIcon
                                className={`transition-transform duration-100 size-4 ${isOpen ? "rotate-90" : ""}`}
                            />
                        </Button>
                    )}
                    {!isInEditMode && (
                        <ChevronRightIcon
                            className={`transition-transform duration-100 size-5 text-white ${isOpen ? "rotate-90" : ""}`}
                        />
                    )}
                </div>
            )}
        </div>
    );

    // if isInEditMode, automatically open the folder
    useEffect(() => {
        if (isInEditMode) {
            setIsOpen(true);
        }
    }, [isInEditMode]);

    return (
        <div className="mb-2">
            {isInEditMode ? (
                <DraggableItem id={folder.id} itemType="folder">{content}</DraggableItem>
            ) : (
                content
            )}
            {isOpen && (
                <div className="pl-6 mt-1">
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
    // const { tree: fileTree, rootFiles, loading } = useFileSystem();
    const { fileTree, projectData: { isLoading, refetchFolders, }, isOwner } = useProjectContext();

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
            await refetchFolders();
            return;
        }

        const isRootDrop = !over || over.data?.current?.type === "root";
        if (isRootDrop) {
            await moveItemIntoFolder(itemId, null, itemType);
            await refetchFolders();
            return;
        }

    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p>Loading files...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <div className="mb-2">
                        <h3 className="text-lg font-semibold">Files</h3>
                        <CardDescription>Files and folders related to this project</CardDescription>
                    </div>
                    <Button
                        type="button"
                        onClick={() => setIsInEditMode(prev => !prev)}
                        disabled={!isOwner}
                    >
                        {isInEditMode ? "Done" : "Edit Mode"}
                        {!isOwner && "(Project Owner Only)"}
                    </Button>
                </CardTitle>
                <Separator />
            </CardHeader>

            <CardContent>
                {isInEditMode ? (
                    <DndContext onDragEnd={handleDragEnd}>
                        <div ref={rootSetNodeRef}
                            className={`transition-colors
                      ${rootIsOver ? "scale-[1.1]" : ""}`}
                        >
                            {/* Top level folders */}
                            <div>
                                {fileTree._rootFolders?.map((folder) => (
                                    <FolderNode key={folder.id} folder={folder} isInEditMode={isInEditMode} />
                                ))}
                            </div>
                            {/* Root Level Files */}
                            {fileTree._rootFiles?.map((file) => (
                                <FileNode key={file.id} file={file} isInEditMode={isInEditMode} />
                            ))}
                        </div>
                    </DndContext>
                ) : (
                    <div
                        className={`transition-colors space-y-1
                        ${rootIsOver ? "scale-[1.1]" : ""}`}
                    >
                        {/* Top level folders */}
                        <div>
                            {fileTree._rootFolders?.map((folder) => (
                                <FolderNode key={folder.id} folder={folder} isInEditMode={isInEditMode} />
                            ))}
                        </div>
                        {/* Root Level Files */}
                        {fileTree._rootFiles?.map((file) => (
                            <FileNode key={file.id} file={file} isInEditMode={isInEditMode} />
                        ))}
                    </div>
                )}
            </CardContent>

        </Card>

    );
};

export default ProjectFileSystem;
