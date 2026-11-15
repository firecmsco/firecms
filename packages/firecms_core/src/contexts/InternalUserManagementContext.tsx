import React from "react";
import { InternalUserManagement, NavigationController } from "../types/index.js";

export const InternalUserManagementContext = React.createContext<InternalUserManagement<any>>({} as InternalUserManagement);
