import { useReducer, useState, useCallback } from "react";
import api from "../lib/axios";
import {
	CREATE_PROJECT,
	DELETE_PROJECT,
	GET_ALL_PROJECTS,
	GET_SINGLE_PROJECT,
	type ProjectWithUserInfo,
	UPDATE_PROJECT,
	type Project,
	type ProjectReducerAction,
	type ProjectState,
} from "../types/projects";
import type { AxiosError } from "axios";
import type { AxiosResponseError } from "./useClients";

// const initialProjects: ProjectState = {
// 	allProjects: [],
// 	currentProject: null,
// 	pagination: null,
// };

// function projectReducer(state: ProjectState, action: ProjectReducerAction) {
// 	switch (action.type) {
// 		case GET_ALL_PROJECTS:
// 			return {
// 				...state,
// 				allProjects: [...action.payload.projects],
// 				pagination: action.payload.pagination || null,
// 			};

// 		case GET_SINGLE_PROJECT:
// 			return { ...state, currentProject: { ...action.payload.project } };

// 		case CREATE_PROJECT:
// 			return {
// 				...state,
// 				allProjects: [action.payload.project, ...state.allProjects],
// 				currentProject: action.payload.project,
// 			};

// 		case UPDATE_PROJECT:
// 			return {
// 				...state,
// 				allProjects: state.allProjects.map((project) =>
// 					project.id === action.payload.project.id
// 						? action.payload.project
// 						: project,
// 				),
// 				currentProject: action.payload.project,
// 			};

// 		case DELETE_PROJECT:
// 			return {
// 				...state,
// 				allProjects: state.allProjects.filter(
// 					(project) => project.id !== action.payload.id,
// 				),
// 				currentProject:
// 					state.currentProject?.id === action.payload.id
// 						? null
// 						: state.currentProject,
// 			};

// 		default:
// 			return state;
// 	}
// }

export default function useProjects() {
	// const [projects, dispatch] = useReducer(projectReducer, initialProjects);
	const [projects, setProjects] = useState<ProjectWithUserInfo[]>([]);
	const [currentProject, setCurrentProject] =
		useState<ProjectWithUserInfo | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProjects = async (params?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		paymentStatus?: string;
		sortField?: string;
		sortDirection?: string;
	}) => {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.get("/projects", { params });

			if (data) {
				setProjects(data.projects);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchSingleProject = async (id: string) => {
		setLoading(true);
		try {
			const {
				data: { data },
			} = await api.get(`/projects/${id}`);
			if (data) {
				setCurrentProject(data.project);
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
			setProjects([data.project, ...projects]);
		} catch (error) {
			console.error(error);
			throw (error as AxiosError<AxiosResponseError>).response?.data.error;
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
			setProjects(projects.map(project => project.id === id ? data.project : project));
			setCurrentProject(data.project);
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
			setProjects(projects.filter(project => project.id !== id));
			setCurrentProject(null);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return {
		projects,
		currentProject,
		loading,
		fetchProjects,
		fetchSingleProject,
		createProject,
		updateProject,
		deleteProject,
	};
}
