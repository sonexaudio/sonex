import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectProvider";

export const useProjectContext = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx)
        throw new Error("useProjectContext must be used within ProjectProvider");
    return ctx;
};