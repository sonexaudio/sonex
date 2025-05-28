import { Trash2Icon } from "lucide-react";
import type { SonexUploadFile } from "../../context/FileUploadProvider";
import { useFileUpload } from "../../hooks/useFileUpload";
import FileThumbnail from "./FileUploadThumbnail";
import FileUploadProgressBar from "./FileUploadProgressBar";
import { useEffect, useState } from "react";
import FileUploadCircularProgress from "./FileUploadCircularProgress";

const FileUploadCard = ({ file, id, progress, uploadStatus }: SonexUploadFile) => {
    const { removeFile } = useFileUpload();

    const [uploadProgress, setUploadProgress] = useState(0);

    // To use with setting an interval time to delete file while uploading
    // or finished uploading
    // TODO: set up an abort controller
    useEffect(() => {
        if (uploadStatus === "completed") {
            let progressValue = 0;
            const interval = setInterval(() => {
                progressValue += 3;
                setUploadProgress(prev => prev + 3);
                if (progressValue >= 100) {
                    removeFile(id);
                    clearInterval(interval);
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [id, removeFile, uploadStatus]);

    function handleRemoveFile() {
        removeFile(id);
    }

    return (
        <li>
            <div>
                <h3>{file.name}</h3>
                <FileThumbnail name={file.name} />
                <FileUploadProgressBar progress={progress} status={uploadStatus} />
                <div>
                    Status: {uploadStatus}
                </div>
            </div>

            {uploadStatus === "uploading" ? (
                <FileUploadCircularProgress progress={uploadProgress} />
            ) : (
                <button type="button" onClick={handleRemoveFile}>
                    <Trash2Icon />
                </button>
            )
            }

        </li >
    );
};

export default FileUploadCard;