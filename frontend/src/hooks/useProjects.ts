import { useReducer, useState } from "react";
import api from "../lib/axios";

const GET_ALL_PROJECTS = "getAllProjects";
const GET_SINGLE_PROJECT = "getSingleProject";
const CREATE_PROJECT = "createProject";
const UPDATE_PROJECT = "updateProject";
const DELETE_PROJECT = "deleteProject";

const initialProjects = {
	allProjects: [],
	currentProject: {},
};

type ProjectReducerAction = {
	type: string;
	payload: any;
};

function projectReducer(state, action: ProjectReducerAction) {
	const { payload } = action;
	switch (action.type) {
		case GET_ALL_PROJECTS: {
			return { ...state, allProjects: [...payload.data.projects] };
		}

		case GET_SINGLE_PROJECT: {
			return { ...state, currentProject: { ...payload.data.project } };
		}

		case CREATE_PROJECT: {
			return {
				...state,
				allProjects: [payload.data.project, ...allProjects],
				currentProject: payload.data.project,
			};
		}

		default:
			return state;
	}
}

export default function useProjects() {
	const [state, dispatch] = useReducer(projectReducer, initialProjects);
	const [loading, setLoading] = useState(true);

	const getAllProjects = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/projects");
			if (data) {
				dispatch({ type: GET_ALL_PROJECTS, payload: data });
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getSingleProject = async (id: string) => {
		setLoading(true);
		try {
			const { data } = await api.get(`/projects/${id}`);
			if (data) {
				dispatch({ type: GET_SINGLE_PROJECT, payload: data });
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return { state, getAllProjects, getSingleProject, loading };
}
