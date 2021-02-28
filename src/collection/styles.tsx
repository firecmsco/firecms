import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { CollectionSize } from "../models";

export interface TableStyleProps {
    size: CollectionSize;
}

export const useTableStyles = makeStyles<Theme, TableStyleProps>(theme => createStyles({
    root: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },
    tableContainer: {
        width: "100%",
        height: "100%",
        flexGrow: 1
    },
    header: {
        display: "flex",
        flexDirection: "row",
        fontWeight: theme.typography.fontWeightMedium,
        lineHeight: "0.9rem",
        alignItems: "center",
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    tableRow: {
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem"
    },
    tableRowClickable: {
        cursor: "pointer"
    },
    column: {
        padding: "0px !important"
    },
    selected: {
        backgroundColor: "#eee",
        border: `2px solid ${theme.palette.primary.dark}`,
        padding: theme.spacing(2)
    },
    headerItem: {
        display: "inherit",
        paddingRight: theme.spacing(1)
    },
    cellButtonsWrap: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
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
    size: CollectionSize;
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
                backgroundColor: ({ disabled }) => disabled ? undefined : "#eee"
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
        error: {
            border: `2px solid ${theme.palette.error.light} !important`
        },
        selected: {
            backgroundColor: "#f9f9f9",
            border: "2px solid #5E9ED6"
        },
        disabled: {
            alpha: 0.8
        },
        expandIcon: {
            position: "absolute",
            bottom: 0,
            right: 0
        },
        arrow: {
            color: "#ff1744"
        },
        tooltip: {
            margin: "0 8px",
            backgroundColor: "#ff1744"
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

