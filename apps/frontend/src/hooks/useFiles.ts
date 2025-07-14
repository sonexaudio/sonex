import { useReducer, useState } from "react";
import {
	ADD_FILE,
	DELETE_FILE,
	GET_ALL_FILES,
	GET_CURRENT_FILE,
	DELETE_ALL_FILES,
	type FileReducerAction,
	type FileState,
	type SonexFile,
} from "../types/files";
import api from "../lib/axios";
import { useParams } from "react-router";
import { useProjectContext } from "../context/ProjectProvider";

const initialFiles: FileState = {
	allFiles: [],
	currentFile: null,
};

function fileReducer(state: FileState, action: FileReducerAction) {
	switch (action.type) {
		case GET_ALL_FILES:
			return { ...state, allFiles: action.payload.files };
		case GET_CURRENT_FILE:
			return { ...state, currentFile: { ...action.payload.file } };
		case ADD_FILE:
			return { ...state, allFiles: [...state.allFiles, action.payload.file] };
		case DELETE_ALL_FILES:
			return { ...state, allFiles: [], currentFile: null };
		case DELETE_FILE:
			return { ...state, allFiles: state.allFiles.filter(file => file.id !== action.payload.id) };
		default:
			return state;
	}
}

export default function useFiles() {
	const [files, dispatch] = useReducer(fileReducer, initialFiles);
	const [loading, setLoading] = useState(true);
	const { id: projectId } = useParams();
	const {
		files: projectFiles,
		filesLoading,
		refreshFiles,
		addFileToState,
		deleteFileFromState
	} = useProjectContext();

	function addFileToLocalState(file: SonexFile) {
		dispatch({ type: ADD_FILE, payload: { file } });
		addFileToState(file);
	}

	async function getAllFiles() {
		setLoading(true);
		try {
			await refreshFiles();
			dispatch({ type: GET_ALL_FILES, payload: { files: projectFiles } });
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
			dispatch({ type: GET_CURRENT_FILE, payload: { file: data.file } });
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
			dispatch({ type: DELETE_FILE, payload: { id } });
			deleteFileFromState(id);
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
			dispatch({ type: DELETE_ALL_FILES });
			// Refresh files from context
			await refreshFiles();
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function downloadFile(id: string) {
		try {
			const { data: { data } } = await api.get(`/files/${id}/download-url`);
			return data.url;
		} catch (error) {
			console.error(error);
		}
	}

	return {
		files,
		loading: loading || filesLoading,
		addFileToState: addFileToLocalState,
		getAllFiles,
		getCurrentFile,
		downloadFile,
		deleteAllFiles,
		deleteFile,
	};
}
