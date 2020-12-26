import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { CollectionSize } from "../models";


export interface StyleProps {
    size: CollectionSize;
    align: "right" | "left" | "center";
}

export const useCellStyles = makeStyles<Theme, StyleProps & { disabled: boolean }>(theme => createStyles({
        tableCell: {
            position: "relative",
            height: "100%",
            width: "100%",
            border: "2px solid transparent",
            borderRadius: 4,
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
            },
            padding: ({ size }) => {
                switch (size) {
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    default:
                        return theme.spacing(1);
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
        selected2: {
            border: "2px solid -webkit-focus-ring-color"
            // border: `2px solid ${theme.palette.primary.dark}`
        },
        disabled: {
            alpha: 0.8
        },
        expandIcon: {
            position: "absolute",
            bottom: 0,
            right: 0
        }
    })
);

