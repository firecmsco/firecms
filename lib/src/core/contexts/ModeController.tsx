import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { ModeController } from "../../hooks";

const DEFAULT_MODE_STATE: ModeController = {
    mode: "light",
    setMode: (mode: "light" | "dark") => {
    },
    toggleMode: () => {
    }
};
export const ModeStateContext = React.createContext<ModeController>(DEFAULT_MODE_STATE);
