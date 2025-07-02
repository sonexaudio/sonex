import { Trash2Icon } from "lucide-react";
import type { SonexUploadFile } from "../../context/FileUploadProvider";
import { useFileUpload } from "../../hooks/useFileUpload";
import FileThumbnail from "./FileUploadThumbnail";
import FileUploadProgressBar from "./FileUploadProgressBar";
import { useEffect, useState } from "react";
import FileUploadCircularProgress from "./FileUploadCircularProgress";
import { formatFileSize } from "../../utils/files";
import { Button } from "../ui/button";

const FileUploadCard = ({
	file,
	id,
	progress,
	uploadStatus,
}: SonexUploadFile) => {
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
				setUploadProgress((prev) => prev + 3);
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
		<li className="flex items-center justify-between bg-muted text-primary p-4 rounded-lg shadow">
			<div className="flex items-center gap-2">
				<span className="text-primary"><FileThumbnail name={file.name} /></span>
				<div>
					<h3 className="font-bold">{file.name}</h3>
					<span className="text-foreground text-xs flex gap-2">
						<span>{formatFileSize(file.size)}</span>
						<span>Status: {uploadStatus}</span>
					</span>
				</div>
			</div>

			{uploadStatus === "uploading" ? (
				<FileUploadCircularProgress progress={uploadProgress} />
			) : (
				<Button variant="destructive" onClick={handleRemoveFile}>
					<Trash2Icon />
				</Button>
			)}
		</li>
	);
};

export default FileUploadCard;
