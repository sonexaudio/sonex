import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "./query-functions/activities";

// SonexActivity type based on Prisma schema, using generics for metadata
export interface SonexActivity<T = unknown> {
    id: string;
    userId: string;
    action: string;
    metadata?: T;
    targetType: string;
    targetId?: string | null;
    createdAt: string;
    user?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email: string;
        // Add more User fields if needed
    };
}


export function useActivities(projectId?: string) {
    // Fetch activities for a project
    const activitiesQuery = useQuery<SonexActivity[]>({
        queryKey: ["activities", projectId],
        queryFn: () => fetchActivities(projectId!),
        enabled: !!projectId,
    });

    return {
        activities: activitiesQuery.data || [],
        isLoading: activitiesQuery.isLoading,
        error: activitiesQuery.error,
    };
}