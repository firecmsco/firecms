import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { CollectionSize } from "../../models";


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
            boxSizing: "border-box",
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
                    case "xs":
                        return theme.spacing(0);
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
            border: `2px solid ${theme.palette.primary.dark}`
        },
        disabled: {
            alpha: 0.8
        }
    })
);


export const useInputStyles = makeStyles<Theme>(theme => createStyles({
        input: {
            padding: 0,
            margin: 0,
            width: "100%",
            color: "unset",
            fontWeight: "unset",
            lineHeight: "unset",
            fontSize: "unset",
            fontFamily: "unset",
            background: "unset",
            border: "unset",
            resize: "none",
            outline: "none"
        },
        select: {
            height: "100%"
        },
        hidden: {
            display: "none"
        },
        selectRoot: {
            display: "flex",
            alignItems: "center",
            height: "100%"
        },
        numberInput: {
            textAlign: "right"
        }
    })
);
