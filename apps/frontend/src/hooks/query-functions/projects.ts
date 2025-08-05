import api from "../../lib/axios";
import type { Project } from "../../types/projects";

type ProjectQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    sortField?: string;
    sortDirection?: string;
};

export async function fetchProjects(params?: ProjectQueryParams) {
    const { data } = await api.get("/projects", { params });
    return data.data; // returns {projects, pagination info}
};

export async function createProject(projectData: Partial<Project>) {
    const { data } = await api.post("/projects", projectData);
    return data.data.project as Project;
}

export async function updateProject(id: string, projectData: Partial<Project>) {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data.data.project as Project;
}

export async function deleteProject(id: string) {
    await api.delete(`/projects/${id}`);
    return id;
}