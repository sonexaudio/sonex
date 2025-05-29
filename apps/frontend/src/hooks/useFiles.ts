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

const initialFiles: FileState = {
	allFiles: [],
	currentFile: null,
};

function fileReducer(state: FileState, action: FileReducerAction) {
	switch (action.type) {
		case GET_ALL_FILES:
			console.log(action)
			return { ...state, allFiles: action.payload };
		case GET_CURRENT_FILE:
			return { ...state, currentFile: {...action.payload.file} };
		case ADD_FILE:
			return { ...state, allFiles: [...state.allFiles, action.payload.file] };
		case DELETE_ALL_FILES:
			return { ...state, allFiles: [], currentFile: null };
		case DELETE_FILE:
			return { ...state };
		default:
			return state;
	}
}

export default function useFiles() {
	const [files, dispatch] = useReducer(fileReducer, initialFiles);
	const [loading, setLoading] = useState(true);

	function addFileToState(file: SonexFile) {
		dispatch({type: ADD_FILE, payload: {file}})
	} 

	async function getAllFiles() {
		setLoading(true)
		const {data: {data}} = await api.get("/files")
		dispatch({type: GET_ALL_FILES, payload: data})
		setLoading(false)
	}

	async function getCurrentFile(id: string) {
		setLoading(true)
		const {data: {data}} = await api.get(`/files/${id}`)
		dispatch({type: GET_CURRENT_FILE, payload: data.file})
		setLoading(false)
	}

	async function deleteFile(id: string){
		setLoading(true)
		await api.delete(`/files/${id}`).then(() => {
			dispatch({type: DELETE_FILE, payload: {id}})
		}).catch((err) => {
			console.error(err)
		}).finally(() => {
			setLoading(false)
		})
	}

	async function deleteAllFiles(files: string[]) {
		setLoading(true)
		await api.post("/files/delete-all", {fileIds: JSON.stringify(files)}).then(() => {
			dispatch({type: DELETE_ALL_FILES})
		}).catch((err) => {
			console.error(err)
		}).finally(() => {
			setLoading(false)
		})
	}

	return {
		files,
		loading,
		addFileToState,
		getAllFiles,
		getCurrentFile,
		deleteAllFiles,
		deleteFile
	};
}
