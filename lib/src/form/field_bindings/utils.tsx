import { Theme } from "@mui/material";

export const fieldBackground = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(240 240 240)" : "rgb(39 39 41)";
export const fieldBackgroundHover = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(232 232 232)" : "rgb(49,49,50)";
