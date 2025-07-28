/* 
This hook determines the Access Level of a User, Client, or undetermined Visitor. Will even check if a Client and even User is unauthorized (via being blocked).
*/

import { useMemo } from "react";
import type { DetailedProject } from "../../types/projects";

interface ProjectAccessParams {
    userId?: string;
    clientEmail?: string;
    project: DetailedProject | null;
}

export type AccessLevel = "OWNER" | "CLIENT" | "UNAUTHORIZED" | "UNKNOWN";

export function useProjectAccess(params: ProjectAccessParams): AccessLevel {
    const { userId, clientEmail, project } = params;

    const accessLevel: AccessLevel = useMemo(() => {
        if (!project) {
            return "UNAUTHORIZED";
        }

        if (userId === project.userId) {
            return "OWNER";
        }

        if (clientEmail && project.clients?.some((client => client.email === clientEmail))) {
            return "CLIENT";
        }

        // Can't determine access level, return UNKNOWN for prompting the user to log in or access the project
        return "UNKNOWN";
    }, [userId, clientEmail, project]);

    return accessLevel;
}