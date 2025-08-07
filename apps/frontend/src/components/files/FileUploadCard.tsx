import { Trash2Icon, Eye, EyeOff } from "lucide-react";
import type { SonexUploadFile } from "../../context/FileUploadProvider";
import { useFileUpload } from "../../hooks/useFileUpload";
import FileThumbnail from "./FileUploadThumbnail";
import { useEffect, useState } from "react";
import FileUploadCircularProgress from "./FileUploadCircularProgress";
import { formatFileSize } from "../../utils/files";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useProjectContext } from "../../hooks/projects/useProjectContext";

const FileUploadCard = ({
	file,
	id,
	progress,
	uploadStatus,
	folderId,
	isPublic = true,
}: SonexUploadFile) => {
	const { removeFile, updateFileSettings, cancelUpload } = useFileUpload();
	const { projectData: { folders } } = useProjectContext();

	const [uploadProgress, setUploadProgress] = useState(0);

	// // To use with setting an interval time to delete file while uploading
	// // or finished uploading
	// // TODO: set up an abort controller
	// useEffect(() => {
	// 	if (uploadStatus === "completed") {
	// 		let progressValue = 0;
	// 		const interval = setInterval(() => {
	// 			progressValue += 3;
	// 			setUploadProgress((prev) => prev + 3);
	// 			if (progressValue >= 100) {
	// 				removeFile(id);
	// 				clearInterval(interval);
	// 			}
	// 		}, 50);

	// 		return () => clearInterval(interval);
	// 	}
	// }, [id, removeFile, uploadStatus]);

	function handleRemoveFile() {
		removeFile(id);
	}

	const handleFolderChange = (value: string) => {
		updateFileSettings(id, { folderId: value === "root" ? null : value });
	};

	const handleAccessChange = (checked: boolean) => {
		updateFileSettings(id, { isPublic: checked });
	};

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
				<>
					<FileUploadCircularProgress progress={progress} />
					<Button variant="outline" onClick={() => cancelUpload(id)}>
						Cancel
					</Button>
				</>
			) : (
				<div className="flex items-center space-x-2">
					{/* Folder Selection */}
					<Select value={folderId || "root"} onValueChange={handleFolderChange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="root">Root</SelectItem>
							{folders.map((folder) => (
								<SelectItem key={folder.id} value={folder.id}>
									{folder.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Access Control */}
					<div className="flex items-center space-x-2">
						<Switch
							id={`access-${id}`}
							checked={isPublic}
							onCheckedChange={handleAccessChange}
						/>
						<Label htmlFor={`access-${id}`} className="text-xs">
							{isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
						</Label>
					</div>

					<Button variant="destructive" onClick={handleRemoveFile}>
						<Trash2Icon />
					</Button>
				</div>
			)}
		</li>
	);
};

export default FileUploadCard;
