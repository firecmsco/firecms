import React from "react";
import { InternalUserManagement } from "@firecms/types";

export const InternalUserManagementContext = React.createContext<InternalUserManagement<any>>({} as InternalUserManagement);
