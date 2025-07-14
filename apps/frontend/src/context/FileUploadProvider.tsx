import { useState, type ReactNode, createContext, useContext } from "react";
import api from "../lib/axios";
import { useProjectContext } from "./ProjectProvider";

export type SonexUploadFile = {
	file: File;
	id: string;
	progress: number;
	uploadStatus: "idle" | "uploading" | "completed" | "failed";
	folderId?: string | null;
	isPublic?: boolean;
};

export type FileUploadState = {
	filesToUpload: SonexUploadFile[];
};

export type FileUploadActions = {
	addFiles: (acceptedFiles: File[]) => void;
	removeFile: (id: string) => void;
	clearUploadQueue: () => void;
	updateUploadStatus: (
		id: string,
		status: SonexUploadFile["uploadStatus"],
	) => void;
	updateUploadProgress: (id: string, progress: number) => void;
	updateFileSettings: (id: string, settings: { folderId?: string | null; isPublic?: boolean; }) => void;
	upload: () => Promise<void>;
};

export type FileUploadContextType = FileUploadState & FileUploadActions;

export const FileUploadContext = createContext<FileUploadContextType | null>(
	null,
);

export const FileUploadProvider = ({
	children,
	projectId,
	uploaderId,
	uploaderType,
}: {
	children: ReactNode;
	projectId: string;
	uploaderId: string;
	uploaderType?: "USER" | "CLIENT";
}) => {
	if (!projectId || !uploaderId || !uploaderType)
		throw new Error("ProjectId, UploaderId, and/or UploaderType missing");

	const [filesToUpload, setFilesToUpload] = useState<SonexUploadFile[]>([]);
	const { refreshFiles } = useProjectContext();

	function addFiles(acceptedFiles: File[]) {
		// TODO: Abstract this hunk of code... I don't wanna see it like this lol
		const nonDuplicateNewFiles: SonexUploadFile[] = acceptedFiles
			.filter((droppedFile) => {
				// for each file dropped, check through each file in the queue,
				// to make sure the file doesn't exist
				const isDuplicate = filesToUpload.some(
					(alreadyAddedFile) => alreadyAddedFile.file.name === droppedFile.name,
				);

				// provides the file to the filter if it's not a duplicate
				return !isDuplicate;
			})
			// then convert the non-dupes into a sonex upload file
			.map((file) => ({
				file,
				id: `${file.name}${file.size}`,
				uploadStatus: "idle",
				progress: 0,
			}));

		setFilesToUpload((prevFiles) => [...prevFiles, ...nonDuplicateNewFiles]);
	}

	function updateUploadStatus(
		id: string,
		status: SonexUploadFile["uploadStatus"],
	) {
		setFilesToUpload(
			filesToUpload.map((file) =>
				file.id === id ? { ...file, uploadStatus: status } : file,
			),
		);
	}

	function updateUploadProgress(id: string, progress: number) {
		setFilesToUpload(
			filesToUpload.map((file) =>
				file.id === id ? { ...file, progress } : file,
			),
		);
	}

	function updateFileSettings(id: string, settings: { folderId?: string | null; isPublic?: boolean; }) {
		setFilesToUpload(
			filesToUpload.map((file) =>
				file.id === id ? { ...file, ...settings } : file,
			),
		);
	}

	function clearUploadQueue() {
		setFilesToUpload([]);
	}

	function removeFile(id: string) {
		setFilesToUpload(filesToUpload.filter((f) => f.id !== id));
	}

	async function upload() {
		const uploadPromises = filesToUpload.map(async (file) => {
			if (file.uploadStatus === "idle") {
				updateUploadStatus(file.id, "uploading");
				const fd = new FormData();
				fd.append("files", file.file);
				fd.append("projectId", projectId);
				fd.append("uploaderId", uploaderId);
				fd.append("uploaderType", uploaderType || "USER");
				if (file.folderId) {
					fd.append("folderId", file.folderId);
				}
				fd.append("isPublic", String(file.isPublic ?? true));

				// temporary
				const queryString = new URLSearchParams({
					projectId,
					uploaderId,
					uploaderType: uploaderType ?? "USER",
				}).toString();

				return api
					.post(`/files/upload?${queryString}`, fd, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
						onUploadProgress: (event) => {
							if (event.lengthComputable && event.total) {
								const percentCompleted = Math.round(
									(event.loaded / event.total) * 100,
								);
								updateUploadProgress(file.id, percentCompleted);
							}
						},
					})
					.then(() => {
						updateUploadStatus(file.id, "completed");
						updateUploadProgress(file.id, 100);
					})
					.catch((error) => {
						console.error(error);
						updateUploadStatus(file.id, "failed");
					});
			}

			return Promise.resolve();
		});

		await Promise.all(uploadPromises);

		// Refresh files after successful upload
		await refreshFiles();
	}

	return (
		<FileUploadContext.Provider
			value={{
				filesToUpload,
				addFiles,
				removeFile,
				clearUploadQueue,
				upload,
				updateUploadProgress,
				updateUploadStatus,
				updateFileSettings,
			}}
		>
			{children}
		</FileUploadContext.Provider>
	);
};
