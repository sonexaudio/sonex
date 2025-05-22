import { useReducer, useState } from "react";
import api from "../lib/axios";
import type { User } from "./useUser";

const GET_ALL_PROJECTS = "getAllProjects";
const GET_SINGLE_PROJECT = "getSingleProject";
const CREATE_PROJECT = "createProject";
const UPDATE_PROJECT = "updateProject";
const DELETE_PROJECT = "deleteProject";

type ProjectState = {
	allProjects: Project[];
	currentProject: Project | ProjectWithUserInfo | null;
};

export interface Project {
	id: string;
	title: string;
	description?: string | null;
	userId: string;
	amount?: number | null;
	dueDate?: string | Date | null;
	status?: string;
	paymentStatus?: string;
	createdAt?: string | Date | undefined;
	updatedAt?: string | Date | undefined;
}

export interface ProjectWithUserInfo extends Project {
	user: Pick<User, "id" | "firstName" | "email">;
}

const initialProjects: ProjectState = {
	allProjects: [],
	currentProject: null,
};

type ProjectReducerAction =
	| {
			type: typeof GET_ALL_PROJECTS;
			payload: { projects: Project[] };
	  }
	| {
			type: typeof GET_SINGLE_PROJECT;
			payload: { project: ProjectWithUserInfo };
	  }
	| {
			type: typeof CREATE_PROJECT;
			payload: { project: Project };
	  }
	| {
			type: typeof UPDATE_PROJECT;
			payload: { project: Project };
	  }
	| {
			type: typeof DELETE_PROJECT;
			payload: { id: string };
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
		} catch (error) {
			console.error(error);
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
