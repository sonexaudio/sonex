import { useEffect } from "react";
import { useParams } from "react-router";
import useFiles from "../../../hooks/useFiles";


const FilePlayer = () => {
    const { fileId } = useParams();
    const { getCurrentFile, files: { currentFile }, downloadFile } = useFiles();

    useEffect(() => {
        if (fileId) {
            getCurrentFile(fileId, true);
        }
    }, [fileId]);

    const handleDownloadFile = async () => {
        const downloadUrl = await downloadFile(fileId as string);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "sonex_download.mp3";
        document.body.appendChild(link);
        link.click();

        // Clean up after 2 seconds
        setTimeout(() => {
            document.body.removeChild(link);
        }, 2000);
    };

    return (
        <div>
            <h3>{currentFile?.name}</h3>
            <audio src={currentFile?.streamUrl} controls />
            <button type="button" onClick={handleDownloadFile}>Download File</button>
        </div>

    );
};

export default FilePlayer;