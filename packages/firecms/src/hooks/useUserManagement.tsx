import React, { useContext } from "react";
import { ProjectConfig } from "./useBuildProjectConfig";

export const ProjectConfigContext = React.createContext({} as ProjectConfig);

export const useProjectConfig = () => useContext<ProjectConfig>(ProjectConfigContext);

export function ProjectConfigProvider({ children, config }: { children: React.ReactNode, config: ProjectConfig }) {
    return <ProjectConfigContext.Provider value={config}>
        {children}
    </ProjectConfigContext.Provider>;
}
