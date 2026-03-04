import React from "react";
import { AdminModeController } from "../hooks";

const DEFAULT_ADMIN_MODE_STATE: AdminModeController = {
    mode: "content",
    setMode: (mode: "content" | "studio" | "settings") => {
    },
};
export const AdminModeControllerContext = React.createContext<AdminModeController>(DEFAULT_ADMIN_MODE_STATE);

export const AdminModeControllerProvider = AdminModeControllerContext.Provider;
