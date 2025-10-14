import React from "react";
import { InternalUserManagement, NavigationController } from "../types";

export const InternalUserManagementContext = React.createContext<InternalUserManagement<any>>({} as InternalUserManagement);
