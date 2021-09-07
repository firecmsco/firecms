import React from "react";
import { Theme } from "@mui/material";


import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";


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
        },
        arrayItem: {
            margin: theme.spacing(0.5)
        }
    })
);
