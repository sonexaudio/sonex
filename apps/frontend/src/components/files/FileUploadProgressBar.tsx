import { useCallback } from "react";
import type { SonexUploadFile } from "../../context/FileUploadProvider";


const FileUploadProgressBar = ({ progress, status }: { progress: number; status: SonexUploadFile["uploadStatus"]; }) => {


  const getStatusColor = useCallback(() => {
    switch (status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "blue";
    }
  }, [status]);

  return (
    <div className="w-full h-4 rounded-full bg-gray-200">
      <div className="h-full" style={{ width: `${(progress / 100) * 100}%`, color: getStatusColor() }} />
    </div>
  );
};

export default FileUploadProgressBar;