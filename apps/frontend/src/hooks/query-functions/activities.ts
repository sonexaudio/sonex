import api from "../../lib/axios";

export async function fetchActivities(userId?: string, projectId?: string) {
    const url = projectId ? `/projects/${projectId}/activities` : `users/${userId}/activities`;
    const { data } = await api.get(url);
    return data.data.activities; // returns an array of activities
}