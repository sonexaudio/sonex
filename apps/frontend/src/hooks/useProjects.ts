import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createProject,
	deleteProject,
	fetchProjects,
	updateProject,
} from "./query-functions/projects";
import type { Project } from "../types/projects";
import { useAuth } from "./useAuth";

type ProjectQueryParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	paymentStatus?: string;
	sortField?: string;
	sortDirection?: string;
};

export default function useProjects(params?: ProjectQueryParams) {
	const queryClient = useQueryClient();
	const { user } = useAuth()

	// Get all projects
	const projectsQuery = useQuery({
		queryKey: ["projects", params],
		queryFn: () => fetchProjects(params),
		enabled: !!user
	});

	// Create a new project
	const create = useMutation({
		mutationFn: createProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});

	// Update a project
	const update = useMutation<Project, unknown, { id: string; projectData: Partial<Project>; }>({
		mutationFn: ({ id, projectData }) => updateProject(id, projectData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});

	// Delete a project
	const deleteById = useMutation<string, unknown, { id: string; }>({
		mutationFn: ({ id }) => deleteProject(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});

	// const fetchSingleProject = async (id: string) => {
	// 	setLoading(true);
	// 	try {
	// 		const {
	// 			data: { data },
	// 		} = await api.get(`/projects/${id}`);
	// 		if (data) {
	// 			setCurrentProject(data.project);
	// 		}
	// 	} catch (error) {
	// 		console.error(error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const createProject = async (projectData: Partial<Project>) => {
	// 	setLoading(true);
	// 	try {
	// 		const {
	// 			data: { data },
	// 		} = await api.post("/projects", projectData);
	// 		setProjects([data.project, ...projects]);
	// 	} catch (error) {
	// 		console.error(error);
	// 		throw (error as AxiosError<AxiosResponseError>).response?.data.error;
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const updateProject = async (id: string, projectData: Partial<Project>) => {
	// 	setLoading(true);
	// 	try {
	// 		const {
	// 			data: { data },
	// 		} = await api.put(`/projects/${id}`, projectData);
	// 		setProjects(projects.map(project => project.id === id ? data.project : project));
	// 		setCurrentProject(data.project);
	// 	} catch (error) {
	// 		console.error(error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const deleteProject = async (id: string) => {
	// 	setLoading(true);
	// 	try {
	// 		await api.delete(`/projects/${id}`);
	// 		setProjects(projects.filter(project => project.id !== id));
	// 		setCurrentProject(null);
	// 	} catch (error) {
	// 		console.error(error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return {
		// List of projects
		projects: projectsQuery.data?.projects ?? [],
		pagination: projectsQuery.data?.pagination,

		// Mutations
		createProject: create.mutateAsync,
		updateProject: update.mutateAsync,
		deleteProject: deleteById.mutateAsync,

		// Loading states
		projectsLoading: projectsQuery.isLoading,
		isCreating: create.isPending,
		isUpdating: update.isPending,
		isLoading: projectsQuery.isLoading || create.isPending || update.isPending,
		isSuccess: projectsQuery.isSuccess && !create.isPending && !update.isPending && !deleteById.isPending,
		isDeleting: deleteById.isPending,

		// Error states
		isError: projectsQuery.isError || create.isError || update.isError || deleteById.isError,
		createError: create.error as string | null,
		updateError: update.error as string | null,
		deleteError: deleteById.error as string | null,
	};
}
