import {
	createContext,
	useState,
	type ChangeEvent,
	type DragEvent,
	type ReactNode,
} from "react";
import type { FileUploadContextValues, SonexFile } from "../types/files";
import axios from "axios";
import { convertFileToSonexFile } from "../utils/files";

export const FileUploadContext = createContext<
	FileUploadContextValues | undefined
>(undefined);

const FileUploadProvider = ({ children }: { children: ReactNode }) => {
	const [filesToUpload, setFilesToUpload] = useState<SonexFile[]>([]);
	const [rejectFiles, setRejectFiles] = useState<SonexFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			_processFiles(files);
		}
	};

	const handleFilesDrop = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		_processFiles(e.target.files);
	};

	const clearFiles = () => {
		setFilesToUpload([]);
		setRejectFiles([]);
	};

	const removeFile = (file: SonexFile) => {
		if (file.status === "idle") {
			setFilesToUpload(filesToUpload.filter((f) => f.id !== file.id));
		} else {
			setRejectFiles(rejectFiles.filter((f) => f.id !== file.id));
		}
	};

	function _processFiles(fileList: FileList) {
		const acceptedFiles: SonexFile[] = [];
		const rejectedFiles: SonexFile[] = [];

		// biome-ignore lint/complexity/noForEach: to change in biome settings
		Array.from(fileList).forEach((file) => {
			const isValidFile = file.type.startsWith("audio/");

			const sonexFile = convertFileToSonexFile(file);

			console.log("SONEX FILE", sonexFile);

			if (isValidFile) {
				acceptedFiles.push(sonexFile);
			} else {
				rejectFiles.push({
					...sonexFile,
					status: "failed",
					error: "Only audio files are allowed",
				});
			}
		});

		if (acceptedFiles.length > 0)
			setFilesToUpload((prevFiles) => [...prevFiles, ...acceptedFiles]);

		if (rejectedFiles.length > 0)
			setRejectFiles((prevFiles) => [...prevFiles, ...rejectedFiles]);
	}

	const uploadFiles = async () => {
		// if there are no files, do nothing: May even return error
		// set isUploading to true
		// change all files to status "uploading"
		// uploaded to database and server, track progress of each with axios
		// once done, set all that succeeded status "complete" and failed as "failed"
		// remove files that were successfully uploaded (mimics ability to try again)
		// setIsUploading to false
		if (filesToUpload.length === 0) return;
		setIsUploading(true);

		const uploadResults = await Promise.all(
			filesToUpload.map(async (file) => {
				setFilesToUpload((prev) =>
					prev.map((f) =>
						f.name === file.name
							? { ...f, status: "uploading", progress: 0 }
							: f,
					),
				);

				return axios
					.post("http://localhost:80/post", file, {
						onUploadProgress: (progressEvent) => {
							const progress = progressEvent.total
								? Math.round((progressEvent.loaded * 100) / progressEvent.total)
								: 0;

							// Update progress reactively
							setFilesToUpload((prev) =>
								prev.map((f) =>
									f.name === file.name ? { ...f, progress } : f,
								),
							);
						},
					})
					.then(() => {
						setFilesToUpload((prev) =>
							prev.map((f) =>
								f.name === file.name
									? { ...f, status: "succeeded", progress: 100 }
									: f,
							),
						);
						return { file, status: "succeeded" };
					})
					.catch(() => {
						setFilesToUpload((prev) =>
							prev.map((f) =>
								f.name === file.name
									? { ...f, status: "failed", progress: 0 }
									: f,
							),
						);
						return { file, status: "failed" };
					});
			}),
		);

		// console.log("UPLOAD RESULTS", uploadResults);

		setIsUploading(false);
	};

	const values = {
		filesToUpload,
		handleFilesDrop,
		clearFiles,
		isUploading,
		removeFile,
		rejectFiles,
		uploadFiles,
		handleDragLeave,
		handleDragOver,
		isDragging,
		handleDrop,
	};
	return (
		<FileUploadContext.Provider value={values}>
			{children}
		</FileUploadContext.Provider>
	);
};
export default FileUploadProvider;
