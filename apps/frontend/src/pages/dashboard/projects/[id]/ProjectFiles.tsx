import { useParams } from "react-router";
import useFiles from "../../../../hooks/useFiles";
import type { SonexFile } from "../../../../types/files";
import { formatFileSize } from "../../../../utils/files";
import useUser from "../../../../hooks/useUser";
import useClientAuth from "../../../../hooks/useClientAuth";
import { useProjectContext } from "../../../../context/ProjectProvider";

interface SonexFileExtended extends SonexFile {
    isFileOwner: boolean;
}

const ProjectFile = ({ file }: { file: SonexFileExtended; }) => {
    const { deleteFile } = useFiles();

    const handleDeleteFile = async () => {
        await deleteFile(file.id);
    };

    return (
        <div className="border w-full p-6">
            <p className="flex gap-4">
                <span className="text-lg font-bold">{file.name}</span>
                <span>{file.mimeType}</span>
                <span>{formatFileSize(file.size)}</span>
            </p>
            {file.isFileOwner && (
                <button type="button" className="mt-4" onClick={handleDeleteFile}>Remove File</button>
            )}

        </div>
    );
};

const ProjectFiles = ({ isProjectOwner }: { isProjectOwner: boolean; }) => {
    const { files, filesLoading } = useProjectContext();
    const { id: projectId } = useParams();
    const { currentUser } = useUser();
    const { client, getClient } = useClientAuth();

    const userId = currentUser?.id as string;
    const clientId = client?.id as string;

    // Only get client if not already loaded
    if (!client) {
        getClient();
    }

    const projectFiles = files
        .filter(file => file.projectId === projectId)
        .map(file => ({
            ...file,
            isFileOwner: file.uploaderId === userId || file.uploaderId === clientId || isProjectOwner
        })) || [];

    if (filesLoading) return <p>Loading...</p>;

    return (
        <div className="border rounded-md p-6 my-8">
            <h3 className="font-semibold text-lg">Files</h3>
            {projectFiles.map(file => (
                <ProjectFile file={file} key={file.id} />
            ))}
        </div>
    );
};

export default ProjectFiles;