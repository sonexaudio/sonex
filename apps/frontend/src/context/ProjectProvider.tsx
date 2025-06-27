import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProjectWithUserInfo } from "../types/projects";
import { useParams } from "react-router";
import useProjects from "../hooks/useProjects";

type ProjectContextValue = {
    project: ProjectWithUserInfo | null;
    loading: boolean;
    refreshProject: () => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const useProjectContext = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error("useProjectContext must be used within ProjectProvider");
    return ctx;
};

export const ProjectProvider = ({ children }: { children: ReactNode; }) => {
    const { id } = useParams();
    const {
        getSingleProject,
        state: { currentProject },
        loading
    } = useProjects();

    const [hasFetched, setHasFetched] = useState(false);

    const refreshProject = async () => {
        if (id) {
            getSingleProject(id);
        }
    };

    useEffect(() => {
        if (id && !hasFetched) {
            refreshProject();
            setHasFetched(true);
        }
    }, [id]);

    const value = useMemo(
        () => ({
            project: currentProject as ProjectWithUserInfo | null,
            loading,
            refreshProject,
        }),
        [currentProject, loading]
    );

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};