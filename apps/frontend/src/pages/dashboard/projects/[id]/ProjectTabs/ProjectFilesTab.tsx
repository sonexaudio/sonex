import { useParams } from "react-router";
import FileDropzone from "../../../../../components/files/FileDropzone";
import FileUploadViewer from "../../../../../components/files/FileUploadViewer";
import { TabsContent } from "../../../../../components/ui/tabs";
import { FileUploadProvider } from "../../../../../context/FileUploadProvider";
import useUser from "../../../../../hooks/useUser";
import ProjectFileSystem from "../ProjectFileSystem";
import NewFolderForm from "../../../../../components/folders/NewFolderForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Upload } from "lucide-react";


const ProjectFilesTab = () => {
    const { id } = useParams();
    const { currentUser } = useUser();
    return (
        <TabsContent value="files" className="mt-6">
            <div className="grid grid-col gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Quick settings: New folder, Quick modify file/folder */}
                    <NewFolderForm />

                    {/* Upload files */}
                    <FileUploadProvider
                        projectId={id as string}
                        uploaderId={currentUser?.id as string}
                        uploaderType="USER"
                    >
                        <Card className="border rounded-md size-full p-8">
                            <CardHeader>
                                <CardTitle className="flex gap-1 items-center text-lg font-bold"><Upload /> Upload Files</CardTitle>
                                <CardDescription>Upload working files or final deliverables</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <FileDropzone />
                                <FileUploadViewer />
                            </CardContent>
                        </Card>
                    </FileUploadProvider>
                </div>
                <ProjectFileSystem />
            </div>
        </TabsContent>
    );
};

export default ProjectFilesTab;