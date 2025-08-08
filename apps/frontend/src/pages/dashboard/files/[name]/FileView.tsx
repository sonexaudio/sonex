import { ArrowLeft, Download, MoreVertical, Share2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import useFiles from "../../../../hooks/useFiles";
import { useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "../../../../utils/files";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import FileCommentSection from "../../../../components/FileCommentSection";
import AudioPlayer from "../../../../components/AudioPlayer";
import { useAudioContext, useFileContext } from "../../../../context/SingleFileContextProvider";
import { useProjectContext } from "../../../../hooks/projects/useProjectContext";

interface FileViewProps {
    onBack: () => void;
}

const FileView = ({ onBack }: FileViewProps) => {
    const { currentFile } = useFileContext();
    const { downloadFile, isLoading } = useFiles();
    const { project: currentProject } = useProjectContext();
    const { fileId } = useParams();
    const { duration, formatTime } = useAudioContext();

    const handleDownloadFile = async () => {
        if (!fileId) return;

        const downloadUrl = await downloadFile(fileId);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = currentFile?.name || "sonex_download.mp3";
        document.body.appendChild(link);
        link.click();

        // Clean up after 2 seconds
        setTimeout(() => {
            document.body.removeChild(link);
        }, 2000);
    };

    if (!currentFile) return null;

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Button onClick={onBack} variant="link">
                <ArrowLeft className="size-5" />
                Back
            </Button>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-4">
                    <div>
                        <h1 className="text-2xl font-bold">{currentFile.name}</h1>
                        <p className="text-sm">Added {formatDistanceToNow(currentFile.createdAt)} ago • {formatFileSize(currentFile.size)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button onClick={handleDownloadFile}>
                        <Download className="size-4" />
                        <span>Download</span>
                    </Button>
                    <Button>
                        <Share2 className="size-4" />
                        <span>Share</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                    </Button>
                </div>
            </div>

            {/* File Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg ">File Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Format:</span>
                                    <span className="ml-2">{currentFile.mimeType}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="ml-2 text-gray-900">{formatTime(duration)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Sample Rate:</span>
                                    <span className="ml-2 text-gray-900">44.1 kHz</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Bit Depth:</span>
                                    <span className="ml-2 text-gray-900">24-bit</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Channels:</span>
                                    <span className="ml-2 text-gray-900">Stereo</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Size:</span>
                                    <span className="ml-2 text-gray-900">{formatFileSize(currentFile.size)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Project Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <Badge>{currentProject?.status || "Active"}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Version</span>
                                    <span className="text-sm text-gray-900">Not available</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Created by</span>
                                    <span className="text-sm text-gray-900">Not available</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Audio Player */}
            <div className="mb-8">
                <AudioPlayer />
            </div>

            {/* Comments Section */}
            <FileCommentSection />
        </div>
    );
};

export default FileView;