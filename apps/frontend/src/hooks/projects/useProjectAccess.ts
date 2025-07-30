/* 
This hook determines the Access Level of a User, Client, or undetermined Visitor. Will even check if a Client and even User is unauthorized (via being blocked).
*/

import { useCallback, useEffect, useState } from "react";
import type { DetailedProject } from "../../types/projects";

interface ProjectAccessParams {
    userId?: string;
    clientEmail?: string;
    project: DetailedProject | null;
}

export type AccessLevel = "OWNER" | "CLIENT" | "UNAUTHORIZED" | "UNKNOWN";

export function useProjectAccess(params: ProjectAccessParams) {
    const { userId, clientEmail, project } = params;

    const [accessLevel, setAccessLevel] = useState<AccessLevel>("UNKNOWN");

    const determineAccessLevel = () => {
        if (!project) {
            return "UNKNOWN";
        }

        if (userId === project?.userId) {
            return "OWNER";
        }

        const clientEmails = project.clients.map(client => client.client.email);
        console.log("CLIENT EMAILS", clientEmails);

        if (clientEmail && clientEmails.includes(clientEmail)) {
            console.log("CLIENT EMAIL MATCHES PROJECT CLIENTS", { clientEmail, projectClients: project.clients });
            return "CLIENT";
        }

        // Can't determine access level, return UNKNOWN for prompting the user to log in or access the project
        return "UNKNOWN";
    };

    // const accessLevel: AccessLevel = useMemo(() => {
    //     return determineAccessLevel();
    // }, [userId, clientEmail, project]);

    // Change access level function
    const changeAccessLevel = useCallback((level: AccessLevel) => {
        setAccessLevel(level);
    }, []);

    // set access level upon load
    useEffect(() => {
        console.log("Checking access level:", { project, userId, clientEmail });
        if (!project) return;
        setAccessLevel(determineAccessLevel());
    }, [project, userId, clientEmail]);

    return { accessLevel, determineAccessLevel, changeAccessLevel };
}