import React from "react";
import { UserManagementDelegate } from "@rebasepro/types";

export const InternalUserManagementContext = React.createContext<UserManagementDelegate<any> | undefined>(undefined);
