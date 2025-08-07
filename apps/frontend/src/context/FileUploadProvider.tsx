import { useState, type ReactNode, createContext, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { useProjectContext } from "../hooks/projects/useProjectContext";
import { fetchFiles } from "../hooks/query-functions/files";

export type SonexUploadFile = {
	file: File;
	id: string;
	progress: number;
	uploadStatus: "idle" | "uploading" | "completed" | "failed" | "canceled";
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
	cancelUpload: (id: string) => void;
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
	const { projectData: { refetchProject } } = useProjectContext();
	const queryClient = useQueryClient();

	// Track abort controllers for each upload
	const abortControllers = useRef<Record<string, AbortController>>({});

	function addFiles(acceptedFiles: File[]) {
		const nonDuplicateNewFiles: SonexUploadFile[] = acceptedFiles
			.filter((droppedFile) => {
				const isDuplicate = filesToUpload.some(
					(alreadyAddedFile) => alreadyAddedFile.file.name === droppedFile.name,
				);
				return !isDuplicate;
			})
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
		setFilesToUpload((prev) =>
			prev.map((file) =>
				file.id === id ? { ...file, uploadStatus: status } : file,
			),
		);
	}

	function updateUploadProgress(id: string, progress: number) {
		setFilesToUpload((prev) =>
			prev.map((file) =>
				file.id === id ? { ...file, progress } : file,
			),
		);
	}

	function updateFileSettings(id: string, settings: { folderId?: string | null; isPublic?: boolean; }) {
		setFilesToUpload((prev) =>
			prev.map((file) =>
				file.id === id ? { ...file, ...settings } : file,
			),
		);
	}

	function clearUploadQueue() {
		setFilesToUpload([]);
	}

	function removeFile(id: string) {
		setFilesToUpload((prev) => prev.filter((f) => f.id !== id));
		// Cancel if uploading
		cancelUpload(id);
	}

	function cancelUpload(id: string) {
		const controller = abortControllers.current[id];
		if (controller) {
			controller.abort();
			updateUploadStatus(id, "canceled");
			updateUploadProgress(id, 0);
			delete abortControllers.current[id];
		}
	}

	// React Query mutation for uploading a single file
	const uploadFileMutation = useMutation({
		mutationFn: async (file: SonexUploadFile) => {
			const fd = new FormData();
			fd.append("files", file.file);
			fd.append("projectId", projectId);
			fd.append("uploaderId", uploaderId);
			fd.append("uploaderType", uploaderType || "USER");
			if (file.folderId) {
				fd.append("folderId", file.folderId);
			}
			fd.append("isPublic", String(file.isPublic ?? true));

			const controller = new AbortController();
			abortControllers.current[file.id] = controller;

			const queryString = new URLSearchParams({
				projectId,
				uploaderId,
				uploaderType: uploaderType ?? "USER",
			}).toString();

			await api.post(`/files/upload?${queryString}`, fd, {
				headers: { "Content-Type": "multipart/form-data" },
				signal: controller.signal,
				onUploadProgress: (event) => {
					if (event.lengthComputable && event.total) {
						const percentCompleted = Math.round(
							(event.loaded / event.total) * 100,
						);
						updateUploadProgress(file.id, percentCompleted);
					}
				},
			});
		},
		onSuccess: async (_, file) => {
			updateUploadStatus(file.id, "completed");
			updateUploadProgress(file.id, 100);
			delete abortControllers.current[file.id];
			// Refresh files using react-query
			await queryClient.invalidateQueries({ queryKey: ["files"] });
			await refetchProject();
		},
		onError: (error, file) => {
			if ((error as any)?.name === "CanceledError") {
				updateUploadStatus(file.id, "canceled");
			} else {
				updateUploadStatus(file.id, "failed");
			}
			delete abortControllers.current[file.id];
		},
	});

	async function upload() {
		const idleFiles = filesToUpload.filter(f => f.uploadStatus === "idle");
		await Promise.all(
			idleFiles.map(async (file) => {
				updateUploadStatus(file.id, "uploading");
				updateUploadProgress(file.id, 0);
				try {
					await uploadFileMutation.mutateAsync(file);
				} catch {
					// error handled in onError
				}
			}),
		);
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
				cancelUpload,
			}}
		>
			{children}
		</FileUploadContext.Provider>
	);
};
