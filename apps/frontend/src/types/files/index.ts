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

// action types
export const GET_ALL_FILES = "getFiles";
export const GET_CURRENT_FILE = "getCurrentFile";
export const ADD_FILE = "addFile";
export const UPDATE_FILE = "updateFile";
export const DELETE_FILE = "deleteFile";

export interface FileMetadata {
	id: string;
}

export type FileState = {
	allFiles: FileMetadata[];
	currentFile: FileMetadata | null;
};

export type FileReducerAction =
	| {
			type: typeof GET_ALL_FILES;
			payload: { files: FileMetadata[] };
	  }
	| {
			type: typeof GET_CURRENT_FILE;
			payload: { file: FileMetadata };
	  }
	| {
			type: typeof ADD_FILE;
			payload: { file: FileMetadata };
	  }
	| {
			type: typeof UPDATE_FILE;
			payload: { file: FileMetadata };
	  }
	| {
			type: typeof DELETE_FILE;
			payload: { id: string };
	  };
