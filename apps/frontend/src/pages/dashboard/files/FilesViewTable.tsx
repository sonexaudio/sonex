import { useEffect } from "react";
import useFiles from "../../../hooks/useFiles";
import { formatFileSize } from "../../../utils/files";


const FilesViewTable = () => {
    const { files: { allFiles }, getAllFiles, loading, deleteFile, deleteAllFiles } = useFiles();

    useEffect(() => {
        if (loading) {
            getAllFiles();
        }
    }, []);

    if (loading) return <p>Loading...</p>;

    const handleDeleteAllFiles = async () => {
        const fileIds = allFiles.map(f => f.id);
        if (fileIds.length === 0) return;
        await deleteAllFiles(fileIds);
    };

    return (
        <div>
            <button onClick={handleDeleteAllFiles}>Delete All Files</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {allFiles.map(file => (
                        <tr key={file.id}>
                            <th>{file.name}</th>
                            <td>{formatFileSize(file.size)}</td>
                            <td>{file.mimeType}</td>
                            <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => deleteFile(file.id)}>Delete File</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FilesViewTable;