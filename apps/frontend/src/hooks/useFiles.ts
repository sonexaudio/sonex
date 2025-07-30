import { useReducer, useState } from "react";
import type { SonexFile } from "../types/files";
import api from "../lib/axios";

export default function useFiles() {
	const [files, setFiles] = useState<SonexFile[]>([]);
	const [currentFile, setCurrentFile] = useState<SonexFile | null>(null);
	const [loading, setLoading] = useState(true);

	async function fetchFiles() {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.get("/files");
			setFiles(data.files);
		} catch (error) {
			console.error("Failed to fetch files:", error);
		} finally {
			setLoading(false);
		}
	}

	async function getCurrentFile(id: string, includeStreamUrl = false) {
		setLoading(true);
		let fileUrl = `/files/${id}`;

		if (includeStreamUrl) {
			fileUrl += "/stream-url";
		}

		try {
			const {
				data: { data },
			} = await api.get(fileUrl);
			setCurrentFile(data.file);
		} catch (error) {
			console.error("Failed to fetch current file:", error);
		} finally {
			setLoading(false);
		}
	}

	async function deleteFile(id: string) {
		setLoading(true);
		try {
			await api.delete(`/files/${id}`);
			setFiles(files.filter((file) => file.id !== id));
			setCurrentFile(null);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function deleteAllFiles(files: string[]) {
		setLoading(true);
		try {
			await api.post("/files/delete-all", { fileIds: JSON.stringify(files) });
			setFiles([]);
			setCurrentFile(null);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function downloadFile(id: string) {
		try {
			const {
				data: { data },
			} = await api.get(`/files/${id}/download-url`);
			return data.url;
		} catch (error) {
			console.error(error);
		}
	}

	return {
		files,
		currentFile,
		loading,
		fetchFiles,
		getCurrentFile,
		downloadFile,
		deleteAllFiles,
		deleteFile,
	};
}
