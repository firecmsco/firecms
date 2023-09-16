import React, { useContext } from "react";
import { SaasProjectConfig } from "./useBuildSaasProjectConfig";

export const ProjectConfigContext = React.createContext({} as SaasProjectConfig);

export const useProjectConfig = () => useContext<SaasProjectConfig>(ProjectConfigContext);
