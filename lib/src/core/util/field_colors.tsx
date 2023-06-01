import { Theme } from "@mui/material";

export const fieldBackground = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(238 238 240)" : "rgb(39 39 41)";
export const fieldBackgroundHover = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(232 232 234)" : "rgb(49,49,50)";
export const fieldBackgroundDisabled = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(224 224 226)" : "rgb(47 47 49)";
export const fieldBackgroundSubtleHover = (theme: Theme) =>
    theme.palette.mode === "light" ? "rgb(248 248 249)" : "rgb(21 21 23)";
