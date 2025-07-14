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
	folderId?: string;
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

// action types
export const GET_ALL_FILES = "getFiles";
export const GET_CURRENT_FILE = "getCurrentFile";
export const ADD_FILE = "addFile";
export const DELETE_ALL_FILES = "deleteAllFiles";
export const DELETE_FILE = "deleteFile";

export interface SonexFile {
	id: string;
	name: string;
	size: number;
	mimeType: string;
	path: string;
	isDownloadable: boolean;
	isPublic: boolean;
	createdAt: Date | string;
	projectId: string;
	uploaderId: string;
	uploaderType: "USER" | "CLIENT";
	streamUrl?: string;
	folderId?: string;
}

export type FileState = {
	allFiles: SonexFile[];
	currentFile: SonexFile | null;
};

export type FileReducerAction =
	| {
		type: typeof GET_ALL_FILES;
		payload: { files: SonexFile[]; };
	}
	| {
		type: typeof GET_CURRENT_FILE;
		payload: { file: SonexFile; };
	}
	| {
		type: typeof ADD_FILE;
		payload: { file: SonexFile; };
	}
	| {
		type: typeof DELETE_ALL_FILES;
	}
	| {
		type: typeof DELETE_FILE;
		payload: { id: string; };
	};
