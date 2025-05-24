import { useReducer, useState } from "react";
import api from "../lib/axios";
import {
	CREATE_PROJECT,
	DELETE_PROJECT,
	GET_ALL_PROJECTS,
	GET_SINGLE_PROJECT,
	UPDATE_PROJECT,
	type Project,
	type ProjectReducerAction,
	type ProjectState,
} from "../types/projects";

const initialProjects: ProjectState = {
	allProjects: [],
	currentProject: null,
};

function projectReducer(state: ProjectState, action: ProjectReducerAction) {
	switch (action.type) {
		case GET_ALL_PROJECTS:
			return { ...state, allProjects: [...action.payload.projects] };

		case GET_SINGLE_PROJECT:
			return { ...state, currentProject: { ...action.payload.project } };

		case CREATE_PROJECT:
			return {
				...state,
				allProjects: [action.payload.project, ...state.allProjects],
				currentProject: action.payload.project,
			};

		case UPDATE_PROJECT:
			return {
				...state,
				allProjects: state.allProjects.map((project) =>
					project.id === action.payload.project.id
						? action.payload.project
						: project,
				),
				currentProject: action.payload.project,
			};

		case DELETE_PROJECT:
			return {
				...state,
				allProjects: state.allProjects.filter(
					(project) => project.id !== action.payload.id,
				),
				currentProject:
					state.currentProject?.id === action.payload.id
						? null
						: state.currentProject,
			};

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
			const {
				data: { data },
			} = await api.get("/projects");

			if (data) {
				dispatch({
					type: GET_ALL_PROJECTS,
					payload: data,
				});
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
			const {
				data: { data },
			} = await api.get(`/projects/${id}`);
			if (data) {
				dispatch({ type: GET_SINGLE_PROJECT, payload: data });
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const createProject = async (projectData: Partial<Project>) => {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.post("/projects", projectData);
			dispatch({ type: CREATE_PROJECT, payload: data });
			getAllProjects();
		} catch (error) {
			// console.error(error);
			throw error.response.data.error;
		} finally {
			setLoading(false);
		}
	};

	const updateProject = async (id: string, projectData: Partial<Project>) => {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.put(`/projects/${id}`, projectData);
			dispatch({ type: UPDATE_PROJECT, payload: data });
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const deleteProject = async (id: string) => {
		setLoading(true);
		try {
			await api.delete(`/projects/${id}`);
			dispatch({ type: DELETE_PROJECT, payload: { id } });
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return {
		state,
		loading,
		getAllProjects,
		getSingleProject,
		createProject,
		updateProject,
		deleteProject,
	};
}
