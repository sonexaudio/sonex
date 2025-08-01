import type { Client } from "../../hooks/useClients";
import type { User } from "../users";

export const GET_ALL_PROJECTS = "getAllProjects";
export const GET_SINGLE_PROJECT = "getSingleProject";
export const CREATE_PROJECT = "createProject";
export const UPDATE_PROJECT = "updateProject";
export const DELETE_PROJECT = "deleteProject";

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
	fileCount?: number;
	clientCount?: number;
	shareCode: string;
}

export interface ProjectWithUserInfo extends Project {
	user: Pick<User, "id" | "firstName" | "email">;
}

interface ProjectClient {
	id: string;
	clientId: string;
	projectId: string;
	canView: boolean;
	canComment: boolean;
	canUpload: boolean;
	canDownload: boolean;
	isBlocked: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
	client: Client;
}

export interface DetailedProject extends Project {
	// gonna be
	clients: ProjectClient[];
}

export interface PaginationInfo {
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedProjectsResponse {
	projects: Project[];
	pagination: PaginationInfo;
}

export type ProjectState = {
	allProjects: Project[];
	currentProject: Project | ProjectWithUserInfo | null;
	pagination: PaginationInfo | null;
};

export type ProjectReducerAction =
	| {
		type: typeof GET_ALL_PROJECTS;
		payload: { projects: Project[]; pagination?: PaginationInfo; };
	}
	| {
		type: typeof GET_SINGLE_PROJECT;
		payload: { project: ProjectWithUserInfo; };
	}
	| {
		type: typeof CREATE_PROJECT;
		payload: { project: Project; };
	}
	| {
		type: typeof UPDATE_PROJECT;
		payload: { project: Project; };
	}
	| {
		type: typeof DELETE_PROJECT;
		payload: { id: string; };
	};
