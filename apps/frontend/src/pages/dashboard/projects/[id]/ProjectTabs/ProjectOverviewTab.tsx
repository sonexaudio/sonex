import { TabsContent } from "../../../../../components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";

import { HardDrive, FileText, Users, Folder } from "lucide-react";
import { useMemo } from "react";
import type { ProjectWithUserInfo } from "../../../../../types/projects";
import ProjectActions from "../ProjectActions";
import ProjectDangerZone from "../ProjectDangerZone";
import UpdateProjectForm from "../UpdateProjectForm";
import type { SonexFile } from "../../../../../types/files";
import { useProjectContext } from "../../../../../hooks/projects/useProjectContext";

const ProjectOverviewTab = () => {
    const { project, files: { files }, folders: { folders }, isLoading, clients, isOwner } = useProjectContext();

    // Calculate storage usage
    const storageStats = useMemo(() => {
        const totalSize = files?.reduce((acc: number, file: SonexFile) => acc + (file.size || 0), 0) || 0;
        const fileCount = files?.length || 0;
        const clientCount = clients?.length || 0;
        const folderCount = folders?.length || 0;

        // Format file size
        const formatBytes = (bytes: number): string => {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        };

        // Calculate percentage (assuming 1GB limit for demo - you can adjust this)
        const maxStorage = 1024 * 1024 * 1024; // 1GB in bytes
        const usagePercentage = Math.min((totalSize / maxStorage) * 100, 100);

        return {
            totalSize,
            formattedSize: formatBytes(totalSize),
            fileCount,
            clientCount,
            folderCount,
            usagePercentage,
            maxStorage: formatBytes(maxStorage),
        };
    }, [files, clients, folders]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <TabsContent value="overview" className="space-y-6">
            {/* Storage Usage Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Storage Usage
                    </CardTitle>
                    <CardDescription>
                        Current storage usage for this project
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Storage Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Used Storage</span>
                            <span className="font-medium">
                                {storageStats.formattedSize} / {storageStats.maxStorage}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${storageStats.usagePercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {storageStats.usagePercentage.toFixed(1)}% of storage used
                        </p>
                    </div>

                    {/* Project Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{storageStats.fileCount}</p>
                                <p className="text-xs text-muted-foreground">Files</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {storageStats.clientCount}
                                </p>
                                <p className="text-xs text-muted-foreground">Clients</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Folder className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {storageStats.folderCount}
                                </p>
                                <p className="text-xs text-muted-foreground">Folders</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Project Details */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Basic information about this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Created
                                </dt>
                                <dd>
                                    {new Date(project?.createdAt as Date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Last Modified
                                </dt>
                                <dd>
                                    {new Date(project?.updatedAt as Date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Status
                                </dt>
                                <dd>{project?.status}</dd>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Description
                                </h3>
                                <p>{project?.description || "No description provided."}</p>
                            </div>
                        </dl>

                        <div className="my-8 flex flex-col lg:flex-row gap-2">
                            <ProjectActions isOwner={isOwner} project={project as ProjectWithUserInfo} />
                            <ProjectDangerZone />
                        </div>
                    </CardContent>
                </Card>

                <UpdateProjectForm project={project as ProjectWithUserInfo} />
            </div>
        </TabsContent>
    );
};

export default ProjectOverviewTab;
