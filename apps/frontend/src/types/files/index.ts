import type { ChangeEvent, DragEvent } from "react";

export type FileUploadStatus = "idle" | "uploading" | "succeeded" | "failed";

export interface SonexFile {
	id: string;
	name: string;
	size: number;
	type: string;
	status: FileUploadStatus;
	progress: number;
	error: string | null;
}

export type FileUploadContextValues = {
	filesToUpload: SonexFile[];
	rejectFiles: SonexFile[];
	isDragging: boolean;
	isUploading: boolean;
	handleDrop: (e: DragEvent<HTMLDivElement>) => void;
	handleFilesDrop: (e: ChangeEvent<HTMLInputElement>) => void;
	handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
	handleDragLeave: () => void;
	clearFiles: () => void;
	removeFile: (file: SonexFile) => void;
	uploadFiles: () => Promise<void>;
};
