import { useEffect, useReducer, useRef, useState } from "react";
import api from "../lib/axios";
import type { User } from "./useUser";

const GET_ALL_PROJECTS = "getAllProjects";
const GET_SINGLE_PROJECT = "getSingleProject";
const CREATE_PROJECT = "createProject";
const UPDATE_PROJECT = "updateProject";
const DELETE_PROJECT = "deleteProject";

export interface Project {
	id: string;
	title: string;
	description?: string | null;
	userId: string;
	amount?: number | null;
	dueDate?: string | null;
	status?: string;
	paymentStatus?: string;
	createdAt?: string | Date | undefined;
	updatedAt?: string | Date | undefined;
}

export interface ProjectWithUserInfo extends Project {
	user: Pick<User, "id" | "firstName" | "email">;
}

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

		case UPDATE_PROJECT: {
			return {
				...state,
				allProjects: state.allProjects.map((project) =>
					project.id === payload.data.project.id
						? payload.data.project
						: project,
				),
				currentProject: payload.data.project,
			};
		}

		case DELETE_PROJECT:
			return {
				...state,
				allProjects: state.allProjects.filter(
					(project) => project.id !== payload.data.project.id,
				),
				currentProject:
					state.currentProject?.id === payload.data.project.id
						? {}
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

	const createProject = async (projectData: any) => {
		setLoading(true);
		try {
			const { data } = await api.post("/projects", projectData);
			dispatch({ type: CREATE_PROJECT, payload: data });
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const updateProject = async (id: string, projectData: any) => {
		setLoading(true);
		try {
			const { data } = await api.patch(`/projects/${id}`, projectData);
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
			const { data } = await api.delete(`/projects/${id}`);
			dispatch({ type: DELETE_PROJECT, payload: data });
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
