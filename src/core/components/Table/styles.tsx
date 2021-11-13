import React from "react";
import { alpha, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { TableSize } from "./TableProps";


export const useTableStyles = makeStyles<Theme>(theme => createStyles({
    tableContainer: {
        width: "100%",
        height: "100%",
        flexGrow: 1
    },
    headerTypography: {
        fontSize: "0.750rem",
        fontWeight: 600,
        textTransform: "uppercase"
    },
    header: {
        width: "calc(100% + 24px)",
        margin: "0px -12px",
        padding: "0px 12px",
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: "100%",
        fontSize: "0.750rem",
        textTransform: "uppercase",
        fontWeight: 600
    },
    tableRow: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem"
    },
    tableRowClickable: {
        "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, .6) : alpha(theme.palette.background.default, .5)
        }
    },
    column: {
        padding: "0px !important"
    },
    cellButtonsWrap: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, .8) : alpha(theme.palette.background.default, .8)
    },
    cellButtons: {
        minWidth: 138
    },
    cellButtonsId: {
        width: 138,
        textAlign: "center",
        textOverflow: "ellipsis",
        overflow: "hidden"
    }
}));

export interface CellStyleProps {
    size: TableSize;
    align: "right" | "left" | "center";
}

export const useCellStyles = makeStyles<Theme, CellStyleProps & { disabled: boolean }>(theme => createStyles({
        tableCell: {
            position: "relative",
            height: "100%",
            width: "100%",
            border: "2px solid transparent",
            borderRadius: 4,
            overflow: "hidden",
            contain: "strict",
            display: "flex",
            padding: ({ size }) => {
                switch (size) {
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    case "m":
                        return theme.spacing(1);
                    case "s":
                        return theme.spacing(0.5);
                    default:
                        return theme.spacing(0.25);
                }
            },
            "&:hover": {
                backgroundColor: ({ disabled }: any) => disabled ? undefined : (theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default)
            },
            justifyContent: ({ align }) => {
                switch (align) {
                    case "right":
                        return "flex-end";
                    case "center":
                        return "center";
                    case "left":
                    default:
                        return "flex-start";
                }
            }
        },
        fullWidth: {
            width: "100%"
        },
        error: {
            border: `2px solid ${theme.palette.error.light} !important`
        },
        selected: {
            backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default,
            border: "2px solid #5E9ED6",
            transition: "border-color 300ms ease-in-out"
        },
        saved: {
            border: `2px solid ${theme.palette.success.light}`
        },
        disabled: {
            alpha: 0.8
        },
        iconsTop: {
            position: "absolute",
            top: 2,
            right: 2
        },
        arrow: {
            color: theme.palette.error.light
        },
        tooltip: {
            margin: "0 8px",
            backgroundColor: theme.palette.error.light
        },
        centered: {
            alignItems: "center"
        },
        faded: {
            "-webkit-mask-image": "linear-gradient(to bottom, black 60%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            alignItems: "start"
        },
        scrollable: {
            overflow: "auto",
            alignItems: "start"
        }
    })
);

