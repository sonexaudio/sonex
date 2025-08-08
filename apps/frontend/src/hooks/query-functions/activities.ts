import api from "../../lib/axios";

export async function fetchActivities(projectId: string) {
    const { data } = await api.get(`/projects/${projectId}/activities`);
    return data.data.activities; // returns an array of activities
}