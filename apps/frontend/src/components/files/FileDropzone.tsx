import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadIcon } from "lucide-react";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useCallback } from "react";

const FileDropzone = () => {
    const { addFiles } = useFileUpload();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        addFiles(acceptedFiles);
    }, [addFiles]);

    function onDropRejected(rejectedFiles: FileRejection[]) {
        rejectedFiles.forEach((file) => console.log(`File Not Accepted: ${file.file.name}. Reason(s): ${file.errors.forEach((err) => console.log(err.code))}`));
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            "image/*": [],
            "audio/*": [],
        },
        maxSize: 10_000_000_000
    });

    return (

        <div className="border border-dashed rounded-md w-full h-[300px] cursor-pointer p-4" {...getRootProps()}>

            <div className="flex flex-col items-center justify-center h-full">
                {isDragActive ? (
                    <p>Add files here...</p>
                ) : (
                    <>
                        <UploadIcon />
                        <p>Click to upload or drag and drop</p>
                        <p>Max 50 GB per file</p>
                    </>
                )}
            </div>
            <input {...getInputProps()} />
        </div>
    );
};

export default FileDropzone;