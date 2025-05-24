import { useReducer, useState } from "react";
import {
	ADD_FILE,
	DELETE_FILE,
	GET_ALL_FILES,
	GET_CURRENT_FILE,
	UPDATE_FILE,
	type FileReducerAction,
	type FileState,
} from "../types/files";

const initialFiles: FileState = {
	allFiles: [],
	currentFile: null,
};

function fileReducer(state: FileState, action: FileReducerAction) {
	switch (action.type) {
		case GET_ALL_FILES:
			return { ...state };
		case GET_CURRENT_FILE:
			return { ...state };
		case ADD_FILE:
			return { ...state };
		case UPDATE_FILE:
			return { ...state };
		case DELETE_FILE:
			return { ...state };
		default:
			return state;
	}
}

export default function useProjects() {
	const [files, dispatch] = useReducer(fileReducer, initialFiles);
	const [loading, setLoading] = useState(true);

	return {
		files,
		loading,
	};
}
