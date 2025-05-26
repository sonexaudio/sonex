import type { AxiosError } from "axios";
import { createContext, useEffect, useState, type ReactNode } from "react";
import api from "../lib/axios";

type UploadFile = {
	id: string;
	file: File;
	previewUrl: string;
	status: "pending" | "uploading" | "uploaded" | "failed";
	progress: number;
	error?: string;
};

type FileUploadMeta = {
	projectId: string;
	uploaderId: string;
	uploaderType?: "USER" | "CLIENT";
};

type FileUploadContextType = {
	uploading: boolean;
	filesToUpload: UploadFile[];
	addFiles: (input: FileList | File[]) => void;
	removeFile: (id: string) => void;
	clearFiles: () => void;
	setFileStatus: (
		id: string,
		status: UploadFile["status"],
		error?: string,
	) => void;
	setFileProgress: (id: string, progress: number) => void;
	uploadFile: (fileId: string) => Promise<void>;
	uploadAll: () => Promise<void>;
	retryFile: (id: string) => Promise<void>;
};

export const FileUploadContext = createContext<
	FileUploadContextType | undefined
>(undefined);

export const FileUploadProvider = ({
	children,
	meta,
}: { children: ReactNode; meta: FileUploadMeta }) => {
	const [filesToUpload, setFilesToUpload] = useState<UploadFile[]>([]);
	const [uploading, setUploading] = useState(false);

	// clean up any object urls that were created
	useEffect(() => {
		return () => {
			filesToUpload.forEach((file) => URL.revokeObjectURL(file.previewUrl));
		};
	}, [filesToUpload]);

	// functions
	function addFiles(input: FileList | File[]) {
		const addedFiles = Array.from(input).map((file) => ({
			id: crypto.randomUUID(),
			file,
			previewUrl: URL.createObjectURL(file),
			status: "pending" as const,
			progress: 0,
		}));

		setFilesToUpload((prev) => [...prev, ...addedFiles]);
	}

	function removeFile(id: string) {
		setFilesToUpload((prev) => prev.filter((file) => file.id !== id));
	}

	function clearFiles() {
		setFilesToUpload([]);
	}

	// Returns new copy of state with chosen file status updated
	function setFileStatus(
		id: string,
		status: UploadFile["status"],
		error?: string,
	) {
		setFilesToUpload((prev) =>
			prev.map((file) => (file.id === id ? { ...file, status, error } : file)),
		);
	}

	function setFileProgress(id: string, progress: number) {
		setFilesToUpload((prev) =>
			prev.map((file) => (file.id === id ? { ...file, progress } : file)),
		);
	}

	// Helper function to help uploadAll function
	async function uploadFile(fileId: string) {
		const file = filesToUpload.find((f) => f.id === fileId);
		console.log(file);

		if (!file || !meta) return;

		const fd = new FormData();
		fd.append("files", file.file);
		fd.append("projectId", meta.projectId);
		fd.append("uploaderId", meta.uploaderId);
		fd.append("uploaderType", meta.uploaderType || "USER");

		for (const value of fd.values()) {
			console.log(value);
		}

		try {
			setFileStatus(file.id, "uploading");
			await api.post("/files/upload", fd, {
				onUploadProgress: (event) => {
					const percentCompleted = Math.round(
						(event.loaded * 100) / (event.total || 1),
					);
					setFileProgress(file.id, percentCompleted);
				},
			});

			setFileStatus(file.id, "uploaded");
			setFileProgress(file.id, 100);
		} catch (error) {
			console.log(error);
			setFileStatus(
				file.id,
				"failed",
				((error as AxiosError).response?.data?.error?.message as string) ||
					"Upload failed",
			);
		}
	}

	async function uploadAll() {
		setUploading(true);
		const uploads = filesToUpload
			.filter((f) => f.status === "pending" || f.status === "failed")
			.map((f) => uploadFile(f.id));

		await Promise.allSettled(uploads);
		setUploading(false);
	}

	async function retryFile(id: string) {
		setUploading(true);
		await uploadFile(id);
		setUploading(false);
	}

	return (
		<FileUploadContext.Provider
			value={{
				filesToUpload,
				uploading,
				addFiles,
				removeFile,
				clearFiles,
				setFileStatus,
				setFileProgress,
				uploadFile,
				uploadAll,
				retryFile,
			}}
		>
			{children}
		</FileUploadContext.Provider>
	);
};
