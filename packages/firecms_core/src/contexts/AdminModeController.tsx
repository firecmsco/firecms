import React from "react";
import { AdminModeController } from "../hooks";

const DEFAULT_ADMIN_MODE_STATE: AdminModeController = {
    mode: "editor",
    setMode: (mode: "developer" | "editor") => {
    },
};
export const AdminModeControllerContext = React.createContext<AdminModeController>(DEFAULT_ADMIN_MODE_STATE);

export const AdminModeControllerProvider = AdminModeControllerContext.Provider;
